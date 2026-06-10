const { GoogleGenerativeAI } = require('@google/generative-ai');
const { callWithRetry, parseSafeJSON } = require('../utils/geminiHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a senior technical recruiter and talent assessment expert with 20+ years of experience.
Your task is to evaluate how well a candidate's resume matches a job description.
You MUST return ONLY valid JSON — no markdown, no code fences, no explanations whatsoever.
All scores must be integers between 0 and 100.`;

const buildMatchPrompt = (jobData, resumeData) => `
Evaluate how well this candidate matches the job description. Return ONLY a valid JSON object.

=== JOB DESCRIPTION (Structured) ===
${JSON.stringify(jobData, null, 2)}

=== CANDIDATE RESUME (Structured) ===
${JSON.stringify(resumeData, null, 2)}

=== SCORING INSTRUCTIONS ===

Return this exact JSON structure with no extra text:

{
  "overallScore": <integer 0-100, weighted average of sub-scores>,
  "skillMatchScore": <integer 0-100>,
  "experienceMatchScore": <integer 0-100>,
  "educationMatchScore": <integer 0-100>,
  "strengths": [
    "<specific strength with evidence from resume>",
    "<another strength>"
  ],
  "skillGaps": [
    "<required skill or experience the candidate is missing>",
    "<another gap>"
  ],
  "risks": [
    "<potential risk or concern about hiring this candidate>",
    "<another risk if applicable>"
  ],
  "recommendation": "<2-3 sentence hiring recommendation that justifies the overall score and hiring decision>",
  "hiringDecision": "<exactly one of: Strong Hire | Hire | Maybe | No Hire>"
}

=== SCORING RUBRIC ===

skillMatchScore (weight: 50%):
  90-100: Candidate has all mandatory skills + most good-to-have
  70-89: Has 80%+ mandatory skills
  50-69: Has 60-79% mandatory skills
  30-49: Has 40-59% mandatory skills
  0-29: Has <40% mandatory skills

experienceMatchScore (weight: 30%):
  90-100: Experience exceeds or perfectly matches requirement
  70-89: Experience is within 1 year of requirement
  50-69: Experience is 1-2 years short
  30-49: Experience is 2-3 years short
  0-29: Severely underqualified or overqualified (>3 years off)

educationMatchScore (weight: 20%):
  90-100: Exceeds education requirements (higher degree or relevant field)
  70-89: Meets education requirements exactly
  50-69: Partially meets (different field but same level)
  30-49: Lower degree than required
  0-29: No relevant education

overallScore: Round((skillMatchScore * 0.5) + (experienceMatchScore * 0.3) + (educationMatchScore * 0.2))

hiringDecision:
  85-100: "Strong Hire"
  70-84: "Hire"  
  50-69: "Maybe"
  0-49: "No Hire"

strengths: 3-5 specific, evidence-backed strengths from the resume
skillGaps: list every mandatory skill the candidate lacks; empty array [] if none
risks: 1-3 genuine risks (overqualified, job-hopping, career gap, etc.); empty [] if none
recommendation: actionable, specific, balanced — not generic

Return ONLY the JSON. No preamble. No trailing text.`;

const matchCandidateWithGemini = async (jobData, resumeData) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.15,
      topP: 0.85,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const result = await callWithRetry(() => model.generateContent(buildMatchPrompt(jobData, resumeData)));
  const raw = result.response.text().trim();
  const parsed = parseSafeJSON(raw);

  // Clamp scores to valid range and normalise fields
  const clamp = (v) => Math.min(100, Math.max(0, Math.round(Number(v) || 0)));

  const VALID_DECISIONS = ['Strong Hire', 'Hire', 'Maybe', 'No Hire'];
  const rawDecision = String(parsed.hiringDecision || '');
  const hiringDecision = VALID_DECISIONS.includes(rawDecision) ? rawDecision : '';

  return {
    overallScore: clamp(parsed.overallScore),
    skillMatchScore: clamp(parsed.skillMatchScore),
    experienceMatchScore: clamp(parsed.experienceMatchScore),
    educationMatchScore: clamp(parsed.educationMatchScore),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps.map(String) : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
    recommendation: String(parsed.recommendation || ''),
    hiringDecision,
  };
};

module.exports = { matchCandidateWithGemini };
