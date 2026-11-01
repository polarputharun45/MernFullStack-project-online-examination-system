
const mongoose = require("mongoose");
const QuestionBankItem = require("../models/QuestionBankItem");

// ==========================================
// 1. SAVE EXTRACTED QUESTIONS
// ==========================================

const saveBankQuestions = async (req, res) => {
  try {
    const { questions, sourceFileName } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one question.",
      });
    }

    const savedQuestions = [];

    for (const item of questions) {
      if (
        !item.questionText ||
        !Array.isArray(item.options) ||
        item.options.length !== 4 ||
        !item.correctAnswer ||
        !item.options.includes(item.correctAnswer)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid question. Check its text, four options and correct answer.",
        });
      }

      const question = await QuestionBankItem.create({
        questionText: item.questionText.trim(),
        options: item.options.map((option) => option.trim()),
        correctAnswer: item.correctAnswer.trim(),
        marks: item.marks || 1,
        sourceFileName: sourceFileName || "",
        isApproved: false,
      });

      savedQuestions.push(question);
    }

    return res.status(201).json({
      success: true,
      message: "Questions saved as pending approval.",
      totalSaved: savedQuestions.length,
      questions: savedQuestions,
    });

  } catch (error) {
    console.error("Save Question Bank Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save questions.",
      error: error.message,
    });
  }
};


// ==========================================
// 2. GET ALL QUESTION BANK QUESTIONS
// ==========================================

const getBankQuestions = async (req, res) => {
  try {
    const questions = await QuestionBankItem.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalQuestions: questions.length,
      questions,
    });

  } catch (error) {
    console.error("Get Question Bank Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Question Bank.",
    });
  }
};


// ==========================================
// 3. APPROVE A QUESTION
// ==========================================

const approveBankQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await QuestionBankItem.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question approved successfully.",
      question,
    });

  } catch (error) {
    console.error("Approve Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve question.",
    });
  }
};


// ==========================================
// 4. UPDATE A QUESTION
// ==========================================

const updateBankQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const { questionText, options, correctAnswer, marks } = req.body;

    if (
      !questionText ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((option) => typeof option !== "string" || !option.trim()) ||
      !correctAnswer ||
      !options.includes(correctAnswer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide question text, four options and a matching correct answer.",
      });
    }

    const question = await QuestionBankItem.findByIdAndUpdate(
      req.params.id,
      {
        questionText: questionText.trim(),
        options: options.map((option) => option.trim()),
        correctAnswer: correctAnswer.trim(),
        marks: marks || 1,
        isApproved: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated. Please review and approve it again.",
      question,
    });

  } catch (error) {
    console.error("Update Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update question.",
      error: error.message,
    });
  }
};


// ==========================================
// 5. DELETE A QUESTION
// ==========================================

const deleteBankQuestion = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await QuestionBankItem.findByIdAndDelete(
      req.params.id
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete question.",
    });
  }
};


// ==========================================
// 6. EXPORT FUNCTIONS
// ==========================================

module.exports = {
  saveBankQuestions,
  getBankQuestions,
  approveBankQuestion,
  updateBankQuestion,
  deleteBankQuestion,
};
