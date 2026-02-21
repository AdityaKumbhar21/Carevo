const Skill = require('../models/Skill');
const Gamification = require('../models/Gamification');
const Roadmap = require('../models/Roadmap');
const Career = require('../models/Career');
const Task = require('../models/Task');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { searchJobs } = require('../services/jobsService');



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


const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const gam = await Gamification.findOne({ user: userId });
    const skills = await Skill.find({ user: userId });

    // Basic aggregated metrics
    const totalXP = gam?.xp || 0;
    const streak = gam?.streak || 0;

    // Compute average skill score
    let avgSkillScore = 0;
    let skillCount = 0;
    let validatedCount = 0;
    let highestLevel = 0; // 1=easy, 2=medium, 3=advanced
    skills.forEach((sdoc) => {
      sdoc.skills.forEach((s) => {
        const val = s.finalScore ?? s.validatedScore ?? s.selfRating ?? 0;
        avgSkillScore += val;
        skillCount += 1;
        if (s.validatedScore != null) validatedCount += 1;
        const lvl = s.highestQuizLevelCleared;
        if (lvl === 'advanced') highestLevel = Math.max(highestLevel, 3);
        else if (lvl === 'medium') highestLevel = Math.max(highestLevel, 2);
        else if (lvl === 'easy') highestLevel = Math.max(highestLevel, 1);
      });
    });
    avgSkillScore = skillCount > 0 ? avgSkillScore / skillCount : 0;

    // Roadmap progress
    const roadmap = await Roadmap.findOne({ user: userId });
    const roadmapProgress = roadmap?.progressPercentage || 0;

    // Get career salary info for market value calculation
    const userDoc = await User.findById(userId);
    const targetRole = roadmap?.careerName || userDoc?.careerInterests?.[0] || (req.query.careerId || 'N/A');
    const career = targetRole !== 'N/A' ? await Career.findOne({ name: targetRole }) : null;

    // Task completion rate
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, completedAt: { $ne: null } });
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Quiz performance
    const submittedQuizzes = await Quiz.find({ user: userId, status: 'submitted' }).select('accuracy passed level updatedAt');
    const avgQuizAccuracy = submittedQuizzes.length > 0
      ? submittedQuizzes.reduce((sum, q) => sum + (q.accuracy || 0), 0) / submittedQuizzes.length
      : 0;
    const passedQuizCount = submittedQuizzes.filter(q => q.passed).length;

    // ===== DYNAMIC MARKET VALUE =====
    // Based on: base salary for career * skill readiness + XP bonus + streak multiplier
    const baseSalary = career?.averageSalaryRange?.min || 50000;
    const maxSalary = career?.averageSalaryRange?.max || 120000;
    const salaryRange = maxSalary - baseSalary;
    // Skill readiness factor: 0-1 based on avg validated score
    const skillReadiness = Math.min(1, avgSkillScore / 100);
    // Roadmap factor: 0-0.2 bonus based on progress
    const roadmapFactor = (roadmapProgress / 100) * 0.2;
    // Quiz mastery factor: bonus for passing advanced levels
    const quizMastery = (highestLevel / 3) * 0.15;
    // Task consistency factor
    const taskFactor = (taskCompletionRate / 100) * 0.1;
    // Combined readiness: weighted sum capped at 1
    const totalReadiness = Math.min(1, (skillReadiness * 0.55) + roadmapFactor + quizMastery + taskFactor);
    const marketValue = Math.round(baseSalary + (salaryRange * totalReadiness));
    // Change: based on recent XP gain (simulated as daily XP / total XP)
    const dailyXP = gam?.dailyXP || 0;
    const marketValueChange = totalXP > 0 ? Math.round(Math.min(15, (dailyXP / Math.max(1, totalXP)) * 100 + streak * 0.2)) : 0;

    // ===== DYNAMIC SKILL PERCENTILE =====
    // Composite: 60% avg skill score + 20% quiz accuracy + 20% task completion
    const rawPercentile = (avgSkillScore * 0.6) + (avgQuizAccuracy * 0.2) + (taskCompletionRate * 0.2);
    const skillPercentile = Math.round(Math.min(99, rawPercentile));
    const skillPercentileChange = passedQuizCount > 0 ? Math.min(8, passedQuizCount) : 0;

    // ===== DYNAMIC INTERVIEW READINESS =====
    // Factors: quiz pass rate, roadmap progress, skill validation coverage, streak consistency
    const quizPassRate = submittedQuizzes.length > 0 ? (passedQuizCount / submittedQuizzes.length) * 100 : 0;
    const validationCoverage = skillCount > 0 ? (validatedCount / skillCount) * 100 : 0;
    const interviewReadiness = Math.round(Math.min(100,
      (quizPassRate * 0.3) +
      (roadmapProgress * 0.25) +
      (validationCoverage * 0.25) +
      (Math.min(100, avgQuizAccuracy) * 0.15) +
      (Math.min(30, streak) / 30 * 5) // up to 5 points for streak
    ));
    const interviewReadinessChange = streak > 3 ? Math.min(5, Math.round(streak * 0.3)) : 0;

    // contributionLog: count actions in last year (tasks completed, quizzes submitted, checkins)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const tasks = await Task.find({ user: userId, completedAt: { $gte: oneYearAgo } }).select('completedAt');
    const quizzes = await Quiz.find({ user: userId, status: 'submitted', updatedAt: { $gte: oneYearAgo } }).select('updatedAt');

    const contributionCount = (tasks?.length || 0) + (quizzes?.length || 0) + (gam?.totalCheckIns || 0);

    // Build heatmap: 52 weeks x 7 days counts, LeetCode-style (weeks as columns)
    const days = [];
    const now = new Date();
    // start from most recent Sunday 52*7 days ago
    const start = new Date(now);
    start.setDate(start.getDate() - (52 * 7));
    start.setHours(0,0,0,0);

    // collect dates from tasks, quizzes, and checkins
    const actionDates = [];
    (tasks || []).forEach(t => { if (t.completedAt) actionDates.push(new Date(t.completedAt)); });
    (quizzes || []).forEach(q => { if (q.updatedAt) actionDates.push(new Date(q.updatedAt)); });
    // Represent check-ins: spread totalCheckIns backwards from lastCheckIn date
    if (gam?.lastCheckIn && gam.totalCheckIns) {
      const checkInDate = new Date(gam.lastCheckIn);
      // Add today's check-in
      actionDates.push(new Date(checkInDate));
      // Approximate past check-ins by distributing them backwards (streak-aware)
      const streak = gam.streak || 0;
      // For the current streak, add consecutive days
      for (let d = 1; d < Math.min(streak, gam.totalCheckIns); d++) {
        const pastDate = new Date(checkInDate);
        pastDate.setDate(pastDate.getDate() - d);
        actionDates.push(pastDate);
      }
      // Scatter remaining check-ins across the year
      const remaining = Math.max(0, gam.totalCheckIns - streak);
      for (let d = 0; d < remaining; d++) {
        const pastDate = new Date(checkInDate);
        pastDate.setDate(pastDate.getDate() - streak - (d * 3 + 1));
        if (pastDate >= oneYearAgo) actionDates.push(pastDate);
      }
    }

    // build a map of date (YYYY-MM-DD) -> count
    const counts = {};
    actionDates.forEach(d => {
      const key = d.toISOString().slice(0,10);
      counts[key] = (counts[key] || 0) + 1;
    });

    // Generate 52 weeks array (each week is array of 7 counts for Sun..Sat)
    const heatmap = [];
    const cur = new Date(start);
    for (let w = 0; w < 52; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = cur.toISOString().slice(0,10);
        week.push(counts[key] || 0);
        cur.setDate(cur.getDate() + 1);
      }
      heatmap.push(week);
    }

    // XP series: simple buckets for chart (12 points)
    const xpSeries = Array.from({ length: 12 }, (_, i) => Math.round(totalXP * (i+1) / 12));

    // Skill competencies: average score per skill name across all Skill docs
    const skillMap = {};
    (skills || []).forEach((sdoc) => {
      (sdoc.skills || []).forEach((s) => {
        const name = s.name || 'unknown';
        const val = s.finalScore ?? s.validatedScore ?? s.selfRating ?? 0;
        if (!skillMap[name]) skillMap[name] = { total: 0, count: 0 };
        skillMap[name].total += val;
        skillMap[name].count += 1;
      });
    });

    const skillCompetencies = Object.entries(skillMap).map(([name, v]) => ({
      name,
      score: Math.round(v.count > 0 ? v.total / v.count : 0),
    })).sort((a,b) => b.score - a.score).slice(0, 8); // top 8 skills

    // target role and estimated breakthrough from roadmap/probability
    const estimatedBreakthrough = roadmap ? `${Math.max(1, Math.ceil((roadmap.totalDays || 90) / 30))} months` : '6 months';

    // Fetch real-time job market data for target role
    let jobMarket = { totalJobs: 0, jobs: [] };
    try {
      if (targetRole && targetRole !== 'N/A') {
        jobMarket = await searchJobs(targetRole);
      }
    } catch (e) {
      console.warn('Job search failed for analytics:', e.message);
    }

    res.json({
      marketValue,
      marketValueChange,
      skillPercentile,
      skillPercentileChange,
      interviewReadiness,
      interviewReadinessChange,
      contributionLog: contributionCount,
      heatmap,
      xpSeries,
      skillCompetencies,
      targetRole,
      estimatedBreakthrough,
      contributionDates: Object.keys(counts),
      jobMarket: {
        totalJobs: jobMarket.totalJobs,
        sampleJobs: jobMarket.jobs,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch analytics overview' });
  }
};

module.exports = {
  getSkillProgress,
  getCareerProbability,
  getOverview,
};