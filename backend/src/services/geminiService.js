const { GoogleGenerativeAI } = require('@google/generative-ai');
const { callWithRetry, parseSafeJSON } = require('../utils/geminiHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an expert HR analyst and job description parser.
Your task is to analyze the provided job description and extract structured information.
You MUST return ONLY valid JSON — no markdown, no code fences, no explanations.
Use empty string "" for missing string fields and empty array [] for missing array fields.`;

const USER_PROMPT = (jd) => `Analyze the following job description and return ONLY a valid JSON object with exactly these fields:

{
  "jobTitle": "string",
  "experienceRequired": "string",
  "location": "string",
  "employmentType": "string",
  "mandatorySkills": ["array", "of", "strings"],
  "goodToHaveSkills": ["array", "of", "strings"],
  "responsibilities": ["array", "of", "strings"],
  "education": ["array", "of", "strings"],
  "industry": "string",
  "seniorityLevel": "string"
}

Rules:
- jobTitle: exact job title as stated
- experienceRequired: years/range of experience (e.g. "3-5 years")
- location: city, country or "Remote" or "Hybrid"
- employmentType: "Full-time", "Part-time", "Contract", "Freelance", etc.
- mandatorySkills: required/must-have technical and soft skills
- goodToHaveSkills: preferred/nice-to-have skills
- responsibilities: key job duties as concise bullet points
- education: degree requirements (e.g. "Bachelor's in Computer Science")
- industry: the domain/industry (e.g. "FinTech", "Healthcare", "E-commerce")
- seniorityLevel: "Junior", "Mid", "Senior", "Lead", "Manager", "Director", "C-Level"

Job Description:
---
${jd}
---

Return ONLY the JSON object. No other text.`;

const analyzeWithGemini = async (jobDescription) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const result = await callWithRetry(() => model.generateContent(USER_PROMPT(jobDescription)));
  const responseText = result.response.text().trim();
  const parsed = parseSafeJSON(responseText);

  // Ensure all expected fields are present with correct types
  return {
    jobTitle: String(parsed.jobTitle || ''),
    experienceRequired: String(parsed.experienceRequired || ''),
    location: String(parsed.location || ''),
    employmentType: String(parsed.employmentType || ''),
    mandatorySkills: Array.isArray(parsed.mandatorySkills) ? parsed.mandatorySkills.map(String) : [],
    goodToHaveSkills: Array.isArray(parsed.goodToHaveSkills) ? parsed.goodToHaveSkills.map(String) : [],
    responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities.map(String) : [],
    education: Array.isArray(parsed.education) ? parsed.education.map(String) : [],
    industry: String(parsed.industry || ''),
    seniorityLevel: String(parsed.seniorityLevel || ''),
  };
};

module.exports = { analyzeWithGemini };
