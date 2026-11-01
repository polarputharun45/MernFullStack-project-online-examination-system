
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    difficulty: {
      type: String,
      default: "Beginner",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Admin controls the number of attempts allowed.
    maxAttempts: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 3,
      validate: {
        validator: Number.isInteger,
        message: "Maximum attempts must be a whole number.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
