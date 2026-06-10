const User = require('../models/User');
const { verifyToken } = require('../utils/tokenHelper');

/**
 * Protect routes by verifying authorization headers containing JWTs
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, error: 'Not authorized, token verification failed' });
      }

      // Get user from database (exclude password hash)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user no longer exists' });
      }

      // Set user on request object
      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error);
      return res.status(401).json({ success: false, error: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
