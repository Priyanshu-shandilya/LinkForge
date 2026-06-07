const Url = require('../models/Url');
const { generateShortCode, validateAlias, validateUrl } = require('../utils/urlUtils');
const { parseUserAgent, parseReferer, aggregateAnalytics } = require('../utils/analyticsUtils');
const QRCode = require('qrcode');
const NodeCache = require('node-cache');

// In-memory cache: TTL 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

// ─── CREATE SHORT URL ────────────────────────────────────────────────────────
exports.createUrl = async (req, res) => {
  try {
    const {
      originalUrl,
      customAlias,
      title,
      description,
      expiresAt,
      clickLimit,
      tags,
      utmSource,
      utmMedium,
      utmCampaign,
    } = req.body;

    // Validate original URL
    const urlValidation = validateUrl(originalUrl);
    if (!urlValidation.valid) {
      return res.status(400).json({ error: urlValidation.message });
    }

    let shortCode;

    if (customAlias) {
      const aliasValidation = validateAlias(customAlias);
      if (!aliasValidation.valid) {
        return res.status(400).json({ error: aliasValidation.message });
      }
      // Check uniqueness
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        return res.status(409).json({ error: 'This custom alias is already taken' });
      }
      shortCode = customAlias;
    } else {
      // Generate unique code
      let attempts = 0;
      do {
        shortCode = generateShortCode(7);
        attempts++;
        if (attempts > 10) return res.status(500).json({ error: 'Could not generate unique short code' });
      } while (await Url.findOne({ shortCode }));
    }

    // Build UTM params if provided
    let finalUrl = urlValidation.normalized;
    if (utmSource || utmMedium || utmCampaign) {
      const urlObj = new URL(finalUrl);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      finalUrl = urlObj.toString();
    }

    const newUrl = await Url.create({
      originalUrl: finalUrl,
      shortCode,
      customAlias: customAlias || null,
      title: title || null,
      description: description || null,
      owner: req.user ? req.user._id : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      clickLimit: clickLimit || null,
      tags: tags || [],
      utmSource, utmMedium, utmCampaign,
    });

    // Update user URL count
    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalUrls: 1 } });
    }

    res.status(201).json({
      success: true,
      data: {
        id: newUrl._id,
        originalUrl: newUrl.originalUrl,
        shortCode: newUrl.shortCode,
        shortUrl: newUrl.shortUrl,
        customAlias: newUrl.customAlias,
        title: newUrl.title,
        expiresAt: newUrl.expiresAt,
        clickLimit: newUrl.clickLimit,
        tags: newUrl.tags,
        createdAt: newUrl.createdAt,
      },
    });
  } catch (err) {
    console.error('createUrl error:', err);
    res.status(500).json({ error: 'Server error while creating URL' });
  }
};

// ─── GET ALL URLS (for logged-in user) ──────────────────────────────────────
exports.getMyUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { owner: req.user._id };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [urls, total] = await Promise.all([
      Url.find(query)
        .select('-clicks -uniqueIPs')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Url.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: urls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
};

// ─── GET SINGLE URL INFO ─────────────────────────────────────────────────────
exports.getUrl = async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code,
      owner: req.user._id,
    }).select('-clicks -uniqueIPs');

    if (!url) return res.status(404).json({ error: 'URL not found' });

    res.json({ success: true, data: url });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── UPDATE URL ──────────────────────────────────────────────────────────────
exports.updateUrl = async (req, res) => {
  try {
    const { title, description, expiresAt, clickLimit, isActive, tags } = req.body;

    const url = await Url.findOne({
      shortCode: req.params.code,
      owner: req.user._id,
    });

    if (!url) return res.status(404).json({ error: 'URL not found' });

    if (title !== undefined) url.title = title;
    if (description !== undefined) url.description = description;
    if (expiresAt !== undefined) url.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (clickLimit !== undefined) url.clickLimit = clickLimit;
    if (isActive !== undefined) url.isActive = isActive;
    if (tags !== undefined) url.tags = tags;

    await url.save();

    // Invalidate cache
    cache.del(url.shortCode);

    res.json({ success: true, data: url });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating URL' });
  }
};

