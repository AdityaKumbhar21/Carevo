const {
  setupProfileSchema,
  updateProfileSchema,
} = require('../validators/profileValidator');


const setupProfile = async (req, res) => {
  try {
    const validatedData = setupProfileSchema.parse(req.body);

    const user = req.user;

    Object.assign(user, validatedData);

    await user.save();

    res.json({ msg: 'Profile setup complete' });
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


const updateProfile = async (req, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

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