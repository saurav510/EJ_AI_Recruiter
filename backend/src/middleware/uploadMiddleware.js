const multer = require('multer');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['pdf', 'docx'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Use memory storage — we parse in-memory and never write to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split('.').pop().toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Invalid file type. Only PDF and DOCX files are accepted.`),
      false
    );
  }
  cb(null, true);
};

const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

const uploadArray = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 5,
  },
});

// Middleware wrapper that returns a clean JSON error on multer failures
const resumeUpload = (req, res, next) => {
  const uploader = uploadSingle.single('resume');

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please attach a PDF or DOCX resume.',
      });
    }

    next();
  });
};

const multiResumeUpload = (req, res, next) => {
  const uploader = uploadArray.array('resumes', 5);

  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `One of the files is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`,
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded. Please attach at least one PDF or DOCX resume.',
      });
    }

    next();
  });
};

module.exports = {
  resumeUpload,
  multiResumeUpload
};
