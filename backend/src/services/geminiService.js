const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// =============================
// Utility: Extract JSON safely
// =============================
const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;

  const fenceMatch = text.match(/```json([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    const candidate = objMatch[0];
    try {
      return JSON.parse(candidate);
    } catch {
      const cleaned = candidate
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      try {
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }

  return null;
};

// =============================
// Generate Recommendations
// =============================
const generateRecommendations = async (userDNA, careers) => {
  try {
    const prompt = `
You are an AI career intelligence engine.

Return ONLY valid JSON in this format:

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

Sort by highest fitScore.
Return top 5 only.

User DNA:
${JSON.stringify({
      interests: userDNA.interests,
      abilities: userDNA.abilities,
      dailyStudyHours: userDNA.dailyStudyHours
    })}

Available Careers:
${JSON.stringify(
      careers.map(c => ({
        name: c.name,
        difficultyScore: c.difficultyScore,
        marketDemandScore: c.marketDemandScore,
        skills: c.skills.map(s => ({
          name: s.name,
          requiredLevel: s.requiredLevel,
        })),
      }))
    )}
`;

    const result = await model.generateContent(prompt);

    const text =
      typeof result.response.text === 'function'
        ? await result.response.text()
        : String(result.response || '');

    const parsed = extractJSON(text);

    if (parsed?.recommendations) {
      return parsed;
    }

    // =============================
    // Deterministic Fallback
    // =============================
    console.warn('Gemini returned invalid JSON. Using fallback scorer.');

    const userAbilities = (userDNA?.abilities || []).reduce((map, a) => {
      map[a.name.toLowerCase()] = a.score || 0;
      return map;
    }, {});

    const scored = careers
      .map((c) => {
        let matchTotal = 0;
        let count = 0;

        (c.skills || []).forEach((s) => {
          const userScore = userAbilities[(s.name || '').toLowerCase()] || 0;
          const req = s.requiredLevel || 50;
          const rel = Math.max(0, Math.min(1, userScore / req));
          matchTotal += rel * 100;
          count++;
        });

        const skillMatch = count ? Math.round(matchTotal / count) : 0;
        const demand = c.marketDemandScore || 50;
        const difficulty = c.difficultyScore || 50;

        const fitScore = Math.round(
          (0.6 * skillMatch) +
          (0.3 * demand) -
          (0.1 * difficulty)
        );

        return {
          careerName: c.name,
          fitScore: Math.max(0, Math.min(100, fitScore)),
          strengthReason: `Strong alignment in ${Math.max(1, Math.round(skillMatch / 10))} key skills`,
          riskReason: `Difficulty ${difficulty}, may require structured upskilling`,
        };
      })
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 5);

    return { recommendations: scored };

  } catch (error) {
    console.error('Gemini Recommendation Error:', error.message);
    throw new Error('AI recommendation failed');
  }
};

module.exports = {
  generateRecommendations,
};