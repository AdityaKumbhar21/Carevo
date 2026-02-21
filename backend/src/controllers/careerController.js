// controllers/careerController.js

const Career = require('../models/Career');
const User = require('../models/User');
const Skill = require('../models/Skill');
const CareerMatch = require('../models/CareerMatch');
const { generateRecommendations } = require('../services/geminiService');
const { searchJobs } = require('../services/jobsService');


const getCareers = async (req, res) => {
  try {
    const careers = await Career.find().select('-__v');
    res.json(careers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch careers' });
  }
};


const getRecommendations = async (req, res) => {
  try {
    const user = req.user; // from protect middleware
    const userId = user._id;

    const skillDoc = await Skill.find({ user: userId });
    const careers = await Career.find();

    if (!careers.length) {
      return res.status(404).json({ msg: 'No careers available' });
    }

    // Check if we have cached recommendations that are still valid
    const cached = await CareerMatch.findOne({ user: userId });
    const userInterests = user.careerInterests || [];
    const skillCount = skillDoc.reduce((sum, d) => sum + (d.skills?.length || 0), 0);
    const hasResume = !!(user.resumeText);

    if (cached && cached.recommendations.length > 0) {
      // Return cached if interests, skill count, and resume status haven't changed
      const sameInterests = JSON.stringify(cached.generatedFrom?.careerInterests || []) === JSON.stringify(userInterests);
      const sameSkills = (cached.generatedFrom?.skillCount || 0) === skillCount;
      const sameResume = (cached.generatedFrom?.hasResume || false) === hasResume;
      if (sameInterests && sameSkills && sameResume) {
        return res.json({ recommendations: cached.recommendations });
      }
    }

    // Flatten user skills across careers
    const abilities = [];
    skillDoc.forEach(doc => {
      doc.skills.forEach(s => {
        abilities.push({
          name: s.name,
          score: s.finalScore ?? s.validatedScore ?? 0,
        });
      });
    });

    const userDNA = {
      interests: userInterests,
      abilities,
      dailyStudyHours: user.dailyStudyHours || 2,
      resumeText: user.resumeText || '',
    };

    const rawRecommendations = await generateRecommendations(userDNA, careers);

    let parsed;
    try {
      parsed = typeof rawRecommendations === 'string'
        ? JSON.parse(rawRecommendations)
        : rawRecommendations;
    } catch (e) {
      return res.status(500).json({ msg: 'AI returned invalid JSON format' });
    }

    const recs = parsed.recommendations || parsed || [];

    // Cache the recommendations
    await CareerMatch.findOneAndUpdate(
      { user: userId },
      {
        recommendations: Array.isArray(recs) ? recs : [],
        generatedFrom: { careerInterests: userInterests, skillCount, hasResume },
      },
      { upsert: true, new: true }
    );

    res.json({ recommendations: recs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Recommendation engine failed' });
  }
};

// ======================================================
// CAREER SIMULATION ENGINE
// ======================================================
const simulateCareer = async (req, res) => {
  try {
    const { careerId } = req.body;

    if (!careerId) {
      return res.status(400).json({ msg: 'careerId is required' });
    }

    const career = await Career.findById(careerId);
    if (!career) {
      return res.status(404).json({ msg: 'Career not found' });
    }

    const user = req.user;
    const skillDoc = await Skill.findOne({
      user: user._id,
      career: career.name,
    });

    const dailyHours = user.dailyStudyHours || 2;

    const gaps = [];
    let totalHours = 0;

    career.skills.forEach(cs => {
      const userSkill = skillDoc?.skills.find(
        s => s.name === cs.name
      );

      const userLevel = userSkill?.finalScore ?? 0;
      const gap = Math.max(cs.requiredLevel - userLevel, 0);

      // Better estimation: proportional to required hours
      const estimatedHours =
        cs.estimatedHours * (gap / cs.requiredLevel);

      totalHours += estimatedHours;

      gaps.push({
        skill: cs.name,
        requiredLevel: cs.requiredLevel,
        userLevel,
        gap,
        estimatedHours: Math.ceil(estimatedHours),
      });
    });

    const totalDays = Math.ceil(totalHours / dailyHours);

    // Basic probability estimation
    const avgGap =
      gaps.reduce((acc, g) => acc + g.gap, 0) / gaps.length;

    const probability = Math.max(
      0,
      100 - avgGap - career.difficultyScore * 3
    );

    // Fetch real-time job count from JSearch API
    let jobData = { totalJobs: 0, jobs: [] };
    try {
      jobData = await searchJobs(career.name);
    } catch (e) {
      console.warn('Job search failed for simulation:', e.message);
    }

    res.json({
      career: career.name,
      difficultyScore: career.difficultyScore,
      marketDemandScore: career.marketDemandScore,
      gaps,
      totalHours: Math.ceil(totalHours),
      totalDays,
      probability: Math.round(probability),
      totalJobs: jobData.totalJobs,
      sampleJobs: jobData.jobs,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Simulation failed' });
  }
};

module.exports = {
  getCareers,
  getRecommendations,
  simulateCareer,
};