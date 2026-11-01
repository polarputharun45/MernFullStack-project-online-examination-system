import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/users";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "CSE",
    status: "Active",
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("examproToken") || ""}`,
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });

      const users = response.data.users || [];

      setStudents(
        users
          .filter((user) => user.role === "student")
          .map((user) => ({
            ...user,
            id: user._id,
            status: user.status || "Active",
            course: user.course || "Not specified",
          }))
      );
    } catch (err) {
      console.error("Fetch Students Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to fetch students. Check the backend API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase();

    return students.filter((student) =>
      `${student.name} ${student.email} ${student.course}`
        .toLowerCase()
        .includes(term)
    );
  }, [students, search]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      course: "CSE",
      status: "Active",
    });
    setEditingStudent(null);
  };

  const handleAddStudent = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      course: student.course || "CSE",
      status: student.status || "Active",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please enter student name and email.");
      return;
    }

    try {
      setSaving(true);

      if (editingStudent) {
        await axios.put(
          `${API_URL}/${editingStudent.id}`,
          formData,
          { headers: getAuthHeaders() }
        );
        alert("Student updated successfully.");
      } else {
        await axios.post(
          API_URL,
          { ...formData, role: "student" },
          { headers: getAuthHeaders() }
        );
        alert("Student added successfully.");
      }

      setShowModal(false);
      resetForm();
      await fetchStudents();
    } catch (err) {
      console.error("Save Student Error:", err);
      alert(
        err.response?.data?.message ||
          "Unable to save student. Check the backend API."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
      });

      setStudents((previous) =>
        previous.filter((student) => student.id !== id)
      );

      alert("Student deleted successfully.");
    } catch (err) {
      console.error("Delete Student Error:", err);
      alert(
        err.response?.data?.message ||
          "Unable to delete student. Check the backend API."
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="admin-page">
      <nav className="dashboard-navbar">
        <div className="dashboard-container">
          <Link to="/admin/dashboard" className="dashboard-logo">
            ExamPro
          </Link>

          <div className="dashboard-nav-links">
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/students" className="active">
              Students
            </Link>
            <Link to="/admin/exams">Exams</Link>
            <Link to="/admin/questions">Questions</Link>
            <Link to="/admin/results">Results</Link>
          </div>
        </div>
      </nav>

      <main className="admin-container">
        <div className="admin-page-header">
          <div>
            <p className="dashboard-label">ADMINISTRATION</p>
            <h1>Manage Students</h1>
            <p>View and manage registered student accounts.</p>
          </div>

          <button
            className="admin-primary-btn"
            onClick={handleAddStudent}
          >
            + Add Student
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
            <button
              className="btn btn-sm btn-outline-danger ms-3"
              onClick={fetchStudents}
            >
              Retry
            </button>
          </div>
        )}

        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />

          <span className="student-count">
            {filteredStudents.length} Students
          </span>
        </div>

        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>#{index + 1}</td>
                    <td>
                      <strong>{student.name}</strong>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>
                      <span
                        className={
                          student.status === "Active"
                            ? "admin-status-active"
                            : "admin-status-inactive"
                        }
                      >
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-edit-btn"
                        onClick={() => handleEdit(student)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="admin-empty">Loading students...</div>
          )}

          {!loading && filteredStudents.length === 0 && (
            <div className="admin-empty">
              {search
                ? "No matching students found."
                : "No registered students found."}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="admin-modal student-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  {editingStudent ? "Edit Student" : "Add Student"}
                </h2>
                <p>Enter the student account details.</p>
              </div>

              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                >
                  <option value="CSE">CSE</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-btn"
                  onClick={handleCloseModal}
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
                    : editingStudent
                    ? "Save Changes"
                    : "Add Student"}
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

export default AdminStudents;