import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./AdminQuestions.css";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api";

const emptyForm = {
  exam: "",
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  answer: "A",
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // Get the JWT token saved during login
  const getConfig = () => {
    const token = localStorage.getItem("examproToken");

    return token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};
  };

  // Fetch questions and exams from the backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const config = getConfig();

      const [questionResponse, examResponse] =
        await Promise.all([
          axios.get(`${API}/questions`, config),
          axios.get(`${API}/exams`, config),
        ]);

      setQuestions(
        questionResponse.data.questions || []
      );

      setExams(
        examResponse.data.exams || []
      );
    } catch (err) {
      console.error("Question Fetch Error:", err);

      if (err.response?.status === 401) {
        setError(
          "Authentication failed. Please log in again. If this continues, check backend JWT verification."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Your account may not have admin permission."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load questions and exams. Check the backend."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getExamId = (exam) => {
    if (!exam) return "";

    return typeof exam === "object"
      ? exam._id
      : exam;
  };

  const getExamName = (exam) => {
    if (!exam) return "Unknown Exam";

    if (typeof exam === "object") {
      return exam.title || "Unknown Exam";
    }

    return (
      exams.find((item) => item._id === exam)?.title ||
      "Unknown Exam"
    );
  };

  const filteredQuestions = questions.filter(
    (question) => {
      const text = `${question.question} ${getExamName(
        question.exam
      )}`;

      return text
        .toLowerCase()
        .includes(search.toLowerCase());
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Open the add-question form
  const openAddModal = () => {
    setEditingQuestion(null);

    setFormData({
      ...emptyForm,
      exam: exams[0]?._id || "",
    });

    setShowModal(true);
  };

  // Open the edit-question form
  const openEditModal = (question) => {
    const options = question.options || [];

    const answerIndex = options.findIndex(
      (option) => option === question.correctAnswer
    );

    setEditingQuestion(question);

    setFormData({
      exam: getExamId(question.exam),
      question: question.question || "",
      optionA: options[0] || "",
      optionB: options[1] || "",
      optionC: options[2] || "",
      optionD: options[3] || "",
      answer:
        ["A", "B", "C", "D"][answerIndex] || "A",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData(emptyForm);
  };

  // Create or update a question
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.exam) {
      alert(
        "Please create an exam first and select it."
      );
      return;
    }

    const options = [
      formData.optionA.trim(),
      formData.optionB.trim(),
      formData.optionC.trim(),
      formData.optionD.trim(),
    ];

    if (
      !formData.question.trim() ||
      options.some((option) => !option)
    ) {
      alert(
        "Please fill in the question and all four options."
      );
      return;
    }

    const answerIndex = [
      "A",
      "B",
      "C",
      "D",
    ].indexOf(formData.answer);

    const payload = {
      exam: formData.exam,
      question: formData.question.trim(),
      options,
      correctAnswer: options[answerIndex],
      marks: editingQuestion?.marks || 1,
    };

    try {
      setSaving(true);
      setError("");

      const config = getConfig();

      if (editingQuestion) {
        await axios.put(
          `${API}/questions/${editingQuestion._id}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${API}/questions`,
          payload,
          config
        );
      }

      closeModal();
      await fetchData();

      alert(
        editingQuestion
          ? "Question updated successfully."
          : "Question added successfully."
      );
    } catch (err) {
      console.error("Save Question Error:", err);

      if (err.response?.status === 401) {
        setError(
          "Authentication failed. Please log in again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to save question."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete a question
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await axios.delete(
        `${API}/questions/${id}`,
        getConfig()
      );

      await fetchData();
    } catch (err) {
      console.error("Delete Question Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete question."
      );
    }
  };

  return (
    <div className="admin-page">
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

            <Link
              to="/admin/questions"
              className="active"
            >
              Questions
            </Link>

            <Link to="/admin/results">
              Results
            </Link>
          </div>
        </div>
      </nav>

      <main className="admin-container">
        <div className="admin-page-header">
          <div>
            <p className="dashboard-label">
              QUESTION MANAGEMENT
            </p>

            <h1>Manage Questions</h1>

            <p>
              Create, edit and manage examination
              questions.
            </p>
          </div>

          <button
            className="admin-primary-btn"
            onClick={openAddModal}
            disabled={loading || exams.length === 0}
          >
            + Add Question
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}

            <button
              type="button"
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={fetchData}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && exams.length === 0 && !error && (
          <div className="alert alert-warning">
            No exams found. Create an exam in Manage
            Exams first.
          </div>
        )}

        <div className="admin-toolbar">
          <input
            type="text"
            className="admin-search"
            placeholder="Search questions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <span className="student-count">
            {filteredQuestions.length} Questions
          </span>
        </div>

        <div className="question-admin-list">
          {loading ? (
            <div className="admin-empty">
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="admin-empty">
              {search
                ? "No matching questions found."
                : "No questions saved yet. Add your first question."}
            </div>
          ) : (
            filteredQuestions.map(
              (question, index) => {
                const options =
                  question.options || [];

                const answerIndex =
                  options.findIndex(
                    (option) =>
                      option === question.correctAnswer
                  );

                const answerLetter =
                  ["A", "B", "C", "D"][
                    answerIndex
                  ] || "-";

                return (
                  <div
                    className="admin-question-card"
                    key={question._id}
                  >
                    <div className="admin-question-header">
                      <div>
                        <span className="subject-badge">
                          {getExamName(question.exam)}
                        </span>

                        <h3>
                          Q{index + 1}.{" "}
                          {question.question}
                        </h3>
                      </div>

                      <span className="correct-answer">
                        Answer: {answerLetter}
                      </span>
                    </div>

                    <div className="admin-question-options">
                      {options.map(
                        (option, optionIndex) => (
                          <div
                            key={`${question._id}-${optionIndex}`}
                          >
                            <strong>
                              {
                                ["A", "B", "C", "D"][
                                  optionIndex
                                ]
                              }
                              .
                            </strong>{" "}
                            {option}
                          </div>
                        )
                      )}
                    </div>

                    <div className="admin-question-actions">
                      <button
                        className="admin-edit-btn"
                        onClick={() =>
                          openEditModal(question)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="admin-delete-btn"
                        onClick={() =>
                          handleDelete(question._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </main>

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  {editingQuestion
                    ? "Edit Question"
                    : "Add Question"}
                </h2>

                <p>
                  Enter the examination question details.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>Examination</label>

                <select
                  name="exam"
                  value={formData.exam}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select an exam
                  </option>

                  {exams.map((exam) => (
                    <option
                      key={exam._id}
                      value={exam._id}
                    >
                      {exam.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Question</label>

                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Enter question"
                  rows={3}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Option A</label>

                  <input
                    name="optionA"
                    value={formData.optionA}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Option B</label>

                  <input
                    name="optionB"
                    value={formData.optionB}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Option C</label>

                  <input
                    name="optionC"
                    value={formData.optionC}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Option D</label>

                  <input
                    name="optionD"
                    value={formData.optionD}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Correct Answer</label>

                <select
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  required
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingQuestion
                      ? "Save Changes"
                      : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>
          © 2026 ExamPro. Online Examination System.
        </p>
      </footer>
    </div>
  );
};

export default AdminQuestions;