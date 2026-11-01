
const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");
const User = require("../models/User");

// GET ALL EXAMS
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });

    if (req.user?.role !== "student") {
      return res.status(200).json({ success: true, exams });
    }

    const studentId = req.user.userId;
    const results = await Result.find({ student: studentId })
      .select("exam")
      .lean();

    const attemptsByExam = {};

    for (const result of results) {
      const examId = String(result.exam);
      attemptsByExam[examId] = (attemptsByExam[examId] || 0) + 1;
    }

    const examsWithStatus = exams.map((exam) => {
      const examData = exam.toObject();
      const examId = String(exam._id);
      const attemptsUsed = attemptsByExam[examId] || 0;
      const maxAttempts = Number(exam.maxAttempts) || 1;

      return {
        ...examData,
        attemptsUsed,
        maxAttempts,
        hasAttempted: attemptsUsed > 0,
        isCompleted: attemptsUsed >= maxAttempts,
      };
    });

    return res.status(200).json({
      success: true,
      exams: examsWithStatus,
    });
  } catch (error) {
    console.error("Get Exams Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching exams.",
    });
  }
};

// GET SINGLE EXAM
const getExamById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error("Get Exam Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching exam.",
    });
  }
};

// GET EXAM QUESTIONS
// Correct answer ni student ki send cheyyakudadhu.
const getExamQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findOne({
      _id: id,
      isActive: true,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Active exam not found.",
      });
    }

    // IMPORTANT FIX:
    // questionText and old question field rendu select chesthunnam.
    const questions = await Question.find({ exam: id })
      .select("questionText question options marks")
      .sort({ createdAt: 1 })
      .lean();

    const formattedQuestions = questions.map((q) => {
      const text = q.questionText || q.question || q.text || "";

      return {
        _id: q._id,
        questionText: text,
        question: text,
        options: q.options || [],
        marks: q.marks || 1,
      };
    });

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
    console.error("Get Exam Questions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch exam questions.",
    });
  }
};

// CHECK STUDENT ATTEMPT STATUS
const getExamAttemptStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user?.userId;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(studentId || "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam or student ID.",
      });
    }

    if (req.user?.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can check attempt status.",
      });
    }

    const exam = await Exam.findOne({ _id: id, isActive: true });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Active exam not found.",
      });
    }

    const maxAttempts = Number(exam.maxAttempts) || 1;
    const attemptsUsed = await Result.countDocuments({
      student: studentId,
      exam: exam._id,
    });

    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

    return res.status(200).json({
      success: true,
      maxAttempts,
      attemptsUsed,
      attemptsRemaining,
      canAttempt: attemptsRemaining > 0,
    });
  } catch (error) {
    console.error("Attempt Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to check attempt status.",
    });
  }
};

// SUBMIT EXAM
const submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const studentId = req.user?.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    if (
      !studentId ||
      !mongoose.isValidObjectId(studentId) ||
      req.user?.role !== "student"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only authenticated students can submit exams.",
      });
    }

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Please submit valid exam answers.",
      });
    }

    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(401).json({
        success: false,
        message: "Student account not found.",
      });
    }

    const exam = await Exam.findOne({ _id: id, isActive: true });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Active exam not found.",
      });
    }

    const maxAttempts = Number(exam.maxAttempts) || 1;
    const attemptsUsed = await Result.countDocuments({
      student: student._id,
      exam: exam._id,
    });

    if (attemptsUsed >= maxAttempts) {
      return res.status(409).json({
        success: false,
        alreadyAttempted: true,
        message: "You have used all allowed attempts for this exam.",
        maxAttempts,
        attemptsUsed,
        attemptsRemaining: 0,
      });
    }

    const questions = await Question.find({ exam: exam._id })
      .sort({ createdAt: 1 });

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This exam has no questions yet.",
      });
    }

    let score = 0;
    let totalMarks = 0;

    for (const question of questions) {
      const marks = Number(question.marks) || 1;
      totalMarks += marks;

      const submittedAnswer = answers[question._id.toString()];
      const correctAnswer = question.correctAnswer;

      const isCorrect =
        typeof submittedAnswer === "string" &&
        typeof correctAnswer === "string" &&
        submittedAnswer.trim() === correctAnswer.trim();

      if (isCorrect) score += marks;
    }

    const percentage =
      totalMarks > 0
        ? Math.round((score / totalMarks) * 10000) / 100
        : 0;

    const status = percentage >= 40 ? "Passed" : "Failed";

    const result = await Result.create({
      student: student._id,
      exam: exam._id,
      score,
      totalQuestions: totalMarks,
      percentage,
      status,
      completedAt: new Date(),
    });

    const attemptsUsedAfterSubmit = attemptsUsed + 1;

    return res.status(201).json({
      success: true,
      message: "Exam submitted and result saved successfully.",
      result: {
        _id: result._id,
        exam: exam.title,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        status: result.status,
        completedAt: result.completedAt,
        maxAttempts,
        attemptsUsed: attemptsUsedAfterSubmit,
        attemptsRemaining: Math.max(
          0,
          maxAttempts - attemptsUsedAfterSubmit
        ),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        alreadyAttempted: true,
        message:
          "A duplicate result was prevented. Check your Result indexes if multiple attempts are enabled.",
      });
    }

    console.error("Submit Exam Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit exam and save result.",
    });
  }
};

