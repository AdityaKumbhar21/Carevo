const { safeParseAIJSON } = require('../services/quizAIService');

const samples = [
  '```json\n[{"question":"Q1","options":["A","B"],"correctAnswer":"A"}]\n```',
  'Some explanation\n```\n[{"question":"Q2","options":["A","B"],"correctAnswer":"B"}]\n```',
  '`[{"question":"Q3","options":["A","B"],"correctAnswer":"A"}]`',
  '   [{"question":"Q4","options":["A","B"],"correctAnswer":"B"}]   ',
  'No JSON here',
];

for (const s of samples) {
  try {
    const parsed = safeParseAIJSON(s);
    console.log('SUCCESS:', JSON.stringify(parsed));
  } catch (e) {
    console.error('FAILED:', e.message);
    if (e.raw) console.error('RAW:', e.raw.slice(0, 200));
  }
}
