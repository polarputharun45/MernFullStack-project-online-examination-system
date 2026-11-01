
const mongoose = require("mongoose");

const questionBankItemSchema = new mongoose.Schema(
  {
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
          options.length === 4 &&
          options.every(
            (option) =>
              typeof option === "string" &&
              option.trim().length > 0
          ),
        message: "Exactly four non-empty options are required.",
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

    sourceFileName: {
      type: String,
      default: "",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the correct answer matches one of the options
questionBankItemSchema.pre("validate", function () {
  if (
    this.correctAnswer &&
    Array.isArray(this.options) &&
    !this.options.includes(this.correctAnswer)
  ) {
    this.invalidate(
      "correctAnswer",
      "Correct answer must match one of the four options."
    );
  }
});

module.exports = mongoose.model(
  "QuestionBankItem",
  questionBankItemSchema
);
