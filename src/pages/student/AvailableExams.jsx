import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AvailableExams.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/exams";

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchExams = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("examproToken");

        if (!token) {
          throw new Error("Please log in to view available exams.");
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch exams.");
        }

        setExams(
          (Array.isArray(data.exams) ? data.exams : []).filter(
            (exam) => exam.isActive !== false
          )
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch Exams Error:", err);
          setError(err.message || "Unable to connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchExams();

    return () => controller.abort();
  }, []);

  const subjects = useMemo(
    () => [
      "All Subjects",
      ...new Set(exams.map((exam) => exam.subject).filter(Boolean)),
    ],
    [exams]
  );

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const text = `${exam.title || ""} ${exam.subject || ""} ${
        exam.description || ""
      }`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase().trim());

      const matchesSubject =
        subjectFilter === "All Subjects" ||
        exam.subject === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [exams, search, subjectFilter]);

  const handleLogout = () => {
    localStorage.removeItem("examproToken");
    localStorage.removeItem("examproUser");
    window.location.href = "/login";
  };

  return (
    <div className="available-exams-page">
      <nav className="available-navbar">
        <div className="available-navbar-inner">
          <Link to="/student/dashboard" className="available-logo">
            ExamPro
          </Link>

          <div className="available-nav-links">
            <Link to="/student/dashboard">Dashboard</Link>

            <Link
              to="/student/exams"
              className="available-nav-active"
            >
              Available Exams
            </Link>

            <Link to="/student/results">My Results</Link>

            <button
              type="button"
              className="available-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="available-main">
        <header className="available-page-header">
          <div>
            <p className="available-eyebrow">EXAMINATION PORTAL</p>
            <h1>Available Exams</h1>
            <p className="available-subtitle">
              Choose an examination and test your knowledge.
            </p>
          </div>

          <div className="available-total-card">
            <span className="available-total-number">
              {loading ? "—" : filteredExams.length}
            </span>
            <span className="available-total-label">
              Available Exams
            </span>
          </div>
        </header>

        <section className="available-search-panel">
          <label className="available-search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by exam name, subject..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search exams"
            />
          </label>

          <label className="available-filter-box">
            <span>Filter by subject</span>
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              aria-label="Filter by subject"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading && (
          <div className="available-message">
            <div className="available-spinner" />
            <h2>Loading examinations</h2>
            <p>Please wait while we fetch available exams.</p>
          </div>
        )}

        {!loading && error && (
          <div className="available-message available-error" role="alert">
            <h2>Unable to load exams</h2>
            <p>{error}</p>
            <button
              type="button"
              className="available-primary-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredExams.length > 0 && (
          <section className="available-exam-grid">
            {filteredExams.map((exam) => (
              <article className="available-exam-card" key={exam._id}>
                <div className="available-card-top">
                  <span className="available-subject-badge">
                    {exam.subject || "General"}
                  </span>

                  <span
                    className={
                      exam.isCompleted
                        ? "available-status-badge completed-status"
                        : "available-status-badge"
                    }
                  >
                    <span className="available-status-dot" />
                    {exam.isCompleted ? "Completed" : "Available"}
                  </span>
                </div>

                <h2>{exam.title || "Untitled Examination"}</h2>

                <p className="available-exam-description">
                  {exam.description ||
                    "No description available for this examination."}
                </p>

                <div className="available-exam-divider" />

                <div className="available-exam-info">
                  <div className="available-info-item">
                    <span className="available-info-icon">📝</span>
                    <div>
                      <span className="available-info-label">
                        Questions
                      </span>
                      <strong>{Number(exam.totalQuestions || 0)}</strong>
                    </div>
                  </div>

                  <div className="available-info-item">
                    <span className="available-info-icon">⏱️</span>
                    <div>
                      <span className="available-info-label">
                        Duration
                      </span>
                      <strong>
                        {Number(exam.duration || 0)} Minutes
                      </strong>
                    </div>
                  </div>

                  <div className="available-info-item">
                    <span className="available-info-icon">📊</span>
                    <div>
                      <span className="available-info-label">
                        Difficulty
                      </span>
                      <strong>{exam.difficulty || "Beginner"}</strong>
                    </div>
                  </div>
                </div>

                <div className="available-card-actions">
                  {exam.isCompleted ? (
                    <div className="available-completed-btn">
                      ✓ Completed
                      <span className="available-attempt-count">
                        {exam.attemptsUsed}/{exam.maxAttempts} attempts used
                      </span>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`/student/instructions/${exam._id}`}
                        className="available-instructions-btn"
                      >
                        View Instructions
                      </Link>

                      <Link
                        to={`/student/instructions/${exam._id}`}
                        className="available-start-btn"
                      >
                        {exam.hasAttempted
                          ? "Start Remaining Attempt"
                          : "Start Examination"}{" "}
                        <span aria-hidden="true">→</span>
                      </Link>
                    </>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && !error && filteredExams.length === 0 && (
          <div className="available-message">
            <span className="available-empty-icon">📚</span>
            <h2>
              {exams.length === 0
                ? "No Active Examinations"
                : "No Matching Exams"}
            </h2>
            <p>
              {exams.length === 0
                ? "There are no active exams available right now."
                : "Try a different search term or select another subject."}
            </p>

            {(search || subjectFilter !== "All Subjects") && (
              <button
                type="button"
                className="available-primary-btn"
                onClick={() => {
                  setSearch("");
                  setSubjectFilter("All Subjects");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="available-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default AvailableExams;