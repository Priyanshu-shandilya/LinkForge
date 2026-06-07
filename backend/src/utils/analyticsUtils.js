const UAParser = require('ua-parser-js');

/**
 * Parse user agent string into structured device info
 * @param {string} userAgentString
 * @returns {{ browser, os, device }}
 */
const parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString || '');
  const result = parser.getResult();

  const browser = result.browser.name
    ? `${result.browser.name} ${result.browser.version || ''}`.trim()
    : 'Unknown Browser';

  const os = result.os.name
    ? `${result.os.name} ${result.os.version || ''}`.trim()
    : 'Unknown OS';

  let device = 'desktop';
  if (result.device.type === 'mobile') device = 'mobile';
  else if (result.device.type === 'tablet') device = 'tablet';
  else if (!result.device.type && result.os.name) device = 'desktop';
  else device = 'unknown';

  return { browser, os, device };
};

/**
 * Extract referer domain from full referer URL
 * @param {string} referer
 * @returns {string}
 */
const parseReferer = (referer) => {
  if (!referer) return 'Direct';
  try {
    const url = new URL(referer);
    return url.hostname || 'Direct';
  } catch {
    return referer.length > 100 ? referer.substring(0, 100) : referer;
  }
};

/**
 * Aggregate click data for analytics response
 * @param {Array} clicks
 * @returns {Object} Aggregated analytics
 */
const aggregateAnalytics = (clicks) => {
  const browserMap = {};
  const osMap = {};
  const deviceMap = {};
  const refererMap = {};
  const dailyMap = {};

  clicks.forEach((click) => {
    // Browser
    const browser = click.browser || 'Unknown';
    browserMap[browser] = (browserMap[browser] || 0) + 1;

    // OS
    const os = click.os || 'Unknown';
    osMap[os] = (osMap[os] || 0) + 1;

    // Device
    const device = click.device || 'unknown';
    deviceMap[device] = (deviceMap[device] || 0) + 1;

    // Referer
    const referer = click.referer || 'Direct';
    refererMap[referer] = (refererMap[referer] || 0) + 1;

    // Daily clicks
    const day = new Date(click.timestamp).toISOString().split('T')[0];
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  });

  const toArray = (map) =>
    Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  // Build daily series sorted by date
  const dailyClicks = Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    browsers: toArray(browserMap),
    operatingSystems: toArray(osMap),
    devices: toArray(deviceMap),
    referers: toArray(refererMap),
    dailyClicks,
  };
};

module.exports = { parseUserAgent, parseReferer, aggregateAnalytics };
