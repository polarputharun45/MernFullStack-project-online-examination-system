const mongoose = require("mongoose");

const Exam = require("../models/Exam");
const Question = require("../models/Question");
const QuestionBankItem = require("../models/QuestionBankItem");
const ExamQuestion = require("../models/ExamQuestion");

// ==========================================
// 1. ASSIGN QUESTIONS TO AN EXAM
// ==========================================

const assignQuestionsToExam = async (req, res) => {
  try {
    const { examId, questionIds } = req.body;

    // Validate exam ID
    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    // Validate question IDs
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one question.",
      });
    }

    if (questionIds.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        success: false,
        message: "One or more question IDs are invalid.",
      });
    }

    // Remove duplicate IDs from the request
    const uniqueIds = [...new Set(questionIds)];

    // Check whether exam exists
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    // Find approved Question Bank items
    const bankQuestions = await QuestionBankItem.find({
      _id: { $in: uniqueIds },
      isApproved: true,
    });

    if (bankQuestions.length !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some selected questions are missing or not approved.",
      });
    }

    // Check existing assignments
    const existingAssignments = await ExamQuestion.find({
      exam: examId,
      question: { $in: uniqueIds },
    }).select("question");

    const existingIds = new Set(
      existingAssignments.map((item) => item.question.toString())
    );

    const newBankQuestions = bankQuestions.filter(
      (item) => !existingIds.has(item._id.toString())
    );

    if (newBankQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All selected questions are already assigned to this exam.",
      });
    }

    // Copy approved questions into the existing Question collection
    const createdQuestions = await Question.insertMany(
      newBankQuestions.map((item) => ({
        exam: examId,
        questionText: item.questionText,
        options: item.options,
        correctAnswer: item.correctAnswer,
        marks: item.marks,
      }))
    );

    // Create exam-question assignment records
    await ExamQuestion.insertMany(
      createdQuestions.map((item) => ({
        exam: examId,
        question: item._id,
      }))
    );

    // Update total question count
    const totalQuestions = await Question.countDocuments({
      exam: examId,
    });

    exam.totalQuestions = totalQuestions;
    await exam.save();

    return res.status(201).json({
      success: true,
      message: "Questions assigned to exam successfully.",
      totalAssigned: createdQuestions.length,
      totalQuestions,
      questions: createdQuestions,
    });

  } catch (error) {
    console.error("Assign Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign questions to exam.",
      error: error.message,
    });
  }
};


// ==========================================
// 2. EXPORT CONTROLLER
// ==========================================

module.exports = {
  assignQuestionsToExam,
};