// ─── DELETE URL ──────────────────────────────────────────────────────────────
exports.deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({
      shortCode: req.params.code,
      owner: req.user._id,
    });

    if (!url) return res.status(404).json({ error: 'URL not found' });

    cache.del(req.params.code);

    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting URL' });
  }
};

// ─── GENERATE QR CODE ───────────────────────────────────────────────────────
exports.generateQR = async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code, owner: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found' });

    const qrDataUrl = await QRCode.toDataURL(url.shortUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    res.json({ success: true, qrCode: qrDataUrl, shortUrl: url.shortUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error generating QR code' });
  }
};

// ─── GET ANALYTICS ───────────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code,
      owner: req.user._id,
    }).select('+uniqueIPs');

    if (!url) return res.status(404).json({ error: 'URL not found' });

    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const filteredClicks = url.clicks.filter(
      (c) => new Date(c.timestamp) >= since
    );

    const aggregated = aggregateAnalytics(filteredClicks);

    res.json({
      success: true,
      data: {
        shortCode: url.shortCode,
        shortUrl: url.shortUrl,
        originalUrl: url.originalUrl,
        totalClicks: url.totalClicks,
        uniqueClicks: url.uniqueClicks,
        clicksInPeriod: filteredClicks.length,
        ...aggregated,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

// ─── REDIRECT HANDLER (called from redirect route) ──────────────────────────
exports.handleRedirect = async (req, res) => {
  try {
    const { code } = req.params;

    // Check cache first
    let url = cache.get(code);

    if (!url) {
      url = await Url.findOne({ shortCode: code }).select('+uniqueIPs');
      if (!url) return res.status(404).send(notFoundPage(code));
      cache.set(code, url);
    }

    // Validate state
    if (!url.isActive) return res.status(410).send(expiredPage('This link has been deactivated.'));
    if (url.isExpired) return res.status(410).send(expiredPage('This link has expired.'));
    if (url.isClickLimitReached) return res.status(410).send(expiredPage('This link has reached its click limit.'));

    // Record click asynchronously
    recordClick(url, req).catch(console.error);

    // Redirect
    return res.redirect(302, url.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server Error');
  }
};

// ─── INTERNAL: Record click ──────────────────────────────────────────────────
async function recordClick(url, req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || '';
  const referer = parseReferer(req.headers['referer'] || req.headers['referrer'] || '');
  const { browser, os, device } = parseUserAgent(userAgent);

  const isUnique = !url.uniqueIPs.includes(ip);

  const click = { timestamp: new Date(), ip, userAgent, referer, browser, os, device };

  const updateOp = {
    $push: { clicks: click },
    $inc: { totalClicks: 1 },
  };

  if (isUnique) {
    updateOp.$inc.uniqueClicks = 1;
    updateOp.$push.uniqueIPs = ip;
  }

  await Url.findByIdAndUpdate(url._id, updateOp);

  // Invalidate cache so next request gets fresh data
  cache.del(url.shortCode);
}

// ─── HTML PAGES ──────────────────────────────────────────────────────────────
function notFoundPage(code) {
  return `<!DOCTYPE html><html><head><title>Not Found</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f0f0f;color:#fff;}</style></head><body><div style="text-align:center"><h1>404</h1><p>The short link <strong>${code}</strong> does not exist.</p><a href="${process.env.FRONTEND_URL}" style="color:#6366f1">Create your own link →</a></div></body></html>`;
}

function expiredPage(message) {
  return `<!DOCTYPE html><html><head><title>Link Unavailable</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f0f0f;color:#fff;}</style></head><body><div style="text-align:center"><h1>🔒</h1><p>${message}</p><a href="${process.env.FRONTEND_URL}" style="color:#6366f1">Create your own link →</a></div></body></html>`;
}
