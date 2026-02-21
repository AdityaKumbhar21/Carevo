const Quiz = require('../models/Quiz');
const Skill = require('../models/Skill');
const User = require('../models/User');
const { generateValidationQuizFromAI } = require('../services/quizAIService');


/**
 * Generate Validation Quiz (Easy, Medium, Advanced)
 * Calls Gemini ONLY if quizzes do not already exist
 */
const generateValidationQuiz = async (req, res) => {
  try {
    const { career, skill } = req.body;

    if (!career || !skill) {
      return res.status(400).json({ msg: 'Career and skill required' });
    }

    // Check if all 3 levels already exist
    const existing = await Quiz.find({
      user: req.user.id,
      career,
      skill,
      mode: 'validation',
    });

    if (existing.length === 3) {
      const summary = existing.map(q => ({
        level: q.level,
        quizId: q._id
      }));

      return res.json({
        msg: 'Validation quizzes already exist',
        quizzes: summary
      });
    }

    // Call Gemini ONLY if quizzes not found
    const aiData = await generateValidationQuizFromAI({ career, skill });

    const levels = ['easy', 'medium', 'advanced'];
    const createdQuizzes = [];

    for (const level of levels) {
      const questions = aiData[level] || [];

      const quiz = await Quiz.create({
        user: req.user.id,
        career,
        skill,
        level,
        mode: 'validation',
        status: 'generated',
        totalQuestions: questions.length,
        questions: questions.map((q, index) => ({
          questionId: `${level}-q${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      });

      createdQuizzes.push({
        level,
        quizId: quiz._id
      });
    }

    res.json({
      msg: 'Validation quizzes generated',
      quizzes: createdQuizzes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Validation quiz generation failed' });
  }
};


/**
 * Get Validation Quiz (Hide correct answers)
 */
const getValidationQuiz = async (req, res) => {
  try {
    const { career, skill, level } = req.query;

    const quiz = await Quiz.findOne({
      user: req.user.id,
      career,
      skill,
      level,
      mode: 'validation',
      status: 'generated',
    }).select('-questions.correctAnswer');

    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    res.json({
      quizId: quiz._id,
      level: quiz.level,
      totalQuestions: quiz.totalQuestions,
      questions: quiz.questions,
    });

  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch quiz' });
  }
};


/**
 * Submit Quiz
 * No pass/fail threshold
 * All levels must be attempted
 */
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTakenSeconds } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({ msg: 'Invalid submission data' });
    }

    const quiz = await Quiz.findById(quizId)
      .select('+questions.correctAnswer');

    if (!quiz || quiz.status !== 'generated') {
      return res.status(400).json({ msg: 'Invalid or already submitted quiz' });
    }

    let correct = 0;

    const responses = quiz.questions.map((q, index) => {
      const isCorrect = q.correctAnswer === answers[index];
      if (isCorrect) correct++;

      return {
        questionId: q.questionId,
        userAnswer: answers[index],
        isCorrect,
      };
    });

    const accuracy = quiz.totalQuestions > 0
      ? (correct / quiz.totalQuestions) * 100
      : 0;

    // Update quiz (NO pass/fail logic)
    quiz.score = accuracy;
    quiz.accuracy = accuracy;
    quiz.correctCount = correct;
    quiz.responses = responses;
    quiz.timeTakenSeconds = timeTakenSeconds || 0;
    quiz.status = 'submitted';

    await quiz.save();

    // Ensure Skill document exists
    let userSkillDoc = await Skill.findOne({
      user: req.user.id,
      career: quiz.career
    });

    if (!userSkillDoc) {
      userSkillDoc = await Skill.create({
        user: req.user.id,
        career: quiz.career,
        skills: [],
      });
    }

    const skillNameLC = (quiz.skill || '').toLowerCase();

    let skillObj = userSkillDoc.skills.find(
      s => (s.name || '').toLowerCase() === skillNameLC
    );

    if (!skillObj) {
      skillObj = {
        name: skillNameLC,
        selfRating: 0,
        validatedScore: accuracy,
        finalScore: Math.round(0.6 * accuracy),
        highestQuizLevelCleared: quiz.level, // always update
        totalAttempts: 1,
        lastQuizAttemptDate: new Date(),
      };

      userSkillDoc.skills.push(skillObj);
    } else {
      skillObj.validatedScore = accuracy;
      skillObj.highestQuizLevelCleared = quiz.level;
      skillObj.totalAttempts = (skillObj.totalAttempts || 0) + 1;
      skillObj.lastQuizAttemptDate = new Date();
      skillObj.finalScore = Math.round(
        (0.4 * (skillObj.selfRating || 0)) + (0.6 * accuracy)
      );
    }

    await userSkillDoc.save();

    // Recompute career fit score
    try {
      const user = await User.findById(req.user.id);

      const finalScores = userSkillDoc.skills
        .map(s => s.finalScore)
        .filter(v => typeof v === 'number' && !isNaN(v));

      let avg = 0;

      if (finalScores.length > 0) {
        avg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
      }

      avg = Math.round(Number(avg) || 0);

      user.careerFitScores = user.careerFitScores || {};
      user.careerFitScores[quiz.career] = avg;

      await user.save();

    } catch (e) {
      console.error('Failed to update career fit score:', e);
    }

    // Always allow next level
    let nextLevel = null;
    if (quiz.level === 'easy') nextLevel = 'medium';
    if (quiz.level === 'medium') nextLevel = 'advanced';

    res.json({
      score: accuracy,
      nextLevel,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Quiz submission failed' });
  }
};


module.exports = {
  generateValidationQuiz,
  getValidationQuiz,
  submitQuiz,
};