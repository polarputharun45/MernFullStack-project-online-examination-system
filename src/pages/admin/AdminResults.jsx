import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/results";

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAttempts: 0,
    passed: 0,
    failed: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Fetch actual results from MongoDB through backend API
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("examproToken");

      if (!token) {
        setError("Please log in to view examination results.");
        return;
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch results.");
      }

      setResults(Array.isArray(data.results) ? data.results : []);

      setStatistics(
        data.statistics || {
          totalAttempts: 0,
          passed: 0,
          failed: 0,
        }
      );
    } catch (err) {
      console.error("Fetch Results Error:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Delete result from MongoDB
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this result?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      setError("");

      const token = localStorage.getItem("examproToken");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete result.");
      }

      // Refresh actual database data and statistics
      await fetchResults();
    } catch (err) {
      console.error("Delete Result Error:", err);
      setError(err.message || "Unable to delete result.");
    } finally {
      setDeletingId(null);
    }
  };

  // Search actual database records
  const filteredResults = results.filter((result) => {
    const studentName = result.student?.name || "";
    const studentEmail = result.student?.email || "";
    const examTitle = result.exam?.title || "";
    const examSubject = result.exam?.subject || "";

    const searchText =
      `${studentName} ${studentEmail} ${examTitle} ${examSubject}`.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  // Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-page">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="dashboard-container">
          <Link to="/admin/dashboard" className="dashboard-logo">
            ExamPro
          </Link>

          <div className="dashboard-nav-links">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/exams">Exams</Link>
            <Link to="/admin/questions">Questions</Link>
            <Link to="/admin/results" className="active">
              Results
            </Link>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="admin-container">
        <div className="admin-page-header">
          <div>
            <p className="dashboard-label">RESULT MANAGEMENT</p>
            <h1>Examination Results</h1>
            <p>View and manage student examination results.</p>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="admin-empty" role="alert">
            {error}
            <button
              type="button"
              onClick={fetchResults}
              style={{ marginLeft: "12px" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="result-summary-grid">
          <div className="result-summary-card">
            <span>📝</span>
            <div>
              <h3>{statistics.totalAttempts}</h3>
              <p>Total Attempts</p>
            </div>
          </div>

          <div className="result-summary-card">
            <span>🏆</span>
            <div>
              <h3>{statistics.passed}</h3>
              <p>Passed</p>
            </div>
          </div>

          <div className="result-summary-card">
            <span>❌</span>
            <div>
              <h3>{statistics.failed}</h3>
              <p>Failed</p>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search student or exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />

          <span className="student-count">
            {loading ? "Loading..." : `${filteredResults.length} Results`}
          </span>
        </div>

        {/* RESULTS TABLE */}
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                filteredResults.map((result, index) => {
                  const percentage =
                    typeof result.percentage === "number"
                      ? result.percentage
                      : result.totalQuestions > 0
                        ? Math.round(
                            (result.score / result.totalQuestions) * 100
                          )
                        : 0;

                  return (
                    <tr key={result._id}>
                      <td>#{index + 1}</td>

                      <td>
                        <strong>
                          {result.student?.name || "Unknown Student"}
                        </strong>
                        <br />
                        <small>{result.student?.email || "—"}</small>
                      </td>

                      <td>
                        {result.exam?.title || "Unknown Exam"}
                        {result.exam?.subject && (
                          <>
                            <br />
                            <small>{result.exam.subject}</small>
                          </>
                        )}
                      </td>

                      <td>
                        {result.score} / {result.totalQuestions}
                      </td>

                      <td>
                        <strong>{Math.round(percentage)}%</strong>
                      </td>

                      <td>
                        <span
                          className={
                            result.status === "Passed"
                              ? "admin-status-active"
                              : "admin-status-inactive"
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

                      <td>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          disabled={deletingId === result._id}
                          onClick={() => handleDelete(result._id)}
                        >
                          {deletingId === result._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {!loading && filteredResults.length === 0 && (
            <div className="admin-empty">
              {error
                ? "Results could not be loaded."
                : search
                  ? "No matching results found."
                  : "No examination results available in the database yet."}
            </div>
          )}

          {loading && (
            <div className="admin-empty">
              Loading examination results...
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default AdminResults;