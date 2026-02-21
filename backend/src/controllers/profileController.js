const {
  setupProfileSchema,
  updateProfileSchema,
} = require('../validators/profileValidator');
const Skill = require('../models/Skill');
const Career = require('../models/Career');


const setupProfile = async (req, res) => {
  try {
    const {
      skillRatings: rawSkillRatings,
      ...profileData
    } = req.body;

    const user = req.user;

    // ----------------------------
    // 🔥 MANUAL SKILL RATINGS CLEANING
    // ----------------------------
    let cleanedSkillRatings = {};

    if (rawSkillRatings && typeof rawSkillRatings === 'object') {
      for (const key of Object.keys(rawSkillRatings)) {
        const rawValue = rawSkillRatings[key];

        const num = Number(rawValue);

        // Reject invalid numbers
        if (!Number.isFinite(num)) {
          return res.status(400).json({
            msg: `Invalid skill rating for "${key}". Must be a valid number.`,
          });
        }

        // Optional: enforce range 0–100
        if (num < 0 || num > 100) {
          return res.status(400).json({
            msg: `Skill rating for "${key}" must be between 0 and 100.`,
          });
        }

        cleanedSkillRatings[key.toLowerCase()] = num;
      }
    }

    // Save cleaned ratings
    if (Object.keys(cleanedSkillRatings).length > 0) {
      user.skillRatings = cleanedSkillRatings;
    }

    // Assign remaining profile fields
    Object.assign(user, profileData);

    await user.save();

    // ----------------------------
    // Create Skill Documents
    // ----------------------------
    if (Object.keys(cleanedSkillRatings).length > 0) {
      const careerInterests =
        profileData.careerInterests || user.careerInterests || [];

      for (const careerName of careerInterests) {
        const career = await Career.findOne({ name: careerName });
        if (!career) continue;

        const skillsForCareer = [];

        for (const careerSkill of career.skills) {
          const rating =
            cleanedSkillRatings[careerSkill.name.toLowerCase()];

          if (rating !== undefined) {
            skillsForCareer.push({
              name: careerSkill.name.toLowerCase(),
              selfRating: rating,
              validatedScore: null,
              finalScore: null,
            });
          }
        }

        if (skillsForCareer.length > 0) {
          await Skill.findOneAndUpdate(
            { user: user._id, career: careerName },
            { user: user._id, career: careerName, skills: skillsForCareer },
            { upsert: true, new: true }
          );
        }
      }
    }

    res.json({
      msg: 'Profile setup complete',
      user: { hasOnboarded: user.hasOnboarded },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


const updateProfile = async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    // Sanitize resumeText in validatedData as well
    if (Object.prototype.hasOwnProperty.call(validatedData, 'resumeText')) {
      const cleaned = typeof validatedData.resumeText === 'string' ? validatedData.resumeText.trim() : '';
      if (!cleaned) {
        delete validatedData.resumeText;
      } else {
        validatedData.resumeText = cleaned;
      }
    }

    const user = req.user;

    Object.assign(user, validatedData);

    await user.save();

    res.json({ msg: 'Profile updated successfully' });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        errors: err.errors.map(e => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }

    res.status(500).json({ msg: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // return sanitized user object (remove sensitive fields if present)
    const { password, ...safeUser } = user.toObject ? user.toObject() : user;

    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
module.exports = {
  setupProfile,
  updateProfile,
  getProfile,
};