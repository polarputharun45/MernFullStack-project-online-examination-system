const express = require("express");

const {
  assignQuestionsToExam,
} = require("../controllers/examQuestionController");

const router = express.Router();

// Assign selected Question Bank questions to an exam
router.post("/assign", assignQuestionsToExam);

module.exports = router;
