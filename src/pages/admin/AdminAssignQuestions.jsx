
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminAssignQuestions.css";

const API_URL = "http://localhost:5000/api";

// Get JWT token for backend authentication
const getAuthConfig = () => {
  const token = localStorage.getItem("examproToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const AdminAssignQuestions = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load exams and approved questions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const config = getAuthConfig();

        if (!config.headers.Authorization || config.headers.Authorization === "Bearer null") {
          setError("Please login again as Admin.");
          return;
        }

        const [examResponse, questionResponse] = await Promise.all([
          axios.get(`${API_URL}/exams`, config),
          axios.get(`${API_URL}/question-bank`, config),
        ]);

        const examData = examResponse.data;
        const questionData = questionResponse.data;

        setExams(
          Array.isArray(examData)
            ? examData
            : examData.exams || []
        );

        const bankQuestions = questionData.questions || [];

        setQuestions(
          bankQuestions.filter((question) => question.isApproved)
        );

      } catch (err) {
        console.error("Loading Error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load exams and questions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Select or unselect a question
  const handleQuestionSelect = (id) => {
    setSelectedQuestions((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  // Select all questions
  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((item) => item._id));
    }
  };

  // Assign selected questions
  const handleAssignQuestions = async () => {
    if (!selectedExam) {
      setError("Please select an exam.");
      return;
    }

    if (selectedQuestions.length === 0) {
      setError("Please select at least one question.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API_URL}/exam-questions/assign`,
        {
          examId: selectedExam,
          questionIds: selectedQuestions,
        },
        getAuthConfig()
      );

      setMessage(response.data.message);
      setSelectedQuestions([]);

    } catch (err) {
      console.error("Assignment Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to assign questions."
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="assign-page">
      <header className="assign-header">
        <div>
          <p>EXAMPRO ADMINISTRATION</p>
          <h1>Assign Questions to Exam</h1>
          <span>
            Select an exam and choose questions from your approved Question Bank.
          </span>
        </div>

        <div className="assign-header-icon">AQ</div>
      </header>

      {message && (
        <div className="assign-alert success">
          {message}
        </div>
      )}

      {error && (
        <div className="assign-alert error">
          {error}
        </div>
      )}

      <section className="assign-card">
        <h2>Select Exam</h2>
        <p>Choose the exam where you want to add questions.</p>

        <select
          value={selectedExam}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            setMessage("");
            setError("");
          }}
        >
          <option value="">-- Select an Exam --</option>

          {exams.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.title}
            </option>
          ))}
        </select>
      </section>

      <section className="assign-card">
        <div className="assign-question-heading">
          <div>
            <h2>Approved Question Bank</h2>
            <p>Select the questions you want to assign.</p>
          </div>

          <span>{questions.length} Approved Questions</span>
        </div>

        {loading ? (
          <p>Loading exams and questions...</p>
        ) : questions.length === 0 ? (
          <p>No approved questions available.</p>
        ) : (
          <>
            <label className="assign-select-all">
              <input
                type="checkbox"
                checked={
                  questions.length > 0 &&
                  selectedQuestions.length === questions.length
                }
                onChange={handleSelectAll}
              />

              Select All Questions
            </label>

            {questions.map((question, index) => (
              <div
                className="assign-question"
                key={question._id}
              >
                <label className="assign-question-content">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question._id)}
                    onChange={() =>
                      handleQuestionSelect(question._id)
                    }
                  />

                  <div>
                    <h3>Question {index + 1}</h3>

                    <p>{question.questionText}</p>

                    <div className="assign-options">
                      {question.options.map((option, optionIndex) => (
                        <span key={optionIndex}>
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </span>
                      ))}
                    </div>

                    <small>
                      Marks: {question.marks}
                    </small>
                  </div>
                </label>
              </div>
            ))}

            <div className="assign-footer">
              <p>
                Selected: <strong>{selectedQuestions.length}</strong> questions
              </p>

              <button
                type="button"
                onClick={handleAssignQuestions}
                disabled={assigning || loading}
              >
                {assigning
                  ? "Assigning..."
                  : "Assign Questions to Exam"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminAssignQuestions;
