import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import AvailableExams from "./pages/student/AvailableExams";

import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ================= STUDENT DASHBOARD ================= */}

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================= AVAILABLE EXAMS ================= */}

      <Route
        path="/student/exams"
        element={
          <ProtectedRoute allowedRole="student">
            <AvailableExams />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default App;