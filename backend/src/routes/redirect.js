const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/urlController');

// GET /:code — redirect short URL
router.get('/:code([a-zA-Z0-9_-]{3,50})', handleRedirect);

module.exports = router;
