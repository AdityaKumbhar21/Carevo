const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});


const extractJSON = (text) => {
  try {
    
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    return null;
  }
};

const generateRecommendations = async (userDNA, careers) => {
  try {
    const prompt = `
You are an AI career intelligence engine.

Given:
1. User profile (Career DNA)
2. Available career options with required skills

Return ONLY valid JSON in this exact format:

{
  "recommendations": [
    {
      "careerName": "string",
      "fitScore": number (0-100),
      "strengthReason": "short explanation",
      "riskReason": "short explanation"
    }
  ]
}

Sort recommendations by highest fitScore first.
Return top 5 only.

User DNA:
${JSON.stringify(userDNA, null, 2)}

Available Careers:
${JSON.stringify(
      careers.map((c) => ({
        name: c.name,
        difficultyScore: c.difficultyScore,
        marketDemandScore: c.marketDemandScore,
        skills: c.skills.map((s) => ({
          name: s.name,
          requiredLevel: s.requiredLevel,
        })),
      })),
      null,
      2
    )}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const parsed = extractJSON(text);

    if (!parsed) {
      throw new Error('Invalid JSON from Gemini');
    }

    return parsed;

  } catch (error) {
    console.error('Gemini Recommendation Error:', error.message);
    throw new Error('AI recommendation failed');
  }
};

module.exports = {
  generateRecommendations,
};