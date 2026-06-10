/**
 * Utility to identify transient errors that should be retried.
 * Retries on:
 * - HTTP status codes: 429 (Rate Limit), 500 (Internal Server Error), 502 (Bad Gateway), 503 (Service Unavailable), 504 (Gateway Timeout)
 * - Node.js network error codes (ECONNRESET, ETIMEDOUT, etc.)
 * - Known error message strings (e.g. "high demand", "temporary", "service unavailable", "try again later")
 *
 * @param {Error|any} error - The error to inspect
 * @returns {boolean} True if the error is considered transient and safe to retry
 */
const isTransientError = (error) => {
  if (!error) return false;

  // 1. Check HTTP status code if available (e.g. from GoogleGenerativeAIFetchError)
  const status = error.status || error.statusCode || error.status_code;
  if (status) {
    if ([429, 500, 502, 503, 504].includes(Number(status))) {
      return true;
    }
  }

  // 2. Check Node.js socket/network system error codes
  if (error.code) {
    const transientCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'ECONNREFUSED',
      'EHOSTUNREACH',
      'ENETUNREACH'
    ];
    if (transientCodes.includes(error.code)) {
      return true;
    }
  }

  // 3. Inspect message text for common transient error signatures
  const message = (error.message || String(error)).toLowerCase();
  const transientPatterns = [
    '503',
    '429',
    '500',
    'service unavailable',
    'too many requests',
    'high demand',
    'temporary',
    'quota',
    'rate limit',
    'timeout',
    'fetch failed',
    'network error',
    'try again later'
  ];

  return transientPatterns.some((pattern) => message.includes(pattern));
};

/**
 * Executes an asynchronous function with exponential backoff retries for transient errors.
 *
 * @param {Function} fn - The asynchronous function returning a Promise to execute
 * @param {number} maxRetries - Maximum number of retry attempts (default: 4)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise<any>} The result of the async function
 */
const callWithRetry = async (fn, maxRetries = 7, initialDelay = 1500) => {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isTransient = isTransientError(error);

      console.warn(`[Gemini Retry Helper] Attempt ${attempt}/${maxRetries} failed. Error: ${error.message || error}`);

      if (!isTransient || attempt === maxRetries) {
        console.error(`[Gemini Retry Helper] Non-transient error or maximum retries reached. Throwing error.`);
        throw error;
      }

      // Add small jitter to the delay to prevent synchronized retries
      const jitter = Math.random() * 200;
      const sleepTime = delay + jitter;
      console.log(`[Gemini Retry Helper] Transient error detected. Retrying in ${Math.round(sleepTime)}ms...`);
      
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
      delay *= 2; // Exponential backoff
    }
  }
};

/**
 * Repairs common LLM JSON syntax errors, specifically mismatched array endings
 * (where the model closes an array with } instead of ]).
 *
 * @param {string} str - The raw or cleaned JSON string
 * @returns {string} The repaired JSON string
 */
const repairJSONMismatches = (str) => {
  let fixed = str;
  const arrayFields = [
    'mandatorySkills',
    'goodToHaveSkills',
    'responsibilities',
    'education',
    'technicalQuestions',
    'behavioralQuestions',
    'scenarioQuestions',
    'skillGapQuestions',
    'skills',
    'certifications',
    'projects',
    'strengths',
    'skillGaps',
    'risks'
  ];

  for (const field of arrayFields) {
    // 1. Array field followed by comma (middle of object)
    const regex = new RegExp(`("${field}"\\s*:\\s*\\[[^\\]]*?)\\s*\\}\\s*(,\\s*\\n\\s*")`, 'g');
    fixed = fixed.replace(regex, '$1]$2');

    // 2. Array field followed by closing object brace (end of object)
    const lastRegex = new RegExp(`("${field}"\\s*:\\s*\\[[^\\]]*?)\\s*\\}\\s*(\\n\\s*\\})`, 'g');
    fixed = fixed.replace(lastRegex, '$1]$2');
  }

  return fixed;
};

/**
 * Automatically repairs truncated JSON strings by balancing unclosed braces and brackets
 * and closing any unterminated string literals.
 *
 * @param {string} str - The truncated JSON candidate
 * @returns {string} The balanced and syntactically valid JSON string
 */
const repairTruncatedJSON = (str) => {
  if (!str) return str;

  let fixed = '';
  let inString = false;
  let escape = false;
  const stack = [];

  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    
    if (escape) {
      escape = false;
      fixed += char;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      fixed += char;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      fixed += char;
      continue;
    }
    
    if (inString) {
      // Escape control characters that are invalid in JSON strings
      const code = char.charCodeAt(0);
      if (code <= 0x1F) {
        if (char === '\n') {
          fixed += '\\n';
        } else if (char === '\r') {
          fixed += '\\r';
        } else if (char === '\t') {
          fixed += '\\t';
        } else {
          // General escape for other control chars
          fixed += '\\u' + code.toString(16).padStart(4, '0');
        }
      } else {
        fixed += char;
      }
    } else {
      fixed += char;
      if (char === '{' || char === '[') {
        stack.push(char === '{' ? '}' : ']');
      } else if (char === '}' || char === ']') {
        const expected = stack[stack.length - 1];
        if (expected === char) {
          stack.pop();
        }
      }
    }
  }

  // Handle case where we end in the middle of an escape sequence
  if (escape) {
    fixed = fixed.slice(0, -1);
  }

  if (inString) {
    fixed += '"';
  }

  // Clean up any trailing comma right before we close brackets/braces
  const cleanFixed = fixed.trimEnd ? fixed.trimEnd() : fixed.trim();
  if (!inString && cleanFixed.endsWith(',')) {
    fixed = cleanFixed.slice(0, -1);
  }

  while (stack.length > 0) {
    const closeChar = stack.pop();
    fixed += closeChar;
  }
  
  return fixed;
};

/**
 * Safely extracts and parses JSON from a string that may contain markdown or preamble/conversational text.
 * Runs standard parsing, then runs a syntax repair mechanism, and falls back to outermost block extraction.
 *
 * @param {string} str - The raw response string from Gemini
 * @returns {any} The parsed JSON object
 * @throws {Error} if JSON cannot be parsed
 */
const parseSafeJSON = (str) => {
  if (!str) throw new Error('Response is empty');

  // Remove potential markdown code block wrappers
  let cleaned = str
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Attempt 1: Parse directly
  try {
    return JSON.parse(cleaned);
  } catch (directError) {
    // Attempt 2: Repair mismatched bracket syntax and try again
    let repaired = repairJSONMismatches(cleaned);
    try {
      return JSON.parse(repaired);
    } catch (repairError) {
      // Attempt 3: Repair truncated JSON structures
      repaired = repairTruncatedJSON(repaired);
      try {
        return JSON.parse(repaired);
      } catch (truncationError) {
        // Attempt 4: Extract the outermost {} block in case of preamble/postamble text
        const firstOpen = repaired.indexOf('{');
        const lastClose = repaired.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
          const jsonCandidate = repaired.substring(firstOpen, lastClose + 1);
          try {
            return JSON.parse(jsonCandidate);
          } catch (innerError) {
            console.error('[Safe JSON Parser] Extracted block parsing failed:', innerError);
          }
        }

        console.error('[Safe JSON Parser] Raw output could not be parsed as JSON:', str);
        throw new Error('Response does not contain valid JSON.');
      }
    }
  }
};

module.exports = {
  isTransientError,
  callWithRetry,
  parseSafeJSON
};
