const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

// === In-memory Gemini response cache ===
// Prevents duplicate API calls for identical prompts within TTL
const responseCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getCacheKey = (prompt) => {
  return crypto.createHash('md5').update(prompt).digest('hex');
};

const getCachedResponse = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCachedResponse = (key, data) => {
  // Limit cache size to prevent memory leaks
  if (responseCache.size > 100) {
    // Remove oldest entries
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
  responseCache.set(key, { data, timestamp: Date.now() });
};


const extractJSON = (text) => {
  if (!text || typeof text !== 'string') return null;
  // Try to strip fenced ```json blocks first
  const fenceMatch = text.match(/```json([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (e) {
      // fallthrough to other attempts
    }
  }

  // Try to find the first JSON object in the text (balanced braces heuristic)
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    const candidate = objMatch[0];
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // last attempt: try to clean common issues (trailing commas)
      const cleaned = candidate.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      try {
        return JSON.parse(cleaned);
      } catch (e2) {
        return null;
      }
    }
  }

  return null;
};

const generateRecommendations = async (userDNA, careers) => {
  try {
    const resumeContext = userDNA.resumeText
      ? `\n\nUser Resume/CV Text (use this to better understand their background, projects, and experience):\n${userDNA.resumeText.slice(0, 3000)}\n`
      : '';

    const prompt = `
You are an AI career intelligence engine.

Given:
1. User profile (Career DNA)
2. Available career options with required skills
${resumeContext ? '3. User resume/CV text for additional context' : ''}

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
${resumeContext}
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

    // Check cache first to save API tokens
    const cacheKey = getCacheKey(prompt);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('Gemini cache hit for recommendations');
      return cached;
    }

    const result = await model.generateContent(prompt);
    // result.response.text() may be a promise; await defensively
    const text = typeof result.response.text === 'function' ? await result.response.text() : String(result.response || '');

    // Try to extract JSON from the returned text
    const parsed = extractJSON(text);

    if (parsed) {
      // Cache the successful response
      setCachedResponse(cacheKey, parsed);
      return parsed;
    }

    // If parsing failed, log the response for debugging and fall back to a deterministic scorer
    console.warn('Gemini returned non-JSON response for recommendations:', text.substring(0, 1000));

    // Fallback: deterministic recommendations based on simple skill match and market demand
    const fallback = { recommendations: [] };

    const userAbilities = (userDNA?.abilities || []).reduce((map, a) => {
      map[a.name.toLowerCase()] = a.score || 0;
      return map;
    }, {});

    const scored = careers.map((c) => {
      // compute average match score across required skills
      let matchTotal = 0;
      let count = 0;
      (c.skills || []).forEach((s) => {
        const userScore = userAbilities[(s.name || '').toLowerCase()] || 0;
        const req = s.requiredLevel || 50;
        // contribution: how close the user is to required level
        const rel = Math.max(0, Math.min(1, userScore / (req || 100)));
        matchTotal += rel * 100;
        count += 1;
      });
      const skillMatch = count ? Math.round(matchTotal / count) : 0;
      const demand = c.marketDemandScore || 50;
      const difficulty = c.difficultyScore || 50;
      // simple fitScore heuristic
      const fitScore = Math.round((0.6 * skillMatch) + (0.3 * demand) - (0.1 * difficulty));

      return {
        careerName: c.name,
        fitScore: Math.max(0, Math.min(100, fitScore)),
        strengthReason: `Good match on ${Math.max(1, Math.round(skillMatch / 10))} key skills`,
        riskReason: `Difficulty ${difficulty}, may require upskilling`,
      };
    }).sort((a,b) => b.fitScore - a.fitScore).slice(0,5);

    fallback.recommendations = scored;
    return fallback;

  } catch (error) {
    console.error('Gemini Recommendation Error:', error.message);
    throw new Error('AI recommendation failed');
  }
};

module.exports = {
  generateRecommendations,
};