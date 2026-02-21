
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const { safeParseAIJSON, generateWithRetry } = require('./quizAIService');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// === In-memory roadmap response cache ===
const roadmapCache = new Map();
const ROADMAP_CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours

const getRoadmapCacheKey = (prompt) => crypto.createHash('md5').update(prompt).digest('hex');

const getRoadmapCachedResponse = (key) => {
  const entry = roadmapCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ROADMAP_CACHE_TTL) {
    roadmapCache.delete(key);
    return null;
  }
  return entry.data;
};

const setRoadmapCachedResponse = (key, data) => {
  if (roadmapCache.size > 50) {
    const oldestKey = roadmapCache.keys().next().value;
    roadmapCache.delete(oldestKey);
  }
  roadmapCache.set(key, { data, timestamp: Date.now() });
};

const generateRoadmapFromAI = async ({
  careerName,
  dailyStudyHours,
  skillGaps,
  resumeText
}) => {

  const resumeContext = resumeText
    ? `\nUser's Resume/Background (adapt tasks to their experience level):\n${resumeText.slice(0, 2000)}\n`
    : '';

  const prompt = `
You are a career planning AI.

Generate a structured learning roadmap in STRICT JSON.

Career: ${careerName}
Daily Study Hours: ${dailyStudyHours}

Skill Gaps:
${JSON.stringify(skillGaps)}
${resumeContext}

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

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Check cache first
  const cacheKey = getRoadmapCacheKey(prompt);
  const cached = getRoadmapCachedResponse(cacheKey);
  if (cached) {
    console.log('Roadmap AI cache hit');
    return cached;
  }

  const result = await generateWithRetry(model, prompt, { maxRetries: 5, baseDelay: 1000 });
  const text = result.response.text();

  const parsed = safeParseAIJSON(text);

  // Cache the result
  setRoadmapCachedResponse(cacheKey, parsed);

  return parsed;
};

module.exports = { generateRoadmapFromAI, generateWithRetry };