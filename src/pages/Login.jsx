import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please enter email and password.");
      return;
    }

    const result = login(
      formData.email,
      formData.password
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (result.user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">

          <div className="col-md-7 col-lg-5">

            <div className="card border-0 shadow-lg p-4">

              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">
                  ExamPro
                </h2>

                <p className="text-secondary">
                  Login to your account
                </p>
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Password
                  </label>

                  <div className="input-group">

                    <input
                      type={
                        showPassword ? "text" : "password"
                      }
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                >
                  Login
                </button>

              </form>

              <div className="demo-login mt-4">

                <h6 className="fw-bold">
                  Demo Accounts
                </h6>

                <div className="small text-secondary">
                  <strong>Admin:</strong>
                  <br />
                  admin@exampro.com / admin123
                </div>

                <div className="small text-secondary mt-2">
                  <strong>Student:</strong>
                  <br />
                  student@exampro.com / student123
                </div>

              </div>

              <p className="text-center mt-4 mb-0">
                Don't have an account?{" "}
                <Link to="/register">
                  Register
                </Link>
              </p>

              <div className="text-center mt-3">
                <Link to="/" className="text-secondary">
                  ← Back to Home
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;