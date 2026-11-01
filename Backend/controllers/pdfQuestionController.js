
const { PDFParse } = require("pdf-parse");

// ==========================================
// 1. EXTRACT MCQ QUESTIONS AND ANSWERS
// ==========================================

const parseMCQQuestions = (text) => {
  // Remove page markers and split PDF text into lines
  const lines = text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const answerMap = {};

  // Find the Answer Key section
  const answerIndex = lines.findIndex((line) =>
    /^Answer\s*Key\s*$/i.test(line)
  );

  // Extract correct answers
  if (answerIndex !== -1) {
    for (const line of lines.slice(answerIndex + 1)) {
      const match = line.match(
        /^Q\s*(\d+)\s*[.:)]\s*([A-D])\b/i
      );

      if (match) {
        answerMap[match[1]] = match[2].toUpperCase();
      }
    }
  }

  // Keep only the question section
  const questionLines =
    answerIndex === -1
      ? lines
      : lines.slice(0, answerIndex);

  const questions = [];

  let current = null;

  // Save a question after checking its options and answer
  const saveQuestion = () => {
    if (!current) return;

    const correctIndex = ["A", "B", "C", "D"].indexOf(
      answerMap[current.number]
    );

    if (
      current.questionText.trim() &&
      current.options.length === 4 &&
      current.options.every((option) => option.trim()) &&
      correctIndex !== -1
    ) {
      questions.push({
        questionNumber: Number(current.number),
        questionText: current.questionText.trim(),
        options: current.options,
        correctAnswer: current.options[correctIndex],
        marks: 1,
      });
    }
  };

  // Process each line
  for (const line of questionLines) {
    // Detect question number
    const questionMatch = line.match(
      /^Q\s*(\d+)\s*[.:)]\s*(.*)$/i
    );

    if (questionMatch) {
      saveQuestion();

      current = {
        number: questionMatch[1],
        questionText: questionMatch[2],
        options: [],
      };

      continue;
    }

    if (!current) continue;

    // Detect A, B, C, D options
    const optionMatch = line.match(
      /^([A-D])[.)]\s*(.*)$/i
    );

    if (optionMatch) {
      current.options.push(optionMatch[2].trim());
      continue;
    }

    // Handle text continuing on another PDF line
    if (current.options.length > 0) {
      const lastIndex = current.options.length - 1;

      current.options[lastIndex] += " " + line;
    } else {
      current.questionText += " " + line;
    }
  }

  // Save the final question
  saveQuestion();

  return questions;
};


// ==========================================
// 2. UPLOAD PDF AND EXTRACT ITS TEXT
// ==========================================

const extractPdfQuestions = async (req, res) => {
  let parser;

  try {
    // Check whether a PDF was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file.",
      });
    }

    // Create PDF parser
    parser = new PDFParse({
      data: req.file.buffer,
    });

    // Extract text from PDF
    const result = await parser.getText();

    const extractedText = result.text || "";

    // Check whether PDF contains readable text
    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in PDF.",
      });
    }

    // Parse questions and answers
    const questions = parseMCQQuestions(extractedText);

    // Send response
    return res.status(200).json({
      success: true,
      message: "PDF processed successfully.",
      totalQuestions: questions.length,
      questions,
    });

  } catch (error) {
    console.error("PDF Processing Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process PDF.",
      error: error.message,
    });

  } finally {
    // Release PDF parser resources
    if (parser) {
      await parser.destroy();
    }
  }
};


// ==========================================
// 3. EXPORT FUNCTIONS
// ==========================================

module.exports = {
  extractPdfQuestions,
  parseMCQQuestions,
};
