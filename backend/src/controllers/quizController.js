const Quiz = require('../models/Quiz');
const Skill = require('../models/Skill');
const { generateQuizFromAI } = require('../services/quizAIService');


const generateQuiz = async (req, res) => {
  try {
    const { career, skill, level } = req.body;

    if (!career || !skill || !level) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    
    const aiQuestions = await generateQuizFromAI({
      career,
      skill,
      level,
      count: 5,
    });

    if (!aiQuestions || aiQuestions.length === 0) {
      return res.status(500).json({ msg: 'AI failed to generate quiz' });
    }

    
    const quiz = await Quiz.create({
      user: req.user.id,
      career,
      skill,
      level,
      totalQuestions: aiQuestions.length,
      correctAnswers: aiQuestions.map((q, index) => ({
        questionId: `q${index}`,
        correctAnswer: q.correctAnswer,
      })),
      status: 'generated',
      mode: 'validation',
    });

    
    res.json({
      quizId: quiz._id,
      questions: aiQuestions.map((q, index) => ({
        questionId: `q${index}`,
        question: q.question,
        options: q.options,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Quiz generation failed' });
  }
};


const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTakenSeconds } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({ msg: 'Invalid submission data' });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz || quiz.status !== 'generated') {
      return res.status(400).json({ msg: 'Invalid or already submitted quiz' });
    }

    let correct = 0;

    const responses = quiz.correctAnswers.map((item, index) => {
      const isCorrect = item.correctAnswer === answers[index];
      if (isCorrect) correct++;

      return {
        questionId: item.questionId,
        userAnswer: answers[index],
        isCorrect,
      };
    });

    const accuracy = (correct / quiz.totalQuestions) * 100;
    const passed = accuracy >= 70;

    // Update quiz document
    quiz.score = accuracy;
    quiz.accuracy = accuracy;
    quiz.passed = passed;
    quiz.responses = responses;
    quiz.timeTakenSeconds = timeTakenSeconds || 0;
    quiz.status = 'submitted';

    
    quiz.correctAnswers = undefined;

    await quiz.save();

    
    const userSkillDoc = await Skill.findOne({
      user: req.user.id,
      career: quiz.career,
    });

    if (userSkillDoc) {
      const skillObj = userSkillDoc.skills.find(
        (s) => s.name.toLowerCase() === quiz.skill.toLowerCase()
      );

      if (skillObj) {
        skillObj.validatedScore = accuracy;

        if (passed) {
          skillObj.highestQuizLevelCleared = quiz.level;
        }

        skillObj.totalAttempts += 1;
        skillObj.lastQuizAttemptDate = new Date();

       
        skillObj.finalScore =
          0.4 * skillObj.selfRating + 0.6 * accuracy;

        await userSkillDoc.save();
      }
    }

    let nextLevel = null;
    if (quiz.level === 'easy' && passed) nextLevel = 'medium';
    if (quiz.level === 'medium' && passed) nextLevel = 'advanced';

    res.json({
      score: accuracy,
      passed,
      nextLevel,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Quiz submission failed' });
  }
};

module.exports = {
  generateQuiz,
  submitQuiz,
};