import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ExamResult.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api";

const ExamResult = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigationState = location.state || {};

  const [result, setResult] = useState(
    navigationState.result || null
  );

  const [examTitle, setExamTitle] = useState(
    navigationState.examTitle ||
      navigationState.result?.exam?.title ||
      ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      navigationState.result ||
      (navigationState.total !== undefined &&
        navigationState.score !== undefined)
    ) {
      const currentResult = navigationState.result || {
        score: navigationState.score,
        totalQuestions: navigationState.total,
        percentage:
          navigationState.total > 0
            ? Math.round(
                (navigationState.score / navigationState.total) * 100
              )
            : 0,
        status:
          navigationState.total > 0 &&
          (navigationState.score / navigationState.total) * 100 >= 40
            ? "Passed"
            : "Failed",
      };

      setResult(currentResult);
      setExamTitle(
        navigationState.examTitle ||
          navigationState.result?.exam?.title ||
          ""
      );
      return;
    }

    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("examproToken");

        if (!token) {
          throw new Error("Please log in to view this result.");
        }

        const response = await fetch(
          `${API_URL}/results/${examId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not load this saved result. Please open My Results."
          );
        }

        const savedResult = data.result || data;

        setResult(savedResult);

        setExamTitle(
          savedResult.exam?.title ||
            savedResult.examTitle ||
            ""
        );
      } catch (err) {
        console.error("Fetch individual result error:", err);
        setError(err.message || "Unable to load the result.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [examId]);

  const score = Number(result?.score ?? 0);

  const total = Number(
    result?.totalQuestions ?? result?.total ?? 0
  );

  const percentage = Number(
    result?.percentage ??
      (total > 0 ? Math.round((score / total) * 100) : 0)
  );

  const status =
    result?.status || (percentage >= 40 ? "Passed" : "Failed");

  const passed = status === "Passed";

  const actualExamTitle =
    examTitle ||
    result?.exam?.title ||
    result?.examTitle ||
    "Examination Result";

  return (
    <div className="exam-result-page">
      <nav className="exam-result-navbar">
        <div className="exam-result-nav-inner">
          <Link
            to="/student/dashboard"
            className="exam-result-logo"
          >
            ExamPro
          </Link>

          <div className="exam-result-nav-links">
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/exams">Available Exams</Link>
            <Link to="/student/results">My Results</Link>
          </div>
        </div>
      </nav>

      <main className="exam-result-main">
        {loading ? (
          <section className="exam-result-message">
            <h2>Loading result...</h2>
            <p>Please wait while we retrieve your saved result.</p>
          </section>
        ) : error ? (
          <section className="exam-result-message">
            <h2>Result Unavailable</h2>
            <p>{error}</p>
            <Link
              to="/student/results"
              className="exam-result-primary-btn"
            >
              Open My Results
            </Link>
          </section>
        ) : !result || total <= 0 ? (
          <section className="exam-result-message">
            <h2>Result details are unavailable</h2>
            <p>
              We could not find a valid score for this examination.
              Please open My Results and select a saved result.
            </p>
            <Link
              to="/student/results"
              className="exam-result-primary-btn"
            >
              Open My Results
            </Link>
          </section>
        ) : (
          <>
            <header className="exam-result-heading">
              <div className="exam-result-emoji">
                {passed ? "🎉" : "😔"}
              </div>

              <p className="exam-result-eyebrow">
                EXAMINATION SUMMARY
              </p>

              <h1>
                {passed
                  ? "Congratulations!"
                  : "Better Luck Next Time!"}
              </h1>

              <p className="exam-result-subtitle">
                You have completed the examination. Here is your
                performance summary.
              </p>
            </header>

            <section className="exam-result-card">
              <div className="exam-result-card-heading">
                <span className="exam-result-small-label">
                  EXAMINATION RESULT
                </span>
                <h2>{actualExamTitle}</h2>
              </div>

              <div className="exam-result-score-area">
                <div
                  className={`exam-result-score-circle ${
                    passed ? "score-passed" : "score-failed"
                  }`}
                >
                  <strong>{percentage}%</strong>
                  <span>YOUR SCORE</span>
                </div>

                <p
                  className={`exam-result-status ${
                    passed ? "status-passed" : "status-failed"
                  }`}
                >
                  {status}
                </p>
              </div>

              <div className="exam-result-stats">
                <div className="exam-result-stat">
                  <span className="exam-result-stat-icon">📝</span>
                  <p>Questions / Total Marks</p>
                  <strong>{total}</strong>
                </div>

                <div className="exam-result-stat">
                  <span className="exam-result-stat-icon">🎯</span>
                  <p>Marks Scored</p>
                  <strong>{score}</strong>
                </div>

                <div className="exam-result-stat">
                  <span className="exam-result-stat-icon">📊</span>
                  <p>Incorrect / Remaining</p>
                  <strong>{Math.max(0, total - score)}</strong>
                </div>

                <div className="exam-result-stat">
                  <span className="exam-result-stat-icon">🏆</span>
                  <p>Final Status</p>
                  <strong className={passed ? "stat-passed" : "stat-failed"}>
                    {status}
                  </strong>
                </div>
              </div>

              <div className="exam-result-note">
                <strong>Performance Summary</strong>
                <p>
                  You scored {score} out of {total} marks, achieving{" "}
                  {percentage}%.
                </p>
              </div>
            </section>

            <div className="exam-result-actions">
              <Link
                to="/student/dashboard"
                className="exam-result-secondary-btn"
              >
                ← Dashboard
              </Link>

              <Link
                to="/student/results"
                className="exam-result-primary-btn"
              >
                View My Results →
              </Link>
            </div>
          </>
        )}
      </main>

      <footer className="exam-result-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default ExamResult;