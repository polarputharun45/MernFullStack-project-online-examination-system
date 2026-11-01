import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/results/mine";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch actual results from the backend
  useEffect(() => {
    const controller = new AbortController();

    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("examproToken");

        if (!token) {
          throw new Error("Please log in to view your results.");
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load examination results."
          );
        }

        if (!Array.isArray(data.results)) {
          throw new Error("The server returned an invalid results format.");
        }

        setResults(data.results);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Load Results Error:", err);
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadResults();

    return () => controller.abort();
  }, []);

  // Summary statistics from real results only
  const completedExams = results.length;

  const passedExams = results.filter(
    (result) => result.status === "Passed"
  ).length;

  const averageScore =
    completedExams > 0
      ? Math.round(
          results.reduce(
            (sum, result) => sum + Number(result.percentage || 0),
            0
          ) / completedExams
        )
      : 0;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Handle populated exam objects and unpopulated IDs
  const getExamTitle = (result) => {
    if (result.exam && typeof result.exam === "object") {
      return result.exam.title || result.exam.name || "Exam";
    }

    return result.examTitle || "Exam";
  };

  const getSubject = (result) => {
    if (result.exam && typeof result.exam === "object") {
      return result.exam.subject || "General";
    }

    return result.subject || "General";
  };

  return (
    <div className="results-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-container">
          <Link to="/student/dashboard" className="dashboard-logo">
            ExamPro
          </Link>

          <div className="dashboard-nav-links">
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/exams">Available Exams</Link>
            <Link to="/student/results" className="active">
              My Results
            </Link>
            <Link to="/student/dashboard#profile">Profile</Link>
          </div>
        </div>
      </nav>

      <main className="results-container">
        <header className="results-page-header">
          <div>
            <p className="dashboard-label">STUDENT RESULTS</p>
            <h1>My Results</h1>
            <p>
              View your examination performance and track your progress.
            </p>
          </div>
        </header>

        <section className="result-summary-grid">
          <div className="result-summary-card">
            <span>📝</span>
            <div>
              <h3>{loading ? "—" : completedExams}</h3>
              <p>Exams Completed</p>
            </div>
          </div>

          <div className="result-summary-card">
            <span>🏆</span>
            <div>
              <h3>{loading ? "—" : passedExams}</h3>
              <p>Exams Passed</p>
            </div>
          </div>

          <div className="result-summary-card">
            <span>📊</span>
            <div>
              <h3>{loading ? "—" : `${averageScore}%`}</h3>
              <p>Average Score</p>
            </div>
          </div>
        </section>

        <section className="results-table-section">
          <div className="results-section-header">
            <div>
              <h2>Examination History</h2>
              <p>Your saved examination submissions.</p>
            </div>
          </div>

          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="results-message">
                      Loading results...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="results-message error-message"
                    >
                      {error}
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="results-message">
                      No examination results found for your account.
                    </td>
                  </tr>
                ) : (
                  results.map((result, index) => (
                    <tr key={result._id || index}>
                      <td>
                        <strong>{getExamTitle(result)}</strong>
                      </td>

                      <td>
                        <span className="subject-badge">
                          {getSubject(result)}
                        </span>
                      </td>

                      <td>
                        {Number(result.score || 0)} /{" "}
                        {Number(result.totalQuestions || 0)}
                      </td>

                      <td>
                        <strong>
                          {Number(result.percentage || 0)}%
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            result.status === "Passed"
                              ? "passed-badge"
                              : "failed-badge"
                          }
                        >
                          {result.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          result.completedAt || result.createdAt
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="results-page-actions">
          <Link to="/student/exams" className="start-exam-btn">
            Take Another Exam →
          </Link>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default Results;