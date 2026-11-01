
const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalExams,
      totalQuestions,
      totalAttempts,
      recentExams,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Exam.countDocuments(),
      Question.countDocuments(),
      Result.countDocuments(),

      Exam.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
    ]);

    const examsWithDetails = await Promise.all(
      recentExams.map(async (exam) => {
        const [questionCount, studentCount] =
          await Promise.all([
            Question.countDocuments({ exam: exam._id }),
            Result.distinct("student", { exam: exam._id }),
          ]);

        return {
          _id: exam._id,
          name: exam.title,
          subject: exam.subject,
          students: studentCount.length,
          questions: questionCount,
          status: exam.isActive ? "Active" : "Inactive",
        };
      })
    );

    res.status(200).json({
      success: true,
      statistics: {
        totalStudents,
        totalExams,
        totalQuestions,
        totalAttempts,
      },
      recentExams: examsWithDetails,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard data.",
    });
  }
};

module.exports = { getDashboardStats };
