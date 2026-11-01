const mongoose = require("mongoose");

const examQuestionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent assigning the same question twice to one exam
examQuestionSchema.index(
  { exam: 1, question: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ExamQuestion",
  examQuestionSchema
);