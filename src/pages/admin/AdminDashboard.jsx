import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const statistics = [
    {
      icon: "👨‍🎓",
      value: "250",
      label: "Total Students",
    },
    {
      icon: "📝",
      value: "18",
      label: "Total Exams",
    },
    {
      icon: "❓",
      value: "420",
      label: "Total Questions",
    },
    {
      icon: "📊",
      value: "1,240",
      label: "Examinations Taken",
    },
  ];

  const recentExams = [
    {
      name: "Full Stack Development",
      subject: "MERN Stack",
      students: 85,
      questions: 30,
      status: "Active",
    },
    {
      name: "Java Programming",
      subject: "Java",
      students: 72,
      questions: 25,
      status: "Active",
    },
    {
      name: "Database Management",
      subject: "DBMS & SQL",
      students: 64,
      questions: 20,
      status: "Active",
    },
    {
      name: "Data Structures",
      subject: "DSA",
      students: 58,
      questions: 30,
      status: "Draft",
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">
        <div className="dashboard-container">

          <Link
            to="/admin/dashboard"
            className="dashboard-logo"
          >
            ExamPro
          </Link>

          <div className="dashboard-nav-links">

            <Link to="/admin/dashboard">
              Dashboard
            </Link>

            <Link to="/admin/students">
              Students
            </Link>

            <Link to="/admin/exams">
              Exams
            </Link>

            <Link to="/admin/questions">
              Questions
            </Link>

            <Link to="/admin/results">
              Results
            </Link>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* ================= MAIN ================= */}

      <main className="dashboard-container">

        {/* ================= WELCOME ================= */}

        <section className="admin-welcome-section">

          <div>

            <p className="dashboard-label">
              ADMINISTRATOR PANEL
            </p>

            <h1>
              Welcome, {user?.name || "ExamPro Admin"} 👋
            </h1>

            <p>
              Manage students, examinations, questions and results
              from one place.
            </p>

          </div>

          <div className="admin-avatar">
            A
          </div>

        </section>

        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {statistics.map((stat, index) => (

            <div
              className="stat-card"
              key={index}
            >

              <div className="stat-icon">
                {stat.icon}
              </div>

              <div>

                <h3>
                  {stat.value}
                </h3>

                <p>
                  {stat.label}
                </p>

              </div>

            </div>

          ))}

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Quickly access the main administration functions.
              </p>

            </div>

          </div>

          <div className="admin-action-grid">

            <Link
              to="/admin/students"
              className="admin-action-card"
            >

              <div className="admin-action-icon">
                👨‍🎓
              </div>

              <div>

                <h3>
                  Manage Students
                </h3>

                <p>
                  View and manage registered students.
                </p>

              </div>

            </Link>

            <Link
              to="/admin/exams"
              className="admin-action-card"
            >

              <div className="admin-action-icon">
                📝
              </div>

              <div>

                <h3>
                  Manage Exams
                </h3>

                <p>
                  Create, edit and manage examinations.
                </p>

              </div>

            </Link>

            <Link
              to="/admin/questions"
              className="admin-action-card"
            >

              <div className="admin-action-icon">
                ❓
              </div>

              <div>

                <h3>
                  Manage Questions
                </h3>

                <p>
                  Add and manage examination questions.
                </p>

              </div>

            </Link>

            <Link
              to="/admin/results"
              className="admin-action-card"
            >

              <div className="admin-action-icon">
                📊
              </div>

              <div>

                <h3>
                  View Results
                </h3>

                <p>
                  Monitor student examination results.
                </p>

              </div>

            </Link>

          </div>

        </section>

        {/* ================= RECENT EXAMS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Recent Examinations
              </h2>

              <p>
                Overview of examinations created in ExamPro.
              </p>

            </div>

            <Link
              to="/admin/exams"
              className="view-all-btn"
            >
              View All
            </Link>

          </div>

          <div className="admin-table-card">

            <div className="admin-table-header">

              <span>
                Examination
              </span>

              <span>
                Subject
              </span>

              <span>
                Students
              </span>

              <span>
                Questions
              </span>

              <span>
                Status
              </span>

            </div>

            {recentExams.map((exam, index) => (

              <div
                className="admin-table-row"
                key={index}
              >

                <strong>
                  {exam.name}
                </strong>

                <span>
                  {exam.subject}
                </span>

                <span>
                  {exam.students}
                </span>

                <span>
                  {exam.questions}
                </span>

                <span
                  className={
                    exam.status === "Active"
                      ? "active-status"
                      : "draft-status"
                  }
                >
                  {exam.status}
                </span>

              </div>

            ))}

          </div>

        </section>

        {/* ================= SYSTEM INFORMATION ================= */}

        <section className="admin-info-section">

          <div>

            <span className="admin-info-label">
              SYSTEM STATUS
            </span>

            <h2>
              ExamPro is running normally
            </h2>

            <p>
              All examination services are currently available.
            </p>

          </div>

          <div className="system-status">
            ● Online
          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="dashboard-footer">

        <p>
          © 2026 ExamPro. Admin Panel.
        </p>

      </footer>

    </div>
  );
};

export default AdminDashboard;