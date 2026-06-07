const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Url = require('../models/Url');

// GET /api/analytics/overview — dashboard summary for logged-in user
router.get('/overview', protect, async (req, res) => {
  try {
    const urls = await Url.find({ owner: req.user._id }).select('totalClicks uniqueClicks createdAt isActive expiresAt');

    const totalUrls = urls.length;
    const activeUrls = urls.filter(u => u.isActive && !u.isExpired).length;
    const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);
    const uniqueClicks = urls.reduce((sum, u) => sum + u.uniqueClicks, 0);

    // Last 7 days clicks
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Top performing URLs
    const topUrls = await Url.find({ owner: req.user._id })
      .select('shortCode originalUrl title totalClicks uniqueClicks createdAt')
      .sort({ totalClicks: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUrls,
        activeUrls,
        totalClicks,
        uniqueClicks,
        topUrls,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics overview' });
  }
});

module.exports = router;
