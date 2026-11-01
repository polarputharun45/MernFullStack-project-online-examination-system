
const express = require("express");

const uploadPdf = require("../middleware/pdfUpload");

const {
  extractPdfQuestions,
} = require("../controllers/pdfQuestionController");

const router = express.Router();

console.log("PDF upload middleware:", typeof uploadPdf);
console.log("PDF extraction controller:", typeof extractPdfQuestions);

router.post(
  "/extract",
  uploadPdf.single("pdf"),
  extractPdfQuestions
);

module.exports = router;
