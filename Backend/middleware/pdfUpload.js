
const multer = require("multer");

// Store uploaded PDF in memory temporarily
const storage = multer.memoryStorage();

// Allow only PDF files
const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" &&
    file.originalname.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."));
  }
};

// Configure upload
const uploadPdf = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadPdf;
