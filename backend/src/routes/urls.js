const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  createUrl,
  getMyUrls,
  getUrl,
  updateUrl,
  deleteUrl,
  generateQR,
  getAnalytics,
} = require('../controllers/urlController');

// POST /api/urls — create short URL (optional auth)
router.post('/', optionalAuth, createUrl);

// GET /api/urls — get all URLs for logged-in user
router.get('/', protect, getMyUrls);

// GET /api/urls/:code — get single URL
router.get('/:code', protect, getUrl);

// PUT /api/urls/:code — update URL
router.put('/:code', protect, updateUrl);

// DELETE /api/urls/:code — delete URL
router.delete('/:code', protect, deleteUrl);

// GET /api/urls/:code/qr — generate QR code
router.get('/:code/qr', protect, generateQR);

// GET /api/urls/:code/analytics — analytics
router.get('/:code/analytics', protect, getAnalytics);

module.exports = router;
