
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");

// ================= IMPORT ROUTES =================

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");

const pdfQuestionRoutes = require("./routes/pdfQuestionRoutes");
const questionBankRoutes = require("./routes/questionBankRoutes");
const examQuestionRoutes = require("./routes/examQuestionRoutes");

const app = express();

// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());

// Debug: Log every incoming request
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
  res.send("ExamPro Backend Server is Running!");
});

// ================= API ROUTES =================

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);

app.use("/api/pdf-questions", pdfQuestionRoutes);
app.use("/api/question-bank", questionBankRoutes);
app.use("/api/exam-questions", examQuestionRoutes);

// ================= NOT FOUND ROUTE =================

app.use((req, res) => {
  console.log("ROUTE NOT FOUND:", req.method, req.originalUrl);

  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `ExamPro Backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
