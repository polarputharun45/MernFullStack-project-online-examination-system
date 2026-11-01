
const express = require("express");

const {
  getQuestions,
  getQuestionsByExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

const router = express.Router();

// Get all questions
router.get("/", getQuestions);

// Get questions for a specific exam
router.get("/exam/:examId", getQuestionsByExam);

// Add a question
router.post("/", createQuestion);

// Update a question
router.put("/:id", updateQuestion);

// Delete a question
router.delete("/:id", deleteQuestion);

module.exports = router;
