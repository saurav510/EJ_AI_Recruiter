const { GoogleGenerativeAI } = require('@google/generative-ai');
const { callWithRetry, parseSafeJSON } = require('../utils/geminiHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a senior technical recruiter and interview coach with 20+ years of experience.
Your task is to generate a structured interview question set tailored to a specific candidate and role.
You MUST return ONLY valid JSON — no markdown, no code fences, no explanations.
Generate exactly 5 questions per category.`;

const buildInterviewPrompt = (jobData, candidateData, matchData) => `
Generate a targeted interview question set for this candidate-role pair.

=== JOB DESCRIPTION ===
${JSON.stringify(jobData, null, 2)}

=== CANDIDATE PROFILE ===
${JSON.stringify(candidateData, null, 2)}

=== MATCH ANALYSIS ===
${JSON.stringify(matchData, null, 2)}

=== INSTRUCTIONS ===
Return ONLY this exact JSON structure with no extra text:

{
  "technicalQuestions": [
    {
      "question": "<specific technical question relevant to the role and candidate's background>",
      "difficulty": "<Easy|Medium|Hard>",
      "evaluationCriteria": [
        "<what to look for in a good answer — be specific>",
        "<another criterion>",
        "<third criterion>"
      ],
      "followUpQuestions": [
        "<a natural follow-up probe>",
        "<another follow-up>"
      ],
      "expectedAnswer": "<brief summary of what a strong answer should contain>"
    }
  ],
  "behavioralQuestions": [ <same structure × 5> ],
  "scenarioQuestions": [ <same structure × 5> ],
  "skillGapQuestions": [ <same structure × 5> ]
}

=== QUESTION GENERATION RULES ===

technicalQuestions (5 total):
- Probe depth of knowledge in the MANDATORY skills listed in the JD
- Include at least 1 architecture/system design question for senior roles
- Scale difficulty based on seniorityLevel (Junior → mostly Easy/Medium, Senior/Lead → mostly Medium/Hard)
- Reference the candidate's listed skills to make questions specific, not generic

behavioralQuestions (5 total):
- Use the STAR method context (Situation, Task, Action, Result)
- At least 2 must address the STRENGTHS identified in the match analysis
- At least 1 must probe a RISK identified in the match analysis
- Examples: leadership, conflict, failure, teamwork, communication

scenarioQuestions (5 total):
- Present realistic work situations the candidate will face in THIS role
- Include business context (industry: ${jobData.industry || 'technology'})
- Test problem-solving approach, not just knowledge
- At least 1 scenario should test handling of ambiguity

skillGapQuestions (5 total):
- Target EVERY skill gap from the match analysis: ${JSON.stringify(matchData?.skillGaps || [])}
- If fewer than 5 gaps exist, add questions about growth mindset and learning velocity
- These should feel supportive (candidate's plan to close the gap), not adversarial
- Evaluate self-awareness, initiative, and learning strategy

evaluationCriteria: 3 specific criteria per question — what distinguishes a 1/5 from a 5/5 answer.
followUpQuestions: 2 per question — digs deeper if the candidate gives a shallow answer.
expectedAnswer: 1-2 sentences summarizing what a strong answer should contain.
difficulty: calibrate to the role's seniorityLevel.

Return ONLY the JSON. No preamble. No trailing text.`;

const normaliseQuestion = (q) => ({
  question: String(q.question || ''),
  difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
  evaluationCriteria: Array.isArray(q.evaluationCriteria) ? q.evaluationCriteria.map(String) : [],
  followUpQuestions: Array.isArray(q.followUpQuestions) ? q.followUpQuestions.map(String) : [],
  expectedAnswer: String(q.expectedAnswer || ''),
});

const ensureFive = (arr) => {
  const normalised = (Array.isArray(arr) ? arr : []).map(normaliseQuestion);
  return normalised.slice(0, 5);
};

const generateInterviewQuestions = async (jobData, candidateData, matchData) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.4,  // slightly more creative for question variety
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const result = await callWithRetry(() =>
    model.generateContent(buildInterviewPrompt(jobData, candidateData, matchData))
  );
  const raw = result.response.text().trim();
  const parsed = parseSafeJSON(raw);

  return {
    technicalQuestions: ensureFive(parsed.technicalQuestions),
    behavioralQuestions: ensureFive(parsed.behavioralQuestions),
    scenarioQuestions: ensureFive(parsed.scenarioQuestions),
    skillGapQuestions: ensureFive(parsed.skillGapQuestions),
  };
};

module.exports = { generateInterviewQuestions };
