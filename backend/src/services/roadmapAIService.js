const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateRoadmapFromAI = async ({
  careerName,
  dailyStudyHours,
  skillGaps
}) => {

  const prompt = `
You are a career planning AI.

Generate a structured learning roadmap in STRICT JSON.

Career: ${careerName}
Daily Study Hours: ${dailyStudyHours}

Skill Gaps:
${JSON.stringify(skillGaps)}

Rules:
- Return ONLY valid JSON.
- Do NOT add explanations.
- Create day-wise tasks.
- Each day should contain 1-3 focused tasks.
- Each task must include:
  - dayNumber
  - title
  - description
  - skill
  - estimatedMinutes

JSON format:
{
  "totalDays": number,
  "tasks": [
    {
      "dayNumber": 1,
      "title": "...",
      "description": "...",
      "skill": "...",
      "estimatedMinutes": number
    }
  ]
}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
};

module.exports = { generateRoadmapFromAI };