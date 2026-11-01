import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/exams";

const emptyForm = {
  name: "",
  subject: "",
  questions: "",
  duration: "",
  status: "Active",
  maxAttempts: "1",
};

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("examproToken")}`,
  });

  // FETCH EXAMS
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: getHeaders(),
      });

      const formattedExams = (response.data.exams || []).map((exam) => ({
        id: exam._id,
        name: exam.title,
        subject: exam.subject,
        questions: exam.totalQuestions,
        duration: `${exam.duration} Minutes`,
        status: exam.isActive ? "Active" : "Inactive",
        maxAttempts: exam.maxAttempts || 1,
      }));

      setExams(formattedExams);
    } catch (err) {
      console.error("Fetch Exams Error:", err);
      setError(
        err.response?.data?.message || "Unable to fetch exams."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ADD EXAM
  const handleAddExam = () => {
    setEditingExam(null);
    setFormData({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  // EDIT EXAM
  const handleEdit = (exam) => {
    setEditingExam(exam);

    setFormData({
      name: exam.name,
      subject: exam.subject,
      questions: String(exam.questions),
      duration: String(parseInt(exam.duration, 10)),
      status: exam.status,
      maxAttempts: String(exam.maxAttempts || 1),
    });

    setError("");
    setShowModal(true);
  };

  // SAVE OR UPDATE EXAM
  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.subject.trim() ||
      !formData.questions ||
      !formData.duration
    ) {
      setError("Please fill in all exam details.");
      return;
    }

    const duration = Number(formData.duration);
    const questions = Number(formData.questions);
    const maxAttempts = Number(formData.maxAttempts);

    if (
      !Number.isInteger(duration) ||
      duration <= 0 ||
      !Number.isInteger(questions) ||
      questions <= 0
    ) {
      setError(
        "Duration and question count must be positive whole numbers."
      );
      return;
    }

    if (![1, 2, 3].includes(maxAttempts)) {
      setError("Maximum attempts must be 1, 2, or 3.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: formData.name.trim(),
        subject: formData.subject.trim(),
        description: "",
        duration,
        totalQuestions: questions,
        difficulty: "Beginner",
        isActive: formData.status === "Active",
        maxAttempts,
      };

      let response;

      if (editingExam) {
        response = await axios.put(
          `${API_URL}/${editingExam.id}`,
          payload,
          { headers: getHeaders() }
        );
      } else {
        response = await axios.post(
          API_URL,
          payload,
          { headers: getHeaders() }
        );
      }

      if (response.data.success) {
        window.alert(
          editingExam
            ? "Exam updated successfully."
            : "Exam added successfully."
        );

        setShowModal(false);
        setEditingExam(null);
        setFormData({ ...emptyForm });

        await fetchExams();
      }
    } catch (err) {
      console.error("Save Exam Error:", err);
      setError(
        err.response?.data?.message || "Unable to save exam."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE EXAM
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) {
      return;
    }

    try {
      setError("");

      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getHeaders(),
      });

      if (response.data.success) {
        window.alert("Exam deleted successfully.");
        await fetchExams();
      }
    } catch (err) {
      console.error("Delete Exam Error:", err);
      setError(
        err.response?.data?.message || "Unable to delete exam."
      );
    }
  };

  // TOGGLE STATUS
  const toggleStatus = async (exam) => {
    try {
      setError("");

      const response = await axios.put(
        `${API_URL}/${exam.id}`,
        { isActive: exam.status !== "Active" },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        await fetchExams();
      }
    } catch (err) {
      console.error("Update Status Error:", err);
      setError(
        err.response?.data?.message || "Unable to update exam status."
      );
    }
  };

  // CLOSE MODAL
  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingExam(null);
    setError("");
  };

  // SEARCH
  const filteredExams = exams.filter((exam) =>
    `${exam.name} ${exam.subject}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-container">
          <Link to="/admin/dashboard" className="dashboard-logo">
            ExamPro
          </Link>

          <div className="dashboard-nav-links">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/exams" className="active">Exams</Link>
            <Link to="/admin/questions">Questions</Link>
            <Link to="/admin/results">Results</Link>
          </div>
        </div>
      </nav>

      <main className="admin-container">
        <div className="admin-page-header">
          <div>
            <p className="dashboard-label">EXAM MANAGEMENT</p>
            <h1>Manage Exams</h1>
            <p>Create, manage and monitor all examinations.</p>
          </div>

          <button
            type="button"
            className="admin-primary-btn"
            onClick={handleAddExam}
          >
            + Add Exam
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search exams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />

          <span className="student-count">
            {filteredExams.length} Exams
          </span>
        </div>

        <div className="admin-table-card">
          {loading ? (
            <div className="admin-empty">Loading exams...</div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Exam Name</th>
                    <th>Subject</th>
                    <th>Questions</th>
                    <th>Duration</th>
                    <th>Attempts</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExams.map((exam) => (
                    <tr key={exam.id}>
                      <td>#{exam.id.slice(-5)}</td>
                      <td><strong>{exam.name}</strong></td>
                      <td>
                        <span className="subject-badge">
                          {exam.subject}
                        </span>
                      </td>
                      <td>{exam.questions}</td>
                      <td>{exam.duration}</td>
                      <td>{exam.maxAttempts}</td>
                      <td>
                        <button
                          type="button"
                          className={
                            exam.status === "Active"
                              ? "admin-status-active"
                              : "admin-status-inactive"
                          }
                          onClick={() => toggleStatus(exam)}
                        >
                          {exam.status}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-edit-btn"
                          onClick={() => handleEdit(exam)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDelete(exam.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredExams.length === 0 && (
                <div className="admin-empty">No exams found.</div>
              )}
            </>
          )}
        </div>
      </main>

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>{editingExam ? "Edit Exam" : "Add Exam"}</h2>
                <p>
                  {editingExam
                    ? "Update examination details."
                    : "Create a new examination."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label htmlFor="exam-name">Exam Name</label>
                <input
                  id="exam-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter exam name"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="exam-subject">Subject</label>
                <input
                  id="exam-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="exam-questions">Number of Questions</label>
                  <input
                    id="exam-questions"
                    type="number"
                    name="questions"
                    value={formData.questions}
                    onChange={handleChange}
                    min="1"
                    placeholder="Example: 30"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="exam-duration">Duration (minutes)</label>
                  <input
                    id="exam-duration"
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    placeholder="Example: 60"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="max-attempts">Maximum Attempts</label>
                <select
                  id="max-attempts"
                  name="maxAttempts"
                  value={formData.maxAttempts}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1 Attempt — No retakes</option>
                  <option value="2">2 Attempts — 1 retake</option>
                  <option value="3">3 Attempts — 2 retakes</option>
                </select>
                <small>
                  Students cannot submit after using all allowed attempts.
                </small>
              </div>

              <div className="admin-form-group">
                <label htmlFor="exam-status">Status</label>
                <select
                  id="exam-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={handleCloseModal}
                  disabled={saving}
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
                    : editingExam
                      ? "Save Changes"
                      : "Add Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>© 2026 ExamPro. Online Examination System.</p>
      </footer>
    </div>
  );
};

export default AdminExams;