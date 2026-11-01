
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

// Backend URL from Vercel environment variables
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const Login = () => {
  const navigate = useNavigate();
  const { setBackendUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // FORGOT PASSWORD STATES
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // LOGIN FUNCTION
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      if (!response.data?.success) {
        setError("Login failed. Please check your credentials.");
        return;
      }

      const { token, user } = response.data;

      if (!token || !user) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      localStorage.setItem("examproToken", token);
      setBackendUser(user);

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD FUNCTION
  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setForgotMessage("");
    setForgotError("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        {
          email: forgotEmail.trim(),
        }
      );

      if (response.data?.success) {
        setForgotMessage(response.data.message);
      } else {
        setForgotError(
          response.data?.message || "Unable to process your request."
        );
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);

      setForgotError(
        err.response?.data?.message ||
          "Unable to send reset link. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="login-card login-card-large">
        <header className="login-header">
          <div className="login-logo-mark">E</div>

          <h1>ExamPro</h1>
          <h2>Welcome Back!</h2>

          <p>Login to your account to continue</p>
        </header>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>

            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>

            <div className="login-password-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD BUTTON */}
          <div style={{ textAlign: "right", marginBottom: "18px" }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword((previous) => !previous);
                setForgotEmail(formData.email);
                setForgotMessage("");
                setForgotError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "600",
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login to ExamPro"}
          </button>
        </form>

        {/* FORGOT PASSWORD FORM */}
        {showForgotPassword && (
          <div
            style={{
              marginTop: "22px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            <h4>Forgot Your Password?</h4>

            <p>
              Enter your registered email address. We'll send you a
              password reset link.
            </p>

            {forgotMessage && (
              <div className="alert alert-success">
                {forgotMessage}
              </div>
            )}

            {forgotError && (
              <div className="alert alert-danger">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="login-field">
                <label htmlFor="forgot-email">Email Address</label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(event) => {
                    setForgotEmail(event.target.value);
                    setForgotError("");
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotMessage("");
                setForgotError("");
              }}
              style={{
                marginTop: "12px",
                background: "none",
                border: "none",
                color: "#555",
                cursor: "pointer",
              }}
            >
              Back to Login
            </button>
          </div>
        )}

        <p className="login-register">
          Don't have an account?{" "}
          <Link to="/register">Create account</Link>
        </p>

        <div className="login-home">
          <Link to="/">← Back to Home</Link>
        </div>
      </section>
    </main>
  );
};

export default Login;
