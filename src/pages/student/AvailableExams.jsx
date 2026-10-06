import { Link } from "react-router-dom";

const AvailableExams = () => {
  const exams = [
    {
      id: 1,
      name: "Full Stack Development",
      subject: "MERN Stack",
      description:
        "Test your knowledge of HTML, CSS, JavaScript, React, Node.js and MongoDB.",
      questions: 30,
      duration: "60 Minutes",
      difficulty: "Intermediate",
    },
    {
      id: 2,
      name: "Java Programming",
      subject: "Java",
      description:
        "Evaluate your knowledge of Java programming, OOP concepts, collections and exception handling.",
      questions: 25,
      duration: "45 Minutes",
      difficulty: "Intermediate",
    },
    {
      id: 3,
      name: "Database Management",
      subject: "DBMS & SQL",
      description:
        "Test your understanding of databases, SQL queries, normalization and database concepts.",
      questions: 20,
      duration: "30 Minutes",
      difficulty: "Beginner",
    },
    {
      id: 4,
      name: "Data Structures",
      subject: "DSA",
      description:
        "Practice arrays, linked lists, stacks, queues, trees, graphs and algorithms.",
      questions: 30,
      duration: "60 Minutes",
      difficulty: "Advanced",
    },
    {
      id: 5,
      name: "Computer Networks",
      subject: "Networking",
      description:
        "Evaluate your understanding of networking protocols, TCP/IP, OSI model and network security.",
      questions: 25,
      duration: "45 Minutes",
      difficulty: "Intermediate",
    },
    {
      id: 6,
      name: "Python Programming",
      subject: "Python",
      description:
        "Test your Python programming skills including functions, OOP, modules and data structures.",
      questions: 25,
      duration: "45 Minutes",
      difficulty: "Intermediate",
    },
  ];

  return (
    <div className="available-exams-page">

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

            <Link
              to="/student/exams"
              className="active-nav-link"
            >
              Available Exams
            </Link>

            <a href="/student/dashboard#results">
              My Results
            </a>

            <a href="/student/dashboard#profile">
              Profile
            </a>

            <button
              className="logout-btn"
              onClick={() => {
                window.localStorage.removeItem("examproUser");
                window.location.href = "/login";
              }}
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-container">

        {/* PAGE HEADER */}

        <section className="exams-page-header">

          <div>

            <p className="dashboard-label">
              EXAMINATION PORTAL
            </p>

            <h1>
              Available Exams
            </h1>

            <p>
              Choose an examination and test your knowledge.
            </p>

          </div>

          <div className="total-exams-box">

            <strong>
              {exams.length}
            </strong>

            <span>
              Available Exams
            </span>

          </div>

        </section>

        {/* SEARCH */}

        <section className="exam-search-section">

          <div className="exam-search-box">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search exams..."
            />

          </div>

          <select className="exam-filter">

            <option>
              All Subjects
            </option>

            <option>
              MERN Stack
            </option>

            <option>
              Java
            </option>

            <option>
              DBMS & SQL
            </option>

            <option>
              DSA
            </option>

            <option>
              Networking
            </option>

            <option>
              Python
            </option>

          </select>

        </section>

        {/* EXAM CARDS */}

        <section className="available-exam-grid">

          {exams.map((exam) => (

            <div
              className="available-exam-card"
              key={exam.id}
            >

              {/* CARD HEADER */}

              <div className="available-exam-card-header">

                <span className="exam-subject">
                  {exam.subject}
                </span>

                <span className="available-badge">
                  Available
                </span>

              </div>

              {/* EXAM NAME */}

              <h2>
                {exam.name}
              </h2>

              {/* DESCRIPTION */}

              <p className="exam-description">
                {exam.description}
              </p>

              {/* EXAM INFORMATION */}

              <div className="exam-info-grid">

                <div>

                  <span className="exam-info-label">
                    Questions
                  </span>

                  <strong>
                    {exam.questions}
                  </strong>

                </div>

                <div>

                  <span className="exam-info-label">
                    Duration
                  </span>

                  <strong>
                    {exam.duration}
                  </strong>

                </div>

                <div>

                  <span className="exam-info-label">
                    Difficulty
                  </span>

                  <strong>
                    {exam.difficulty}
                  </strong>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="exam-card-buttons">

                <Link
                  to={`/student/instructions/${exam.id}`}
                  className="instructions-btn"
                >
                  Instructions
                </Link>

                <Link
                  to={`/student/instructions/${exam.id}`}
                  className="start-exam-btn"
                >
                  Start Exam
                </Link>

              </div>

            </div>

          ))}

        </section>

      </main>

      {/* FOOTER */}

      <footer className="dashboard-footer">

        <p>
          © 2026 ExamPro. Online Examination System.
        </p>

      </footer>

    </div>
  );
};

export default AvailableExams;