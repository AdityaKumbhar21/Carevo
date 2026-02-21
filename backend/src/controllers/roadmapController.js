// controllers/roadmapController.js

const Roadmap = require('../models/Roadmap');
const Career = require('../models/Career');
const Skill = require('../models/Skill');
const Task = require('../models/Task');
const { generateRoadmapFromAI } = require('../services/roadmapAIService');


// ======================================================
// GENERATE ROADMAP (AI called only once)
// ======================================================
const generateRoadmap = async (req, res) => {
  try {
    const { careerId } = req.body;
    const user = req.user;

    if (!careerId) {
      return res.status(400).json({ msg: 'careerId required' });
    }

    // 🔥 Check existing roadmap
    const existing = await Roadmap.findOne({
      user: user._id,
      career: careerId,
      status: 'active',
    });

    if (existing) {
      return res.json({
        msg: 'Roadmap already exists',
        roadmapId: existing._id,
        totalDays: existing.totalDays,
      });
    }

    const career = await Career.findById(careerId);
    if (!career) {
      return res.status(404).json({ msg: 'Career not found' });
    }

    const skillDoc = await Skill.findOne({
      user: user._id,
      career: career.name,
    });

    const skillGaps = career.skills.map(cs => {
      const userSkill = skillDoc?.skills.find(
        s => s.name === cs.name
      );

      const currentLevel = userSkill?.finalScore ?? 0;

      return {
        skill: cs.name,
        requiredLevel: cs.requiredLevel,
        currentLevel,
        gap: Math.max(cs.requiredLevel - currentLevel, 0),
      };
    });

    // 🔥 Call Gemini once (include resume text for personalized roadmap)
    const aiRoadmap = await generateRoadmapFromAI({
      careerName: career.name,
      dailyStudyHours: user.dailyStudyHours || 2,
      skillGaps,
      resumeText: user.resumeText || '',
    });

    if (!aiRoadmap?.tasks?.length) {
      return res.status(500).json({
        msg: 'Invalid AI roadmap format',
      });
    }

    // Create roadmap document
    const roadmap = await Roadmap.create({
      user: user._id,
      career: career._id,
      totalDays: aiRoadmap.totalDays,
    });

    // Create tasks separately
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const taskDocs = aiRoadmap.tasks.map(task => ({
      user: user._id,
      roadmap: roadmap._id,
      career: career._id,
      dayNumber: task.dayNumber,
      date: new Date(
        startDate.getTime() +
        (task.dayNumber - 1) * 24 * 60 * 60 * 1000
      ),
      title: task.title,
      description: task.description,
      skill: task.skill,
      estimatedMinutes: task.estimatedMinutes,
    }));

    await Task.insertMany(taskDocs);

    res.status(201).json({
      msg: 'AI Roadmap generated successfully',
      roadmapId: roadmap._id,
      totalDays: roadmap.totalDays,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Roadmap generation failed' });
  }
};



// ======================================================
// GET ROADMAP DETAILS
// ======================================================
const getRoadmap = async (req, res) => {
  try {
    const { careerId } = req.query;

    const roadmap = await Roadmap.findOne({
      user: req.user._id,
      career: careerId,
    });

    if (!roadmap) {
      return res.status(404).json({ msg: 'No roadmap found' });
    }

    // Calculate progress
    const totalTasks = await Task.countDocuments({
      roadmap: roadmap._id,
    });

    const completedTasks = await Task.countDocuments({
      roadmap: roadmap._id,
      completed: true,
    });

    const progress =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    roadmap.progressPercentage = progress;
    await roadmap.save();

    res.json({
      roadmap,
      progress,
    });

  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch roadmap' });
  }
};



module.exports = {
  generateRoadmap,
  getRoadmap,
};