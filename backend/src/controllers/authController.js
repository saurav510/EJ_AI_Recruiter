const User = require('../models/User');
const JobAnalysis = require('../models/JobAnalysis');
const Resume = require('../models/Resume');
const CandidateMatch = require('../models/CandidateMatch');
const OutreachMessage = require('../models/OutreachMessage');
const { hashPassword, verifyPassword } = require('../utils/cryptoHelper');
const { signToken } = require('../utils/tokenHelper');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Please enter all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'User already exists with this email address' });
  }

  // Hash password
  const hashedPassword = hashPassword(password);

  // Create User
  const user = new User({
    name,
    email,
    password: hashedPassword
  });

  await user.save();

  // Sign Token
  const token = signToken({ id: user._id });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    }
  });
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please enter all fields' });
  }

  // Find User by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Verify password
  const isMatch = verifyPassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Sign Token
  const token = signToken({ id: user._id });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    }
  });
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = req.user;
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User profile not found' });
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
};

/**
 * @desc    Get system dashboard stats
 * @route   GET /api/auth/stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalJDs, totalResumes, totalMatches, totalOutreach] = await Promise.all([
      JobAnalysis.countDocuments(),
      Resume.countDocuments(),
      CandidateMatch.countDocuments(),
      OutreachMessage.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJDs,
        totalResumes,
        totalMatches,
        totalOutreach,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getDashboardStats
};
