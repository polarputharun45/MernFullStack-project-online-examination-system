
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    branch: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      branch,
    } = formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !role ||
      !branch
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          branch,
        }
      );

      if (response.data?.success) {
        setSuccess(
          "Registration successful! Redirecting to login..."
        );

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student",
          branch: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(
          response.data?.message || "Registration failed."
        );
      }
    } catch (err) {
      console.error("Registration Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page register-page">
      <div className="register-container">
        <section className="card border-0 shadow-lg register-card">
          <header className="register-header">
            <div className="register-logo">E</div>
            <h1>Create Account</h1>
            <p>Join ExamPro today</p>
          </header>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="register-field">
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter your full name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Create a password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-role">Register As</label>
              <select
                id="register-role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="admin">Teacher</option>
              </select>
            </div>

            <div className="register-field">
              <label htmlFor="register-branch">
                Select Branch
              </label>
              <select
                id="register-branch"
                name="branch"
                className="form-select"
                value={formData.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select your branch</option>
                <option value="CSE">
                  CSE - Computer Science Engineering
                </option>
                <option value="ECE">
                  ECE - Electronics and Communication Engineering
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="register-login">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>

          <div className="register-home">
            <Link to="/">← Back to Home</Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Register;
