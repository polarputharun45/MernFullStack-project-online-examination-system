import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top">
        <div className="container">

          <Link
            className="navbar-brand fw-bold text-primary fs-4"
            to="/"
          >
            ExamPro
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="btn btn-primary px-4"
                  to="/register"
                >
                  Register
                </Link>
              </li>

            </ul>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">

        <div className="container">

          <div className="row align-items-center min-vh-100 pt-5">

            {/* Left Side */}
            <div className="col-lg-6">

              <span className="badge bg-primary-subtle text-primary px-3 py-2 mb-3">
                Online Examination Platform
              </span>

              <h1 className="display-3 fw-bold mb-3">
                Welcome to{" "}
                <span className="text-primary">
                  ExamPro
                </span>
              </h1>

              <h2 className="fw-semibold mb-4">
                Online Examination System
              </h2>

              <p className="lead text-secondary mb-4">
                Take online examinations, track your performance,
                and view your results easily.
              </p>

              <div className="d-flex gap-3">

                <Link
                  to="/login"
                  className="btn btn-primary btn-lg px-4"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  Register
                </Link>

              </div>

            </div>

            {/* Right Side */}
            <div className="col-lg-6 mt-5 mt-lg-0">

              <div className="exam-dashboard-card shadow-lg">

                <div className="dashboard-header">

                  <div>
                    <small className="text-secondary">
                      Student Dashboard
                    </small>

                    <h4 className="fw-bold mb-0">
                      Welcome, Student
                    </h4>
                  </div>

                  <div className="profile-circle">
                    S
                  </div>

                </div>

                <div className="row g-3 mt-3">

                  <div className="col-6">
                    <div className="stat-card">
                      <small>Available Exams</small>
                      <h3>08</h3>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-card">
                      <small>Completed</small>
                      <h3>12</h3>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-card">
                      <small>Average Score</small>
                      <h3>84%</h3>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-card">
                      <small>Passed Exams</small>
                      <h3>10</h3>
                    </div>
                  </div>

                </div>

                <div className="exam-preview mt-4">

                  <div>
                    <small className="text-secondary">
                      Upcoming Examination
                    </small>

                    <h5 className="fw-bold">
                      Full Stack Development
                    </h5>
                  </div>

                  <span className="badge bg-primary">
                    60 min
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;