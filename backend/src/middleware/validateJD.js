const validateJD = (req, res, next) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({
      success: false,
      error: 'Job description is required.',
    });
  }

  if (typeof jobDescription !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Job description must be a string.',
    });
  }

  const trimmed = jobDescription.trim();

  if (trimmed.length < 100) {
    return res.status(400).json({
      success: false,
      error: 'Job description is too short. Please provide at least 100 characters.',
    });
  }

  if (trimmed.length > 20000) {
    return res.status(400).json({
      success: false,
      error: 'Job description exceeds the 20,000 character limit.',
    });
  }

  req.body.jobDescription = trimmed;
  next();
};

module.exports = validateJD;
