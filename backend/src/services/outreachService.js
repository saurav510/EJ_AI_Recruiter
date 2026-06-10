const { GoogleGenerativeAI } = require('@google/generative-ai');
const { callWithRetry, parseSafeJSON } = require('../utils/geminiHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an elite tech recruitment consultant specialising in high-response-rate outreach.
Your messages are warm, concise, personalised, and candidate-first — never salesy or generic.
You MUST return ONLY valid JSON with no markdown, code fences, or extra text.`;

const scoreLabel = (score) => {
  if (score >= 85) return 'an exceptional match';
  if (score >= 70) return 'a strong match';
  if (score >= 55) return 'a solid match';
  return 'a promising match';
};

const buildOutreachPrompt = ({
  candidateName,
  jobTitle,
  companyName,
  matchScore,
  candidateSkills = [],
  hiringDecision = '',
  currentRole = '',
}) => {
  const firstName = candidateName.split(' ')[0];
  const matchStrength = scoreLabel(matchScore);
  const skillsLine =
    candidateSkills.length > 0
      ? `The candidate's top skills include: ${candidateSkills.slice(0, 5).join(', ')}.`
      : '';
  const roleContext = currentRole
    ? `They are currently working as ${currentRole}.`
    : '';
  const decisionContext =
    hiringDecision && hiringDecision !== 'No Hire'
      ? `Our AI match analysis gave a "${hiringDecision}" recommendation with a ${matchScore}/100 compatibility score.`
      : `Their profile scored ${matchScore}/100 on our AI compatibility analysis.`;

  return `Generate three personalised recruitment outreach messages for this candidate.

=== CONTEXT ===
Recruiter Company: ${companyName}
Open Role: ${jobTitle}
Candidate Name: ${candidateName} (first name: ${firstName})
${roleContext}
${skillsLine}
${decisionContext}
Match Strength: ${matchStrength} (${matchScore}/100)

=== REQUIRED OUTPUT FORMAT ===
Return ONLY this exact JSON structure:

{
  "whatsappMessage": "<message>",
  "followUpMessage": "<message>",
  "emailMessage": "<message>"
}

=== MESSAGE SPECIFICATIONS ===

whatsappMessage:
- Length: 80–120 words maximum (WhatsApp attention span)
- Tone: Warm, direct, conversational — like a message from a recruiter they'd want to hear from
- Structure: Opening hook using first name → why they specifically (reference a skill or experience) → the opportunity → soft CTA
- Must feel human, NOT templated
- No bullet points — flowing prose
- End with a question to drive replies (e.g. "Would you be open to a quick 15-min call?")
- Do NOT use emojis

followUpMessage:
- Length: 50–70 words (shorter than initial, assumes no reply to first message)
- Tone: Light, non-pushy, value-add
- Reference the previous outreach briefly ("I sent you a message last week about…")
- Add ONE new compelling detail about the role (growth, impact, team, or compensation hint)
- Soft exit: "Totally understand if the timing isn't right — happy to stay in touch."
- Do NOT use emojis

emailMessage:
- Length: 150–200 words
- Subject line: Include a compelling subject on the first line as "Subject: <subject>"
- Structure:
  1. Personalised opening (reference their background/current role/specific skill)
  2. Why THIS role at ${companyName} is relevant to them specifically (2-3 sentences)
  3. 2-3 bullet points of what makes the opportunity compelling (growth, impact, team culture, tech stack, or comp — be specific)
  4. Clear but non-pressuring CTA with two options (e.g. "If this resonates, I'd love to schedule a 20-minute exploratory call. Alternatively, I can send across a full role brief first.")
  5. Professional sign-off
- Formal but warm tone
- No generic phrases like "I came across your profile" or "exciting opportunity"

Quality Rules:
- Every message must feel written specifically for ${firstName}, not copy-pasted
- Mention ${jobTitle} at ${companyName} naturally in each message
- The match score (${matchScore}/100) should inform confidence level but not be stated explicitly in messages
- High score (≥70): convey confidence and urgency
- Medium score (55-69): convey genuine interest, not urgency
- The messages must work together as a sequence

Return ONLY the JSON object. No preamble. No trailing text.`;
};

const generateOutreachMessages = async (params) => {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.7,  // higher creativity for varied, natural-sounding messages
      topP: 0.92,
      maxOutputTokens: 3072,
      responseMimeType: 'application/json',
    },
  });

  const result = await callWithRetry(() => model.generateContent(buildOutreachPrompt(params)));
  const raw = result.response.text().trim();
  const parsed = parseSafeJSON(raw);

  if (!parsed.whatsappMessage || !parsed.followUpMessage || !parsed.emailMessage) {
    throw new Error('Gemini response missing one or more required message fields.');
  }

  return {
    whatsappMessage: String(parsed.whatsappMessage).trim(),
    followUpMessage: String(parsed.followUpMessage).trim(),
    emailMessage: String(parsed.emailMessage).trim(),
  };
};

module.exports = { generateOutreachMessages };
