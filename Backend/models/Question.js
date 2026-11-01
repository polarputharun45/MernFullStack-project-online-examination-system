
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Please select an exam."],
      index: true,
    },

    questionText: {
      type: String,
      required: [true, "Question text is required."],
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          Array.isArray(options) &&
          options.length >= 2 &&
          options.every(
            (option) =>
              typeof option === "string" &&
              option.trim().length > 0
          ),
        message: "Provide at least two non-empty options.",
      },
    },

    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required."],
      trim: true,
    },

    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
