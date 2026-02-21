const {
  setupProfileSchema,
  updateProfileSchema,
} = require('../validations/profileValidation');


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

module.exports = {
  setupProfile,
  updateProfile,
};