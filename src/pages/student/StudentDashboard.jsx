import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const exams = [
    {
      id: 1,
      name: "Full Stack Development",
      subject: "MERN Stack",
      questions: 30,
      duration: "60 min",
    },
    {
      id: 2,
      name: "Java Programming",
      subject: "Java",
      questions: 25,
      duration: "45 min",
    },
    {
      id: 3,
      name: "Database Management",
      subject: "DBMS & SQL",
      questions: 20,
      duration: "30 min",
    },
  ];

  const results = [
    {
      exam: "Python Programming",
      score: "88%",
      status: "Passed",
      date: "02 Oct 2026",
    },
    {
      exam: "Data Structures",
      score: "76%",
      status: "Passed",
      date: "28 Sep 2026",
    },
    {
      exam: "Computer Networks",
      score: "58%",
      status: "Passed",
      date: "20 Sep 2026",
    },
  ];

  return (
    <div className="student-dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">
        <div className="dashboard-container">

          <Link
            to="/student/dashboard"
            className="dashboard-logo"
          >
            ExamPro
          </Link>

          <div className="dashboard-nav-links">

            <Link to="/student/dashboard">
              Dashboard
            </Link>

            <Link to="/student/exams">
              Available Exams
            </Link>

            <a href="#results">
              My Results
            </a>

            <a href="#profile">
              Profile
            </a>

            <button
              className="logout-btn"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-container">

        {/* ================= WELCOME SECTION ================= */}

        <section className="welcome-section">

          <div>

            <p className="dashboard-label">
              STUDENT DASHBOARD
            </p>

            <h1>
              Welcome, {user?.name || "Student"} 👋
            </h1>

            <p>
              Take your examinations, track your performance,
              and improve your skills with ExamPro.
            </p>

          </div>

          <div className="student-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "S"}
          </div>

        </section>

        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {/* Available Exams */}

          <div className="stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div>
              <h3>08</h3>
              <p>Available Exams</p>
            </div>

          </div>

          {/* Completed Exams */}

          <div className="stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div>
              <h3>12</h3>
              <p>Completed Exams</p>
            </div>

          </div>

          {/* Passed Exams */}

          <div className="stat-card">

            <div className="stat-icon">
              🏆
            </div>

            <div>
              <h3>10</h3>
              <p>Passed Exams</p>
            </div>

          </div>

          {/* Average Score */}

          <div className="stat-card">

            <div className="stat-icon">
              📊
            </div>

            <div>
              <h3>84%</h3>
              <p>Average Score</p>
            </div>

          </div>

        </section>

        {/* ================= AVAILABLE EXAMS ================= */}

        <section
          id="available-exams"
          className="dashboard-section"
        >

          <div className="section-header">

            <div>

              <h2>
                Available Exams
              </h2>

              <p>
                Choose an examination and start testing your knowledge.
              </p>

            </div>

            <Link
              to="/student/exams"
              className="exam-count"
            >
              View All Exams
            </Link>

          </div>

          <div className="exam-grid">

            {exams.map((exam) => (

              <div
                className="exam-card"
                key={exam.id}
              >

                <div className="exam-card-top">

                  <span className="subject-badge">
                    {exam.subject}
                  </span>

                  <span className="exam-status">
                    Available
                  </span>

                </div>

                <h3>
                  {exam.name}
                </h3>

                <div className="exam-details">

                  <span>
                    ❓ {exam.questions} Questions
                  </span>

                  <span>
                    ⏱ {exam.duration}
                  </span>

                </div>

                <Link
                  to={`/student/exam/${exam.id}`}
                  className="start-exam-btn"
                >
                  Start Exam
                </Link>

              </div>

            ))}

          </div>

        </section>

        {/* ================= RECENT RESULTS ================= */}

        <section
          id="results"
          className="dashboard-section"
        >

          <div className="section-header">

            <div>

              <h2>
                Recent Results
              </h2>

              <p>
                Check your latest examination performance.
              </p>

            </div>

            <Link
              to="/student/results"
              className="view-all-btn"
            >
              View All
            </Link>

          </div>

          <div className="results-card">

            {/* Results Header */}

            <div className="results-header">

              <span>
                Exam
              </span>

              <span>
                Score
              </span>

              <span>
                Status
              </span>

              <span>
                Date
              </span>

            </div>

            {/* Results */}

            {results.map((result, index) => (

              <div
                className="result-row"
                key={index}
              >

                <strong>
                  {result.exam}
                </strong>

                <span>
                  {result.score}
                </span>

                <span className="passed-badge">
                  {result.status}
                </span>

                <span>
                  {result.date}
                </span>

              </div>

            ))}

          </div>

        </section>

        {/* ================= UPCOMING EXAM ================= */}

        <section className="upcoming-section">

          <div>

            <span className="upcoming-label">
              UPCOMING EXAMINATION
            </span>

            <h2>
              Full Stack Development
            </h2>

            <p>
              Test your knowledge of HTML, CSS, JavaScript,
              React, Node.js and MongoDB.
            </p>

          </div>

          <div className="upcoming-info">

            <span>
              60 Minutes
            </span>

            <span>
              30 Questions
            </span>

            <Link
              to="/student/exams"
              className="upcoming-btn"
            >
              View Exam
            </Link>

          </div>

        </section>

        {/* ================= PROFILE ================= */}

        <section
          id="profile"
          className="profile-section"
        >

          <h2>
            My Profile
          </h2>

          <div className="profile-details">

            <div>

              <span>
                Name
              </span>

              <strong>
                {user?.name || "Student"}
              </strong>

            </div>

            <div>

              <span>
                Email
              </span>

              <strong>
                {user?.email || "student@exampro.com"}
              </strong>

            </div>

            <div>

              <span>
                Role
              </span>

              <strong>
                Student
              </strong>

            </div>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="dashboard-footer">

        <p>
          © 2026 ExamPro. Online Examination System.
        </p>

      </footer>

    </div>
  );
};

export default StudentDashboard;