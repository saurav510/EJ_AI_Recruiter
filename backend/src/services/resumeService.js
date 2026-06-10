const { GoogleGenerativeAI } = require('@google/generative-ai');
const { callWithRetry, parseSafeJSON } = require('../utils/geminiHelper');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Text extraction ──────────────────────────────────────────────────────────

const extractTextFromPDF = async (buffer) => {
  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text?.trim();
    if (!text || text.length < 50) {
      throw new Error('PDF appears to be empty or image-only. Please upload a text-based PDF.');
    }
    return text;
  } catch (err) {
    console.error('[PDF Extraction Error]:', err);
    if (err.message && (err.message.includes('image-only') || err.message.includes('empty'))) {
      throw err;
    }
    throw new Error(`Failed to extract text from PDF: ${err.message || 'The file may be corrupted or password-protected.'}`);
  }
};

const extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();
    if (!text || text.length < 50) {
      throw new Error('DOCX file appears to be empty.');
    }
    return text;
  } catch (err) {
    if (err.message.includes('empty')) throw err;
    throw new Error('Failed to extract text from DOCX. The file may be corrupted.');
  }
};

const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }
  return extractTextFromDOCX(buffer);
};

// ─── Gemini Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert resume parser and HR analyst.
Your task is to extract structured information from the provided resume text.
You MUST return ONLY valid JSON — no markdown, no code fences, no explanations.
Use empty string "" for missing string fields, 0 for missing numbers, and empty array [] for missing arrays.`;

const buildPrompt = (resumeText) => `Parse the following resume and return ONLY a valid JSON object with exactly these fields:

{
  "candidateName": "full name as written",
  "email": "email address",
  "phone": "phone number with country code if present",
  "location": "city, state/country",
  "experienceYears": <number — total years of professional experience>,
  "currentCompany": "most recent / current employer",
  "currentRole": "most recent / current job title",
  "skills": ["array", "of", "technical and soft skills"],
  "education": [
    {
      "degree": "degree name e.g. B.Tech, MBA",
      "field": "field of study e.g. Computer Science",
      "institution": "university or college name",
      "year": "graduation year or range"
    }
  ],
  "certifications": ["array of certification names"],
  "projects": [
    {
      "name": "project name",
      "description": "1-2 sentence description",
      "technologies": ["tech", "stack"],
      "url": "github or live url if mentioned"
    }
  ],
  "summary": "2-3 sentence professional summary derived from the resume"
}

Rules:
- experienceYears: calculate from work history dates, return as a number (e.g. 5 or 3.5)
- skills: include both technical tools and soft skills, deduplicated
- education: most recent first
- projects: include personal, academic, and open-source projects mentioned
- summary: synthesize a concise professional summary — don't copy verbatim

Resume Text:
---
${resumeText}
---

Return ONLY the JSON object. No other text.`;

// ─── Gemini call ─────────────────────────────────────────────────────────────

const parseResumeWithGemini = async (resumeText) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const result = await callWithRetry(() => model.generateContent(buildPrompt(resumeText)));
  const raw = result.response.text().trim();
  const parsed = parseSafeJSON(raw);

  // Normalise and type-coerce each field
  return {
    candidateName: String(parsed.candidateName || ''),
    email: String(parsed.email || ''),
    phone: String(parsed.phone || ''),
    location: String(parsed.location || ''),
    experienceYears: Number(parsed.experienceYears) || 0,
    currentCompany: String(parsed.currentCompany || ''),
    currentRole: String(parsed.currentRole || ''),
    skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((e) => ({
          degree: String(e.degree || ''),
          field: String(e.field || ''),
          institution: String(e.institution || ''),
          year: String(e.year || ''),
        }))
      : [],
    certifications: Array.isArray(parsed.certifications)
      ? parsed.certifications.map(String)
      : [],
    projects: Array.isArray(parsed.projects)
      ? parsed.projects.map((p) => ({
          name: String(p.name || ''),
          description: String(p.description || ''),
          technologies: Array.isArray(p.technologies) ? p.technologies.map(String) : [],
          url: String(p.url || ''),
        }))
      : [],
    summary: String(parsed.summary || ''),
  };
};

module.exports = { extractText, parseResumeWithGemini };
