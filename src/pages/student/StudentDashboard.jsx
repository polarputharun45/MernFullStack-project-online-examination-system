
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./StudentDashboard.css";
const API_URL = "http://localhost:5000/api";

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [attemptStatuses, setAttemptStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("examproToken");

  const getExamId = (result) => {
    if (result.exam && typeof result.exam === "object") {
      return result.exam._id;
    }

    return result.exam;
  };

  const getExamName = (result) => {
    if (result.exam && typeof result.exam === "object") {
      return result.exam.title || "Examination";
    }

    return result.examTitle || "Examination";
  };

  const getExamSubject = (result) => {
    if (result.exam && typeof result.exam === "object") {
      return result.exam.subject || "General";
    }

    return result.subject || "General";
  };

  const getResultDate = (result) =>
    result.completedAt || result.createdAt || result.date || null;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPercentage = (result) => {
    if (result.percentage !== undefined && result.percentage !== null) {
      return Number(result.percentage) || 0;
    }

    const score = Number(result.score) || 0;
    const total = Number(result.totalQuestions) || 0;

    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  const loadDashboard = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in again to view your dashboard.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [examResponse, resultResponse] = await Promise.all([
        fetch(`${API_URL}/exams`, { headers }),
        fetch(`${API_URL}/results/mine`, { headers }),
      ]);

      const examData = await examResponse.json();
      const resultData = await resultResponse.json();

      if (!examResponse.ok) {
        throw new Error(examData.message || "Unable to load exams.");
      }

      if (!resultResponse.ok) {
        throw new Error(
          resultData.message || "Unable to load your results."
        );
      }

      const examList = Array.isArray(examData)
        ? examData
        : examData.exams || [];

      const resultList = Array.isArray(resultData)
        ? resultData
        : resultData.results || [];

      setExams(examList.filter((exam) => exam.isActive !== false));
      setResults(resultList);

      // Load the attempt count for each active exam.
      const statusEntries = await Promise.all(
        examList
          .filter((exam) => exam.isActive !== false && exam._id)
          .map(async (exam) => {
            try {
              const response = await fetch(
                `${API_URL}/exams/${exam._id}/attempt-status`,
                { headers }
              );

              if (!response.ok) return [exam._id, null];

              const data = await response.json();

              return [exam._id, data];
            } catch {
              return [exam._id, null];
            }
          })
      );

      setAttemptStatuses(Object.fromEntries(statusEntries));
    } catch (err) {
      console.error("Student dashboard error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const handleResultsUpdated = () => {
      loadDashboard();
    };

    window.addEventListener("examproResultsUpdated", handleResultsUpdated);

    return () => {
      window.removeEventListener(
        "examproResultsUpdated",
        handleResultsUpdated
      );
    };
  }, [loadDashboard]);

  // Sort results newest first.
  const sortedResults = [...results].sort((a, b) => {
    const dateA = new Date(getResultDate(a) || 0).getTime();
    const dateB = new Date(getResultDate(b) || 0).getTime();

    return dateB - dateA;
  });

  // Keep only the latest result for each exam in Recent Results.
  const latestResults = [];
  const seenExamIds = new Set();

  sortedResults.forEach((result) => {
    const examId = getExamId(result);

    // Use result ID as a fallback if the exam ID is unavailable.
    const uniqueKey = examId
      ? String(examId)
      : `result-${result._id}`;

    if (!seenExamIds.has(uniqueKey)) {
      seenExamIds.add(uniqueKey);
      latestResults.push(result);
    }
  });

  // These statistics use actual saved submissions.
  const completedAttempts = results.length;

  const passedAttempts = results.filter(
    (result) => result.status === "Passed"
  ).length;

  const averageScore =
    completedAttempts > 0
      ? Math.round(
          results.reduce(
            (sum, result) => sum + getPercentage(result),
            0
          ) / completedAttempts
        )
      : 0;

  return (
    <div className="student-dashboard">
      {/* Navigation */}
      <nav className="dashboard-navbar">
        <div className="dashboard-container">
          <Link to="/student/dashboard" className="dashboard-logo">
            ExamPro
          </Link>

          <div className="dashboard-nav-links">
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/exams">Available Exams</Link>
            <Link to="/student/results">My Results</Link>
            <a href="#profile">Profile</a>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-container">
        {/* Welcome */}
        <section className="welcome-section">
          <div>
            <p className="dashboard-label">STUDENT DASHBOARD</p>

            <h1>Welcome, {user?.name || "Student"}</h1>

            <p>
              Take your examinations, track your performance, and improve
              your skills with ExamPro.
            </p>
          </div>

          <div className="student-avatar">
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </div>
        </section>

        {error && (
          <div className="dashboard-error" role="alert">
            {error}
            <button onClick={loadDashboard}>Retry</button>
          </div>
        )}

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div>
              <h3>{loading ? "..." : exams.length}</h3>
              <p>Available Exams</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div>
              <h3>{loading ? "..." : completedAttempts}</h3>
              <p>Completed Attempts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div>
              <h3>{loading ? "..." : passedAttempts}</h3>
              <p>Passed Attempts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div>
              <h3>{loading ? "..." : `${averageScore}%`}</h3>
              <p>Average Score</p>
            </div>
          </div>
        </section>

        {/* Available Exams */}
        <section
          id="available-exams"
          className="dashboard-section"
        >
          <div className="section-header">
            <div>
              <h2>Available Exams</h2>
              <p>Examinations published by your administrator.</p>
            </div>

            <Link to="/student/exams" className="exam-count">
              View All Exams
            </Link>
          </div>

          {loading ? (
            <div className="no-results">Loading examinations...</div>
          ) : exams.length === 0 ? (
            <div className="no-results">
              No active examinations are available right now.
            </div>
          ) : (
            <div className="exam-grid">
              {exams.slice(0, 6).map((exam) => {
                const attempt = attemptStatuses[exam._id];
                const maxAttempts = Number(
                  attempt?.maxAttempts ?? exam.maxAttempts ?? 1
                );
                const attemptsUsed = Number(attempt?.attemptsUsed ?? 0);

                const canAttempt =
                  attempt?.canAttempt !== false &&
                  attemptsUsed < maxAttempts;

                return (
                  <div className="exam-card" key={exam._id}>
                    <div className="exam-card-top">
                      <span className="subject-badge">
                        {exam.subject || "General"}
                      </span>

                      <span
                        className={
                          canAttempt ? "exam-status" : "failed-badge"
                        }
                      >
                        {canAttempt ? "Available" : "Completed"}
                      </span>
                    </div>

                    <h3>{exam.title || "Untitled Exam"}</h3>

                    {exam.description && <p>{exam.description}</p>}

                    <div className="exam-details">
                      <span>
                        ❓ {exam.totalQuestions || 0} Questions
                      </span>

                      <span>⏱ {exam.duration || 0} min</span>
                    </div>

                    <p className="attempt-count">
                      Attempts: {Math.min(attemptsUsed, maxAttempts)} /{" "}
                      {maxAttempts}
                    </p>

                    {canAttempt ? (
                      <Link
                        to={`/student/instructions/${exam._id}`}
                        className="start-exam-btn"
                      >
                        Start Exam
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="start-exam-btn"
                        disabled
                      >
                        ✓ Completed
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Results - latest result per exam only */}
        <section id="results" className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Recent Results</h2>
              <p>Your latest result for each examination.</p>
            </div>

            <Link to="/student/results" className="view-all-btn">
              View All
            </Link>
          </div>

          <div className="results-card">
            <div className="results-header">
              <span>Exam</span>
              <span>Score</span>
              <span>Status</span>
              <span>Date</span>
            </div>

            {loading ? (
              <div className="no-results">Loading results...</div>
            ) : latestResults.length === 0 ? (
              <div className="no-results">
                <p>No examination results available yet.</p>
              </div>
            ) : (
              latestResults.slice(0, 5).map((result) => (
                <div className="result-row" key={result._id}>
                  <div>
                    <strong>{getExamName(result)}</strong>
                    <small>{getExamSubject(result)}</small>
                  </div>

                  <span>{getPercentage(result)}%</span>

                  <span
                    className={
                      result.status === "Passed"
                        ? "passed-badge"
                        : "failed-badge"
                    }
                  >
                    {result.status || "Unknown"}
                  </span>

                  <span>{formatDate(getResultDate(result))}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Profile */}
        <section id="profile" className="profile-section">
          <h2>My Profile</h2>

          <div className="profile-details">
            <div>
              <span>Name</span>
              <strong>{user?.name || "Student"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user?.email || "—"}</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>Student</strong>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
