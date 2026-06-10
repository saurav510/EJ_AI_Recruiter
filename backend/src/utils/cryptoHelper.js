const crypto = require('crypto');

/**
 * Hashes a plain text password using PBKDF2.
 * @param {string} password - The plain text password
 * @returns {string} The salted and hashed password format (salt:hash)
 */
const hashPassword = (password) => {
  if (!password) throw new Error('Password is required for hashing');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * Verifies a plain text password against a stored hashed password.
 * @param {string} password - The plain text password
 * @param {string} storedPassword - The salt:hash string from DB
 * @returns {boolean} True if matching, false otherwise
 */
const verifyPassword = (password, storedPassword) => {
  if (!password || !storedPassword) return false;
  const parts = storedPassword.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

module.exports = {
  hashPassword,
  verifyPassword
};
