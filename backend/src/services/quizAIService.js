const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuizFromAI = async ({ career, skill, level }) => {
  const prompt = `
Generate 5 multiple-choice questions for:
Career: ${career}
Skill: ${skill}
Difficulty: ${level}

Return JSON in this format:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  }
]
Only return valid JSON.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
};

module.exports = { generateQuizFromAI };