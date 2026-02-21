const UserBadge = require('../models/UserBadge');
const User = require('../models/User');

const getUserBadges = async (req, res) => {
  try {
    const badges = await UserBadge.find({ user: req.user._id })
      .populate('badge');

    res.json(badges);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch badges' });
  }
};

/**
 * Public endpoint: view a shared badge via its shareToken
 * No auth required — anyone with the link can see it.
 */
const getSharedBadge = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: 'Share token required' });
    }

    const userBadge = await UserBadge.findOne({ shareToken: token }).populate('badge');

    if (!userBadge) {
      return res.status(404).json({ msg: 'Badge not found or link is invalid' });
    }

    // Get the user's name for display
    const user = await User.findById(userBadge.user).select('name');

    res.json({
      badge: {
        name: userBadge.badge.name,
        description: userBadge.badge.description,
        icon: userBadge.badge.icon,
        type: userBadge.badge.type,
      },
      awardedTo: user?.name || 'CarEvo User',
      awardedAt: userBadge.awardedAt,
      shareToken: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to load shared badge' });
  }
};

module.exports = { getUserBadges, getSharedBadge };