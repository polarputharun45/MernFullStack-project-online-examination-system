
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalAttempts: 0,
  });

  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("examproToken");

        const response = await axios.get(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setStatistics(response.data.statistics);
          setRecentExams(response.data.recentExams);
        }
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(
          "Unable to load dashboard data. Please check the backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = [
    {
      code: "ST",
      value: statistics.totalStudents,
      label: "Total Students",
    },
    {
      code: "EX",
      value: statistics.totalExams,
      label: "Total Exams",
    },
    {
      code: "Q",
      value: statistics.totalQuestions,
      label: "Total Questions",
    },
    {
      code: "RES",
      value: statistics.totalAttempts,
      label: "Examinations Taken",
    },
  ];

  const adminActions = [
    {
      code: "ST",
      title: "Manage Students",
      description: "View registered students.",
      path: "/admin/students",
    },
    {
      code: "EX",
      title: "Manage Exams",
      description: "Create and manage examinations.",
      path: "/admin/exams",
    },
    {
      code: "Q",
      title: "Manage Questions",
      description: "Add and manage exam questions.",
      path: "/admin/questions",
    },
    {
      code: "QB",
      title: "Question Bank",
      description: "Upload PDFs, extract and approve MCQs.",
      path: "/admin/question-bank",
    },
    {
      code: "AQ",
      title: "Assign Questions",
      description: "Select approved questions for an exam.",
      path: "/admin/assign-questions",
    },
    {
      code: "RES",
      title: "View Results",
      description: "Review student exam results.",
      path: "/admin/results",
    },
  ];

  return (
    <div className="admin-dashboard">
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
            <Link to="/admin/question-bank">Question Bank</Link>
            <Link to="/admin/assign-questions">Assign Questions</Link>
            <Link to="/admin/results">Results</Link>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-container admin-main">
        <section className="admin-welcome-section">
          <div className="admin-welcome-content">
            <p className="dashboard-label">ADMINISTRATOR PANEL</p>

            <h1>
              Welcome, {user?.name || "ExamPro Admin"}
            </h1>

            <p>
              Manage students, examinations, questions
              and results from one place.
            </p>
          </div>

          <div className="admin-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "A"}
          </div>
        </section>

        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}

        <section className="stats-grid admin-stats-grid">
          {statCards.map((stat) => (
            <div className="stat-card" key={stat.code}>
              <div className="stat-icon">{stat.code}</div>

              <div>
                <h3>
                  {loading ? "..." : stat.value.toLocaleString()}
                </h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="dashboard-section admin-quick-section">
          <div className="section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Access the main administration functions.</p>
            </div>
          </div>

          <div className="admin-action-grid">
            {adminActions.map((action) => (
              <Link
                to={action.path}
                className="admin-action-card"
                key={action.path}
              >
                <div className="admin-action-icon">
                  {action.code}
                </div>

                <div className="admin-action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <span className="admin-action-arrow">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Recent Examinations</h2>
              <p>Latest examinations stored in the database.</p>
            </div>

            <Link to="/admin/exams" className="view-all-btn">
              View All
            </Link>
          </div>

          <div className="admin-table-card">
            <div className="admin-table-header">
              <span>Examination</span>
              <span>Subject</span>
              <span>Students</span>
              <span>Questions</span>
              <span>Status</span>
            </div>

            {loading ? (
              <p className="p-4 mb-0">
                Loading examinations...
              </p>
            ) : recentExams.length === 0 ? (
              <p className="p-4 mb-0">
                No examinations found. Create your first exam.
              </p>
            ) : (
              recentExams.map((exam) => (
                <div
                  className="admin-table-row"
                  key={exam._id}
                >
                  <strong>{exam.name}</strong>
                  <span>{exam.subject}</span>
                  <span>{exam.students}</span>
                  <span>{exam.questions}</span>

                  <span>
                    <span
                      className={
                        exam.status === "Active"
                          ? "active-status"
                          : "draft-status"
                      }
                    >
                      {exam.status}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-info-section">
          <div>
            <span className="admin-info-label">
              SYSTEM STATUS
            </span>

            <h2>
              {error
                ? "Dashboard data unavailable"
                : loading
                  ? "Loading dashboard"
                  : "ExamPro dashboard is connected"}
            </h2>

            <p>
              {error
                ? "Check the backend server and database connection."
                : "Statistics are retrieved from the database."}
            </p>
          </div>

          <div className="system-status">
            <span className="status-dot"></span>
            {error ? "Check Connection" : loading ? "Loading" : "Connected"}
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© 2026 ExamPro. Admin Panel.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
