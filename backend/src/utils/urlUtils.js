const { nanoid } = require('nanoid');

/**
 * Generates a unique short code using nanoid.
 * Default length: 7 characters → ~56 trillion combinations
 * Alphabet: a-z, A-Z, 0-9, -, _ (URL-safe)
 * @param {number} length - Length of the short code
 * @returns {string} - Generated short code
 */
const generateShortCode = (length = 7) => {
  // nanoid uses URL-safe alphabet by default (A-Za-z0-9_-)
  return nanoid(length);
};

/**
 * Validates a custom alias
 * - 3 to 50 characters
 * - Only letters, numbers, hyphens, underscores
 * @param {string} alias
 * @returns {{ valid: boolean, message?: string }}
 */
const validateAlias = (alias) => {
  if (!alias) return { valid: false, message: 'Alias is empty' };
  if (alias.length < 3) return { valid: false, message: 'Alias must be at least 3 characters' };
  if (alias.length > 50) return { valid: false, message: 'Alias must be at most 50 characters' };
  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
    return { valid: false, message: 'Alias can only contain letters, numbers, hyphens, and underscores' };
  }
  // Reserved paths that cannot be used as aliases
  const reserved = ['api', 'auth', 'admin', 'health', 'login', 'register', 'dashboard', 'analytics', 'settings'];
  if (reserved.includes(alias.toLowerCase())) {
    return { valid: false, message: `"${alias}" is a reserved word and cannot be used as an alias` };
  }
  return { valid: true };
};

/**
 * Validate and normalize a URL
 * @param {string} url
 * @returns {{ valid: boolean, normalized?: string, message?: string }}
 */
const validateUrl = (url) => {
  try {
    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, message: 'Only HTTP and HTTPS URLs are supported' };
    }
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { valid: false, message: 'Invalid URL hostname' };
    }
    return { valid: true, normalized: parsed.toString() };
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }
};

module.exports = { generateShortCode, validateAlias, validateUrl };
