
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getExams,
  getExamById,
  getExamQuestions,
  getExamAttemptStatus,
  submitExam,
  createExam,
  updateExam,
  deleteExam,
} = require("../controllers/examController");

const router = express.Router();

router.get("/", protect, getExams);
router.get("/:id/attempt-status", protect, getExamAttemptStatus);
router.get("/:id/questions", protect, getExamQuestions);
router.post("/:id/submit", protect, submitExam);
router.get("/:id", protect, getExamById);

router.post("/", protect, createExam);
router.put("/:id", protect, updateExam);
router.delete("/:id", protect, deleteExam);

module.exports = router;
