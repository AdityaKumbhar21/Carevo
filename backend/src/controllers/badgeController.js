const UserBadge = require('../models/UserBadge');

const getUserBadges = async (req, res) => {
  try {
    const badges = await UserBadge.find({ user: req.user._id })
      .populate('badge');

    res.json(badges);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch badges' });
  }
};

module.exports = { getUserBadges };