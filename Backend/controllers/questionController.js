
const mongoose = require("mongoose");
const Question = require("../models/Question");
const Exam = require("../models/Exam");

// Normalize question text from legacy and current field names.
const formatQuestion = (doc) => {
  if (!doc) return doc;

  const question =
    typeof doc.toObject === "function"
      ? doc.toObject()
      : { ...doc };

  const text =
    question.questionText ||
    question.question ||
    question.text ||
    "";

  return {
    ...question,
    questionText: text,
    question: text,
  };
};

// GET ALL QUESTIONS
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        const formatted = formatQuestion(q);

        if (q.exam) {
          const relatedExam = await Exam.findById(q.exam)
            .select("title subject")
            .lean();

          formatted.exam = relatedExam || q.exam;
        }

        return formatted;
      })
    );

    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    return res.status(200).json({
      success: true,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Get Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch questions.",
    });
  }
};

// GET QUESTIONS FOR A PARTICULAR EXAM
const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findById(examId).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    console.log("DATABASE:", mongoose.connection.name);
    console.log("COLLECTION:", Question.collection.name);
    console.log("EXAM ID:", examId);

    // Read the raw documents from the Question collection.
    const questions = await Question.collection
      .find({
        exam: new mongoose.Types.ObjectId(examId),
      })
      .sort({ createdAt: 1 })
      .toArray();

    console.log(
      "RAW QUESTIONS:",
      JSON.stringify(questions, null, 2)
    );

    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        const formatted = formatQuestion(q);

        if (q.exam) {
          const relatedExam = await Exam.findById(q.exam)
            .select("title subject")
            .lean();

          formatted.exam = relatedExam || q.exam;
        }

        return formatted;
      })
    );

    console.log(
      "FORMATTED QUESTIONS:",
      JSON.stringify(formattedQuestions, null, 2)
    );

    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    return res.status(200).json({
      success: true,
      exam,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("Get Questions By Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch questions for this exam.",
    });
  }
};

// CREATE QUESTION
const createQuestion = async (req, res) => {
  try {
    const {
      exam,
      question,
      questionText,
      options,
      correctAnswer,
      marks,
    } = req.body;

    const finalQuestion = questionText ?? question;

    if (
      !exam ||
      typeof finalQuestion !== "string" ||
      !finalQuestion.trim() ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some(
        (option) =>
          typeof option !== "string" || !option.trim()
      ) ||
      typeof correctAnswer !== "string" ||
      !correctAnswer.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exam, question text, four options and correct answer are required.",
      });
    }

    if (!mongoose.isValidObjectId(exam)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const selectedExam = await Exam.findById(exam);

    if (!selectedExam) {
      return res.status(404).json({
        success: false,
        message: "Selected exam was not found.",
      });
    }

    const cleanedOptions = options.map((option) =>
      option.trim()
    );
    const cleanedAnswer = correctAnswer.trim();

    if (!cleanedOptions.includes(cleanedAnswer)) {
      return res.status(400).json({
        success: false,
        message:
          "Correct answer must match one of the four options.",
      });
    }

    const questionMarks =
      marks === undefined ? 1 : Number(marks);

    if (
      !Number.isFinite(questionMarks) ||
      questionMarks < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Marks must be at least 1.",
      });
    }

    const newQuestion = await Question.create({
      exam,
      questionText: finalQuestion.trim(),
      options: cleanedOptions,
      correctAnswer: cleanedAnswer,
      marks: questionMarks,
    });

    const savedQuestion = await Question.findById(
      newQuestion._id
    )
      .populate("exam", "title subject")
      .lean();

    const questionCount = await Question.countDocuments({
      exam,
    });

    await Exam.findByIdAndUpdate(exam, {
      totalQuestions: questionCount,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      question: formatQuestion(savedQuestion),
    });
  } catch (error) {
    console.error("Create Question Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to create question.",
    });
  }
};

// UPDATE QUESTION
const updateQuestion = async (req, res) => {
  try {
    const {
      exam,
      question,
      questionText,
      options,
      correctAnswer,
      marks,
    } = req.body;

    const existingQuestion = await Question.findById(
      req.params.id
    );

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const oldExamId = existingQuestion.exam.toString();
    const newExamId = exam || oldExamId;

    const finalQuestion =
      questionText ??
      question ??
      existingQuestion.questionText ??
      existingQuestion.question;

    if (
      typeof finalQuestion !== "string" ||
      !finalQuestion.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question text is required.",
      });
    }

    if (!mongoose.isValidObjectId(newExamId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const selectedExam = await Exam.findById(newExamId);

    if (!selectedExam) {
      return res.status(404).json({
        success: false,
        message: "Selected exam was not found.",
      });
    }

    const finalOptions = options ?? existingQuestion.options;
    const finalAnswer =
      correctAnswer ?? existingQuestion.correctAnswer;
    const finalMarks = marks ?? existingQuestion.marks;

    if (
      !Array.isArray(finalOptions) ||
      finalOptions.length !== 4 ||
      finalOptions.some(
        (option) =>
          typeof option !== "string" || !option.trim()
      ) ||
      typeof finalAnswer !== "string" ||
      !finalOptions
        .map((option) => option.trim())
        .includes(finalAnswer.trim()) ||
      !Number.isFinite(Number(finalMarks)) ||
      Number(finalMarks) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid question details.",
      });
    }

    existingQuestion.exam = newExamId;
    existingQuestion.questionText = finalQuestion.trim();
    existingQuestion.options = finalOptions.map((option) =>
      option.trim()
    );
    existingQuestion.correctAnswer = finalAnswer.trim();
    existingQuestion.marks = Number(finalMarks);

    await existingQuestion.save();

    const updatedQuestion = await Question.findById(
      existingQuestion._id
    )
      .populate("exam", "title subject")
      .lean();

    for (const id of new Set([oldExamId, newExamId])) {
      const count = await Question.countDocuments({
        exam: id,
      });

      await Exam.findByIdAndUpdate(id, {
        totalQuestions: count,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      question: formatQuestion(updatedQuestion),
    });
  } catch (error) {
    console.error("Update Question Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to update question.",
    });
  }
};

// DELETE QUESTION
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(
      req.params.id
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const examId = question.exam.toString();

    const count = await Question.countDocuments({
      exam: examId,
    });

    await Exam.findByIdAndUpdate(examId, {
      totalQuestions: count,
    });

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Question Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to delete question.",
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionsByExam,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