// CREATE EXAM
const createExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      duration,
      totalQuestions,
      difficulty,
      isActive,
      maxAttempts,
    } = req.body;

    const attempts =
      maxAttempts === undefined ? 1 : Number(maxAttempts);

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof subject !== "string" ||
      !subject.trim() ||
      !Number.isFinite(Number(duration)) ||
      Number(duration) <= 0 ||
      !Number.isInteger(Number(totalQuestions)) ||
      Number(totalQuestions) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter valid title, subject, duration and total questions.",
      });
    }

    if (!Number.isInteger(attempts) || attempts < 1 || attempts > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum attempts must be 1, 2, or 3.",
      });
    }

    const exam = await Exam.create({
      title: title.trim(),
      subject: subject.trim(),
      description: description || "",
      duration: Number(duration),
      totalQuestions: Number(totalQuestions),
      difficulty: difficulty || "Beginner",
      isActive: isActive !== false,
      maxAttempts: attempts,
    });

    return res.status(201).json({
      success: true,
      message: "Exam created successfully.",
      exam,
    });
  } catch (error) {
    console.error("Create Exam Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating exam.",
    });
  }
};

// UPDATE EXAM
const updateExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      duration,
      totalQuestions,
      difficulty,
      isActive,
      maxAttempts,
    } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Exam title cannot be empty.",
        });
      }
      updates.title = title.trim();
    }

    if (subject !== undefined) {
      if (typeof subject !== "string" || !subject.trim()) {
        return res.status(400).json({
          success: false,
          message: "Subject cannot be empty.",
        });
      }
      updates.subject = subject.trim();
    }

    if (description !== undefined) updates.description = description;

    if (duration !== undefined) {
      if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be greater than zero.",
        });
      }
      updates.duration = Number(duration);
    }

    if (totalQuestions !== undefined) {
      if (
        !Number.isInteger(Number(totalQuestions)) ||
        Number(totalQuestions) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Question count must be a positive integer.",
        });
      }
      updates.totalQuestions = Number(totalQuestions);
    }

    if (difficulty !== undefined) updates.difficulty = difficulty;

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false.",
        });
      }
      updates.isActive = isActive;
    }

    if (maxAttempts !== undefined) {
      const attempts = Number(maxAttempts);

      if (!Number.isInteger(attempts) || attempts < 1 || attempts > 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum attempts must be 1, 2, or 3.",
        });
      }
      updates.maxAttempts = attempts;
    }

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully.",
      exam,
    });
  } catch (error) {
    console.error("Update Exam Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating exam.",
    });
  }
};

// DELETE EXAM
const deleteExam = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Exam Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting exam.",
    });
  }
};

module.exports = {
  getExams,
  getExamById,
  getExamQuestions,
  getExamAttemptStatus,
  submitExam,
  createExam,
  updateExam,
  deleteExam,
};
