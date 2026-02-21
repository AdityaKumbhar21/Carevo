const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Safely extracts JSON from AI response
 */
const extractAndParseJSON = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty AI response');
  }

  // Remove markdown fences if present
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Extract first JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No valid JSON found in AI response');
  }

  const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
    } catch (err) {
      throw new Error('AI returned malformed JSON');
    }
};

// Safe parse wrapper used by other services
const safeParseAIJSON = (text) => extractAndParseJSON(text);

// Simple retry wrapper for model.generateContent
const generateWithRetry = async (model, prompt, opts = {}) => {
  const maxRetries = typeof opts.maxRetries === 'number' ? opts.maxRetries : 3;
  const baseDelay = typeof opts.baseDelay === 'number' ? opts.baseDelay : 500;

  let attempt = 0;
  while (true) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};


/**
 * Generate Validation Quiz (3 Levels)
 */
const generateValidationQuizFromAI = async ({ career, skill }) => {
  try {
    const prompt = `
You are an expert technical educator.

Generate a validation quiz for:

Career: ${career}
Skill: ${skill}

Requirements:
- Create exactly 3 levels: easy, medium, advanced.
- Each level must have exactly 5 multiple-choice questions.
- Each question must have:
  - question (string)
  - options (array of 4 strings)
  - correctAnswer (must be exactly one of the options)

Output ONLY valid JSON in this exact structure:

{
  "easy": [
    { "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A" }
  ],
  "medium": [
    { "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A" }
  ],
  "advanced": [
    { "question": "...", "options": ["A","B","C","D"], "correctAnswer": "A" }
  ]
}

Do NOT:
- Use markdown
- Use code blocks
- Add explanations
- Add extra text
- Wrap in \`\`\`json

Return ONLY raw JSON.
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = extractAndParseJSON(text);

    // Basic structure validation
    const levels = ['easy', 'medium', 'advanced'];

    for (const level of levels) {
      if (!Array.isArray(parsed[level]) || parsed[level].length !== 5) {
        throw new Error(`AI response missing or invalid level: ${level}`);
      }

      parsed[level].forEach((q, index) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          !q.correctAnswer
        ) {
          throw new Error(`Invalid question structure in ${level} level at index ${index}`);
        }
      });
    }

    return parsed;

  } catch (err) {
    console.error('Quiz generation failed:', err);
    throw new Error('Failed to generate validation quiz');
  }
};

module.exports = {
  generateValidationQuizFromAI,
  safeParseAIJSON,
  generateWithRetry,
};