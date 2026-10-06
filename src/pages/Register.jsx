import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
    } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = register(
      name,
      email,
      password
    );

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">

          <div className="col-md-7 col-lg-5">

            <div className="card border-0 shadow-lg p-4">

              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">
                  Create Account
                </h2>

                <p className="text-secondary">
                  Join ExamPro today
                </p>
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

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

                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                >
                  Register
                </button>

              </form>

              <p className="text-center mt-4 mb-0">
                Already have an account?{" "}
                <Link to="/login">
                  Login
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

export default Register;