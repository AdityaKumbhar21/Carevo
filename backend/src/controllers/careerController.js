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
    const user = req.user;
    const userId = user._id;

    const careers = await Career.find();
    if (!careers.length) {
      return res.status(404).json({ msg: 'No careers available' });
    }

    const skillDocs = await Skill.find({ user: userId });

    const userInterests = user.careerInterests || [];
    const skillCount = skillDocs.reduce(
      (sum, d) => sum + (d.skills?.length || 0),
      0
    );

    const existing = await CareerMatch.findOne({ user: userId });

    // ✅ If exists AND no changes → return DB version
    if (existing) {
      const sameInterests =
        JSON.stringify(existing.generatedFrom?.careerInterests || []) ===
        JSON.stringify(userInterests);

      const sameSkills =
        (existing.generatedFrom?.skillCount || 0) === skillCount;

      if (sameInterests && sameSkills) {
        console.log("Returning recommendations from MongoDB");
        return res.json({
          recommendations: existing.recommendations,
        });
      }
    }

    // ✅ Build abilities only if regeneration required
    const abilities = [];
    skillDocs.forEach(doc => {
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

    console.log("Calling Gemini for fresh recommendations...");

    const aiResult = await generateRecommendations(userDNA, careers);
    const recommendations = aiResult.recommendations || [];

    await CareerMatch.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        recommendations,
        generatedFrom: {
          careerInterests: userInterests,
          skillCount,
        },
      },
      { upsert: true, new: true }
    );

    res.json({ recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Recommendation engine failed' });
  }
};


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