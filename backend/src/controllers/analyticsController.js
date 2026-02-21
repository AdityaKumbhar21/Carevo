const Skill = require('../models/Skill');
const Gamification = require('../models/Gamification');
const Roadmap = require('../models/Roadmap');



const getSkillProgress = async (req, res) => {
  try {
    const { careerId } = req.query;

    const skills = await Skill.findOne({
      user: req.user._id,
      career: careerId,
    });

    if (!skills) {
      return res.json({
        msg: 'No skill data found',
        skills: [],
      });
    }

    res.json(skills);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch skill progress' });
  }
};




const getCareerProbability = async (req, res) => {
  try {
    const { careerId } = req.query;

    if (!careerId) {
      return res.status(400).json({ msg: 'careerId required' });
    }

    const gam = await Gamification.findOne({
      user: req.user._id,
    });

    const roadmap = await Roadmap.findOne({
      user: req.user._id,
      career: careerId,
    });

    if (!roadmap) {
      return res.status(404).json({
        msg: 'No roadmap found for this career',
      });
    }

  
    const progressFactor = roadmap.progressPercentage || 0; // 0-100

   
    const xp = gam?.xp || 0;
    const xpFactor = Math.min(100, (xp / 10000) * 100);

    
    const streak = gam?.streak || 0;
    const streakFactor = Math.min(100, (streak / 30) * 100);

  
    const probability =
      0.5 * progressFactor +
      0.3 * xpFactor +
      0.2 * streakFactor;

   
    const totalDays = roadmap.totalDays || 0;
    const remainingDays =
      totalDays - Math.floor((progressFactor / 100) * totalDays);

    const monthsRemaining = Math.ceil(remainingDays / 30);

    res.json({
      probability: Math.round(probability),
      progress: progressFactor,
      xpFactor: Math.round(xpFactor),
      streakFactor: Math.round(streakFactor),
      monthsRemaining,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to calculate probability' });
  }
};


module.exports = {
  getSkillProgress,
  getCareerProbability,
};