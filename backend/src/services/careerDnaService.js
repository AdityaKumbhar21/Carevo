const User = require('../models/User');
const Skill = require('../models/Skill');
const Gamification = require('../models/Gamification');
const Roadmap = require('../models/Roadmap');

const generateCareerDNA = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const skills = await Skill.find({ user: userId });
  const Quiz = require('../models/Quiz');
  const gam = await Gamification.findOne({ user: userId });
  const roadmap = await Roadmap.findOne({
    user: userId,
    status: 'active',
  });


  const abilities = [];
  skills.forEach(doc => {
    doc.skills.forEach(s => {
      abilities.push({
        name: s.name,
        selfRating: s.selfRating,
        validatedScore: s.validatedScore ?? 0,
        finalScore:
          s.finalScore ??
          Math.round(
            (0.4 * s.selfRating) +
            (0.6 * (s.validatedScore ?? 0))
          ),
        highestQuizLevelCleared:
          s.highestQuizLevelCleared ?? null,
      });
    });
  });

  // compute cumulative validation quiz stats (average accuracy and count)
  let validationStats = { average: 0, count: 0 };
  try {
    const submitted = await Quiz.find({ user: userId, status: 'submitted', mode: 'validation' });
    if (submitted && submitted.length > 0) {
      const avg = Math.round(submitted.reduce((acc, q) => acc + (q.accuracy || 0), 0) / submitted.length);
      validationStats = { average: avg, count: submitted.length };
    }
  } catch (e) {
    // swallow and leave defaults
  }

  const learningProfile = {
    averageQuizAccuracy: abilities.length
      ? Math.round(
          abilities.reduce(
            (acc, a) => acc + a.finalScore,
            0
          ) / abilities.length
        )
      : 0,

    validation: validationStats,

    learningSpeedIndex:
      user.dailyStudyHours >= 4 ? 1 :
      user.dailyStudyHours >= 2 ? 0.8 : 0.6,

    consistencyScore:
      gam?.streak
        ? Math.min(100, gam.streak * 3)
        : 0,
  };


  const executionProfile = {
    streak: gam?.streak ?? 0,
    longestStreak: gam?.longestStreak ?? 0,
    xp: gam?.xp ?? 0,
    level: gam?.level ?? 1,
    roadmapProgress:
      roadmap?.progressPercentage ?? 0,
  };

  return {
    userId,
    context: {
      educationLevel: user.educationLevel,
      currentCourse: user.currentCourse,
      yearOfStudy: user.yearOfStudy,
      dailyStudyHours: user.dailyStudyHours,
      timezone: user.timezone,
    },
    interests: user.careerInterests ?? [],
    abilities,
    learningProfile,
    executionProfile,
  };
};

module.exports = { generateCareerDNA };