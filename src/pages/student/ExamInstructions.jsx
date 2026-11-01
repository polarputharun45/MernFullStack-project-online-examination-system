
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/exams";

const ExamInstructions = () => {
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("examproToken");

        if (!token) {
          setError("Please log in to view exam instructions.");
          return;
        }

        const response = await fetch(`${API_URL}/${examId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch exam details.");
        }

        if (!data.exam) {
          throw new Error("Exam not found.");
        }

        setExam(data.exam);
      } catch (err) {
        console.error("Fetch Exam Error:", err);
        setError(err.message || "Unable to load exam details.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  if (loading) {
    return (
      <div className="exam-instructions-page">
        <div className="instructions-container">
          <h2>Loading exam details...</h2>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="exam-instructions-page">
        <div className="instructions-container text-center">
          <h2>{error || "Exam Not Found"}</h2>
          <Link to="/student/exams" className="back-exam-btn">
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-instructions-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-container">
          <Link to="/student/dashboard" className="dashboard-logo">
            ExamPro
          </Link>

          <div className="dashboard-nav-links">
            <Link to="/student/dashboard">Dashboard</Link>
            <Link to="/student/exams">Available Exams</Link>
            <Link to="/student/results">My Results</Link>
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("examproToken");
                localStorage.removeItem("examproUser");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="instructions-container">
        <div className="instructions-header">
          <span className="subject-badge">{exam.subject}</span>

          <h1>{exam.title}</h1>

          <p>
            Please read the instructions carefully before starting
            the examination.
          </p>

          {exam.description && <p>{exam.description}</p>}
        </div>

        <div className="exam-info-grid">
          <div className="exam-info-card">
            <span>📝</span>
            <strong>{exam.totalQuestions}</strong>
            <p>Questions</p>
          </div>

          <div className="exam-info-card">
            <span>⏱</span>
            <strong>{exam.duration} Minutes</strong>
            <p>Duration</p>
          </div>

          <div className="exam-info-card">
            <span>📊</span>
            <strong>{exam.difficulty}</strong>
            <p>Difficulty</p>
          </div>
        </div>

        <div className="instructions-card">
          <h2>Exam Instructions</h2>

          <ul>
            <li>Read each question carefully before selecting an answer.</li>
            <li>Each question has only one correct answer.</li>
            <li>Complete the examination within the given time.</li>
            <li>The exam should be submitted before the timer expires.</li>
            <li>Avoid refreshing or closing the browser during the exam.</li>
            <li>Maintain a stable internet connection.</li>
            <li>Review your answers before submitting.</li>
          </ul>
        </div>

        <div className="instructions-actions">
          <Link to="/student/exams" className="back-exam-btn">
            ← Back to Exams
          </Link>

          <Link
            to={`/student/exam/${exam._id}`}
            className="start-exam-btn"
          >
            Start Examination →
          </Link>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default ExamInstructions;
