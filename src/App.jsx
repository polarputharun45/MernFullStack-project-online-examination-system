
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

// STUDENT PAGES
import StudentDashboard from "./pages/student/StudentDashboard";
import AvailableExams from "./pages/student/AvailableExams";
import ExamInstructions from "./pages/student/ExamInstructions";
import Exam from "./pages/student/Exam";
import ExamResult from "./pages/student/ExamResult";
import Results from "./pages/student/Results";

// ADMIN PAGES
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminExams from "./pages/admin/AdminExams";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminResults from "./pages/admin/AdminResults";
import AdminQuestionBank from "./pages/admin/AdminQuestionBank";
import AdminAssignQuestions from "./pages/admin/AdminAssignQuestions";

// PROTECTED ROUTE
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* RESET PASSWORD */}
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* STUDENT DASHBOARD */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* AVAILABLE EXAMS */}
      <Route
        path="/student/exams"
        element={
          <ProtectedRoute allowedRole="student">
            <AvailableExams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/available-exams"
        element={
          <ProtectedRoute allowedRole="student">
            <AvailableExams />
          </ProtectedRoute>
        }
      />

      {/* EXAM INSTRUCTIONS */}
      <Route
        path="/student/instructions/:examId"
        element={
          <ProtectedRoute allowedRole="student">
            <ExamInstructions />
          </ProtectedRoute>
        }
      />

      {/* EXAM PAGE */}
      <Route
        path="/student/exam/:examId"
        element={
          <ProtectedRoute allowedRole="student">
            <Exam />
          </ProtectedRoute>
        }
      />

      {/* EXAM RESULT */}
      <Route
        path="/student/result/:examId"
        element={
          <ProtectedRoute allowedRole="student">
            <ExamResult />
          </ProtectedRoute>
        }
      />

      {/* MY RESULTS */}
      <Route
        path="/student/results"
        element={
          <ProtectedRoute allowedRole="student">
            <Results />
          </ProtectedRoute>
        }
      />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ADMIN STUDENTS */}
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminStudents />
          </ProtectedRoute>
        }
      />

      {/* ADMIN EXAMS */}
      <Route
        path="/admin/exams"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminExams />
          </ProtectedRoute>
        }
      />

      {/* ADMIN QUESTIONS */}
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminQuestions />
          </ProtectedRoute>
        }
      />

      {/* ADMIN QUESTION BANK */}
      <Route
        path="/admin/question-bank"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminQuestionBank />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ASSIGN QUESTIONS */}
      <Route
        path="/admin/assign-questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminAssignQuestions />
          </ProtectedRoute>
        }
      />

      {/* ADMIN RESULTS */}
      <Route
        path="/admin/results"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminResults />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
