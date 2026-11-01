import { useState } from "react";
import axios from "axios";
import "./AdminQuestionBank.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api";

const AdminQuestionBank = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Upload PDF and extract questions
  const handleExtract = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setQuestions([]);
      setSavedQuestions([]);

      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const response = await axios.post(
        `${API_URL}/pdf-questions/extract`,
        formData
      );

      setQuestions(response.data.questions || []);

      setMessage(
        `${response.data.totalQuestions} questions extracted successfully.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to extract questions from PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit question text
  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].questionText = value;
    setQuestions(updated);
  };

  // Edit options
  const handleOptionChange = (qIndex, optionIndex, value) => {
    const updated = [...questions];
    const oldAnswer = updated[qIndex].correctAnswer;

    updated[qIndex].options[optionIndex] = value;

    if (oldAnswer === questions[qIndex].options[optionIndex]) {
      updated[qIndex].correctAnswer = value;
    }

    setQuestions(updated);
  };

  // Change correct answer
  const handleAnswerChange = (index, value) => {
    const updated = [...questions];
    updated[index].correctAnswer = value;
    setQuestions(updated);
  };

  // Remove unwanted extracted question
  const handleRemoveQuestion = (index) => {
    setQuestions((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Save extracted questions to MongoDB
  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      setError("No questions available to save.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API_URL}/question-bank`,
        {
          questions,
          sourceFileName: pdfFile?.name || "",
        }
      );

      setSavedQuestions(response.data.questions || []);
      setQuestions([]);

      setMessage(
        `${response.data.totalSaved} questions saved successfully as pending approval.`
      );

      setPdfFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save questions."
      );
    } finally {
      setSaving(false);
    }
  };

  // Approve a saved question
  const handleApprove = async (id) => {
    try {
      setError("");

      const response = await axios.patch(
        `${API_URL}/question-bank/${id}/approve`
      );

      setSavedQuestions((previous) =>
        previous.map((question) =>
          question._id === id ? response.data.question : question
        )
      );

      setMessage("Question approved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to approve question."
      );
    }
  };

  return (
    <div className="question-bank-page">

      <header className="qb-header">
        <div>
          <p className="qb-label">EXAMPRO ADMINISTRATION</p>
          <h1>Question Bank</h1>
          <p>
            Upload PDF files, review extracted MCQs and
            manage reusable examination questions.
          </p>
        </div>

        <div className="qb-header-icon">QB</div>
      </header>

      {message && (
        <div className="qb-alert qb-success">
          {message}
        </div>
      )}

      {error && (
        <div className="qb-alert qb-error">
          {error}
        </div>
      )}

      {/* PDF Upload Section */}

      <section className="qb-card">
        <div className="qb-section-heading">
          <h2>Upload Question PDF</h2>
          <p>
            Select a PDF containing MCQ questions and
            their answer key.
          </p>
        </div>

        <form onSubmit={handleExtract}>
          <div className="qb-upload-area">
            <div className="qb-upload-icon">PDF</div>

            <h3>Select your question PDF</h3>

            <p>
              Only PDF files are supported. Maximum size: 5 MB.
            </p>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                setPdfFile(e.target.files[0] || null);
                setError("");
                setMessage("");
              }}
            />

            {pdfFile && (
              <p className="qb-file-name">
                Selected: {pdfFile.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="qb-primary-btn"
            disabled={loading || !pdfFile}
          >
            {loading ? "Extracting..." : "Extract Questions"}
          </button>
        </form>
      </section>

      {/* Extracted Questions Preview */}

      {questions.length > 0 && (
        <section className="qb-card">
          <div className="qb-section-heading">
            <h2>Extracted Questions</h2>
            <p>
              Review and edit the questions before saving.
            </p>
          </div>

          <div className="qb-count">
            {questions.length} Questions Found
          </div>

          {questions.map((question, index) => (
            <div className="qb-question-card" key={index}>
              <div className="qb-question-top">
                <h3>Question {question.questionNumber || index + 1}</h3>

                <button
                  type="button"
                  className="qb-delete-btn"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  Remove
                </button>
              </div>

              <label>Question</label>

              <textarea
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionChange(index, e.target.value)
                }
              />

              <label>Options</label>

              <div className="qb-options-grid">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex}>
                    <label>Option {String.fromCharCode(65 + optionIndex)}</label>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          optionIndex,
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              <label>Correct Answer</label>

              <select
                value={question.correctAnswer}
                onChange={(e) =>
                  handleAnswerChange(index, e.target.value)
                }
              >
                {question.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>
                    {String.fromCharCode(65 + optionIndex)} - {option}
                  </option>
                ))}
              </select>

              <label>Marks</label>

              <input
                type="number"
                min="1"
                value={question.marks || 1}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[index].marks = Number(e.target.value);
                  setQuestions(updated);
                }}
              />
            </div>
          ))}

          <button
            type="button"
            className="qb-primary-btn"
            onClick={handleSaveQuestions}
            disabled={saving}
          >
            {saving
              ? "Saving Questions..."
              : "Save Questions to Question Bank"}
          </button>
        </section>
      )}

      {/* Saved Questions */}

      {savedQuestions.length > 0 && (
        <section className="qb-card">
          <div className="qb-section-heading">
            <h2>Saved Questions</h2>
            <p>
              Approve questions after reviewing them.
            </p>
          </div>

          {savedQuestions.map((question, index) => (
            <div className="qb-saved-question" key={question._id}>
              <div>
                <h3>Question {index + 1}</h3>
                <p>{question.questionText}</p>

                <span
                  className={
                    question.isApproved
                      ? "qb-approved"
                      : "qb-pending"
                  }
                >
                  {question.isApproved ? "Approved" : "Pending Approval"}
                </span>
              </div>

              {!question.isApproved && (
                <button
                  type="button"
                  className="qb-approve-btn"
                  onClick={() => handleApprove(question._id)}
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </section>
      )}

    </div>
  );
};

export default AdminQuestionBank;