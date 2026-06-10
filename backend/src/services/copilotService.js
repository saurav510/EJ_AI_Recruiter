const { GoogleGenerativeAI } = require('@google/generative-ai');
const { callWithRetry } = require('../utils/geminiHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildSystemPrompt = (matchData) => {
  return `You are an expert AI Recruiter Copilot. Your job is to assist the human recruiter with insights about a specific candidate and job match.

=== CONTEXT ===
Job Title: ${matchData.jobSnapshot?.jobTitle || 'Unknown'}
Candidate Name: ${matchData.candidateSnapshot?.candidateName || 'Unknown'}
Overall Match Score: ${matchData.matchResult?.overallScore || 'N/A'}/100
Hiring Decision: ${matchData.matchResult?.hiringDecision || 'Unknown'}

Job Description Summary:
${JSON.stringify(matchData.jobSnapshot, null, 2)}

Candidate Profile Summary:
${JSON.stringify(matchData.candidateSnapshot, null, 2)}

Match Analysis Details:
${JSON.stringify(matchData.matchResult, null, 2)}

=== YOUR ROLE ===
- Provide concise, recruiter-focused answers based ONLY on the context provided above.
- If asked why a score is low/high, refer to the 'skillGaps', 'strengths', or 'risks' in the match analysis.
- If asked to generate outreach or interview questions, do so professionally.
- Be helpful, clear, and direct. Use markdown for formatting (bullet points, bold text).
- Do not hallucinate skills or requirements not present in the context.`;
};

const chatWithCopilot = async (matchData, history, newMessage) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: buildSystemPrompt(matchData),
    generationConfig: {
      temperature: 0.6,
    },
  });

  // Map our history format to Gemini's expected format
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({
    history: formattedHistory,
  });

  const result = await callWithRetry(() => chatSession.sendMessage(newMessage));
  return result.response.text();
};

module.exports = { chatWithCopilot };
