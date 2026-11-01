import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">

      {/* ================= NAVBAR ================= */}

      <nav className="home-navbar navbar navbar-expand-lg">
        <div className="container">

          <Link
            className="home-logo navbar-brand"
            to="/"
          >
            ExamPro
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#homeNavbar"
            aria-controls="homeNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse"
            id="homeNavbar"
          >

            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

              <li className="nav-item">
                <Link
                  className="home-nav-link nav-link"
                  to="/"
                >
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="home-nav-link nav-link"
                  to="/login"
                >
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  className="home-register-btn"
                  to="/register"
                >
                  Register
                </Link>
              </li>

            </ul>

          </div>

        </div>
      </nav>


      {/* ================= HERO ================= */}

      <section className="home-hero">

        <div className="container">

          <div className="home-hero-content">

            <span className="home-platform-badge">
              Online Examination Platform
            </span>

            <h1>
              Welcome to
              <span>ExamPro</span>
            </h1>

            <h2>
              Online Examination System
            </h2>

            <p>
              Take online examinations, track your
              performance, and view your results easily.
            </p>

            <div className="home-hero-buttons">

              <Link
                to="/login"
                className="home-login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="home-register-outline-btn"
              >
                Register
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;