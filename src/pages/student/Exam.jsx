
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/exams";

function getQuestionText(question) {
  const candidates = [
    question?.questionText,
    question?.question,
    question?.text,
    question?.title,
    question?.statement,
    question?.description,
    question?.content,
    question?.data?.questionText,
    question?.data?.question,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function getDurationInSeconds(exam) {
  const duration = Number(
    exam?.duration ??
    exam?.durationMinutes ??
    exam?.timeLimit ??
    exam?.examDuration
  );

  if (!Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  return Math.floor(duration * 60);
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remaining = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export default function Exam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("examproToken");

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const answersRef = useRef({});
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadExam() {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          navigate("/login");
          return;
        }

        const requestOptions = {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        };

        // Check attempt status
        const statusResponse = await fetch(
          `${API_URL}/${examId}/attempt-status`,
          requestOptions
        );

        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusData.message || "Unable to check exam status."
          );
        }

        if (
          statusData.canAttempt === false ||
          (Number.isFinite(statusData.maxAttempts) &&
            statusData.attemptsUsed >= statusData.maxAttempts)
        ) {
          if (!cancelled) {
            setAlreadyAttempted(true);
          }
          return;
        }

        // Load exam details
        const examResponse = await fetch(
          `${API_URL}/${examId}`,
          requestOptions
        );

        const examData = await examResponse.json();

        if (!examResponse.ok) {
          throw new Error(
            examData.message || "Unable to load exam."
          );
        }

        const loadedExam = examData.exam || examData;

        // Load exam questions
        const questionResponse = await fetch(
          `${API_URL}/${examId}/questions`,
          requestOptions
        );

        const questionData = await questionResponse.json();

        if (!questionResponse.ok) {
          throw new Error(
            questionData.message || "Unable to load questions."
          );
        }

        const loadedQuestions =
          questionData.questions ||
          questionData.data ||
          [];

        if (!Array.isArray(loadedQuestions)) {
          throw new Error(
            "The server returned an invalid questions list."
          );
        }

        console.log("Loaded exam questions:", loadedQuestions);
        console.log("Loaded exam details:", loadedExam);

        loadedQuestions.forEach((question, index) => {
          console.log(`QUESTION OBJECT ${index + 1}:`, question);

          if (!getQuestionText(question)) {
            console.warn(
              `Question ${index + 1} has no recognized question-text field.`,
              question
            );
          }
        });

        if (!cancelled) {
          setExam(loadedExam);
          setQuestions(loadedQuestions);

          const durationSeconds = getDurationInSeconds(loadedExam);

          if (durationSeconds !== null) {
            setRemainingSeconds(durationSeconds);
          } else {
            setError(
              "Exam duration is missing or invalid. Please check the duration configured by the admin."
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load exam.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExam();

    return () => {
      cancelled = true;
    };
  }, [examId, navigate, token]);

  const handleAnswerChange = (questionId, answer) => {
    const updatedAnswers = {
      ...answersRef.current,
      [questionId]: answer,
    };

    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submittingRef.current || alreadyAttempted) return;

    if (
      !autoSubmit &&
      !window.confirm("Are you sure you want to submit this exam?")
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${examId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: answersRef.current,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        setAlreadyAttempted(true);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit exam."
        );
      }

      if (!data.result) {
        throw new Error("The server did not return a result.");
      }

      navigate(`/student/result/${examId}`, {
        state: {
          result: data.result,
          examTitle: exam?.title || "Exam",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to submit exam.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (
      remainingSeconds === null ||
      remainingSeconds <= 0 ||
      submitting ||
      alreadyAttempted
    ) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous === null || previous <= 0) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, submitting, alreadyAttempted]);

  // Automatically submit when time reaches zero
  useEffect(() => {
    if (
      remainingSeconds === 0 &&
      !submitting &&
      !alreadyAttempted &&
      exam
    ) {
      handleSubmit(true);
    }
  }, [remainingSeconds, submitting, alreadyAttempted, exam]);

  if (loading) {
    return (
      <div className="exam-status-screen">
        <div className="exam-status-card">
          <div className="exam-loader" />
          <p>Loading your examination...</p>
        </div>
      </div>
    );
  }

  if (alreadyAttempted) {
    return (
      <div className="exam-status-screen">
        <div className="exam-status-card">
          <div className="exam-status-icon">✓</div>
          <h2>Exam Already Completed</h2>
          <p>
            You have already attempted this examination.
            Retakes are not allowed.
          </p>

          <button
            type="button"
            className="exam-primary-button"
            onClick={() => navigate("/student/results")}
          >
            View My Results
          </button>

          <button
            type="button"
            className="exam-secondary-button"
            onClick={() => navigate("/student/available-exams")}
          >
            Back to Available Exams
          </button>
        </div>
      </div>
    );
  }

  if (error && !exam) {
    return (
      <div className="exam-status-screen">
        <div className="exam-status-card">
          <h2>Unable to Load Exam</h2>
          <p className="exam-error-message" role="alert">
            {error}
          </p>

          <button
            type="button"
            className="exam-primary-button"
            onClick={() => navigate("/student/available-exams")}
          >
            Back to Available Exams
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="exam-status-screen">
        <div className="exam-status-card">
          <h2>Exam Not Found</h2>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  const timerColor =
    remainingSeconds !== null && remainingSeconds <= 300
      ? "#dc2626"
      : "#16a34a";

  return (
    <main
      className="professional-exam-page"
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        padding: "24px 16px",
      }}
    >
      <div
        className="professional-exam-container"
        style={{ maxWidth: "1000px", margin: "0 auto" }}
      >
        <header
          className="professional-exam-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            padding: "24px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        >
          <div>
            <span
              className="exam-eyebrow"
              style={{ color: "#2563eb", fontWeight: 700 }}
            >
              ONLINE EXAMINATION
            </span>

            <h1
              style={{
                color: "#0f172a",
                fontSize: "28px",
                margin: "10px 0",
              }}
            >
              {exam.title}
            </h1>

            <p style={{ color: "#475569", margin: 0 }}>
              {exam.subject ||
                exam.description ||
                "Read each question carefully and select your answer."}
            </p>
          </div>

          <div
            className="exam-header-stats"
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div className="exam-stat">
              <span style={{ display: "block", color: "#64748b" }}>
                QUESTIONS
              </span>
              <strong style={{ color: "#0f172a", fontSize: "22px" }}>
                {questions.length}
              </strong>
            </div>

            <div className="exam-stat">
              <span style={{ display: "block", color: "#64748b" }}>
                ANSWERED
              </span>
              <strong style={{ color: "#0f172a", fontSize: "22px" }}>
                {answeredCount}/{questions.length}
              </strong>
            </div>

            <div
              className="exam-stat"
              style={{
                padding: "10px 14px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "9px",
                minWidth: "105px",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "5px",
                }}
              >
                TIME LEFT
              </span>

              <strong
                style={{
                  color: timerColor,
                  fontSize: "22px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {remainingSeconds !== null
                  ? formatTime(remainingSeconds)
                  : "--:--"}
              </strong>
            </div>
          </div>
        </header>

        {error && (
          <div
            className="exam-error-banner"
            role="alert"
            style={{
              padding: "12px",
              marginBottom: "16px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        {questions.length === 0 ? (
          <section
            className="exam-empty-state"
            style={{
              padding: "32px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "12px",
            }}
          >
            <div className="exam-empty-icon">📝</div>
            <h2 style={{ color: "#0f172a" }}>No Questions Available</h2>
            <p style={{ color: "#475569" }}>
              There are currently no questions assigned to this exam.
            </p>

            <button
              type="button"
              className="exam-secondary-button"
              onClick={() => navigate("/student/available-exams")}
            >
              Back to Available Exams
            </button>
          </section>
        ) : (
          <>
            <div
              className="exam-progress-section"
              style={{
                padding: "20px",
                background: "#ffffff",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                className="exam-progress-labels"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#334155" }}>Your progress</span>
                <strong style={{ color: "#2563eb" }}>
                  {Math.round((answeredCount / questions.length) * 100)}%
                </strong>
              </div>

              <div
                className="exam-progress-track"
                role="progressbar"
                aria-valuenow={answeredCount}
                aria-valuemin={0}
                aria-valuemax={questions.length}
                style={{
                  height: "8px",
                  background: "#e2e8f0",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="exam-progress-fill"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                    height: "100%",
                    background: "#2563eb",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>

            <div
              className="professional-question-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {questions.map((question, index) => {
                const questionId = question._id;
                const questionText = getQuestionText(question);

                const options = Array.isArray(question.options)
                  ? question.options
                  : [];

                return (
                  <section
                    key={questionId || index}
                    className="professional-question-card"
                    style={{
                      padding: "26px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                    }}
                  >
                    <div
                      className="question-card-heading"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <span style={{ color: "#2563eb", fontWeight: 700 }}>
                        Question {String(index + 1).padStart(2, "0")}
                      </span>

                      <span style={{ color: "#475569", fontWeight: 600 }}>
                        {question.marks || 1}{" "}
                        {Number(question.marks || 1) === 1
                          ? "Mark"
                          : "Marks"}
                      </span>
                    </div>

                    <h2
                      className="professional-question-text"
                      style={{
                        display: "block",
                        visibility: "visible",
                        opacity: 1,
                        color: "#000000",
                        backgroundColor: "#ffffff",
                        WebkitTextFillColor: "#000000",
                        fontSize: "24px",
                        fontWeight: 700,
                        lineHeight: 1.6,
                        margin: "0 0 22px",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {questionText ||
                        "Question text is missing. Check the browser Console for this question's data."}
                    </h2>

                    <div
                      className="professional-options-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                        gap: "12px",
                      }}
                    >
                      {options.map((option, optionIndex) => {
                        const optionValue =
                          typeof option === "string"
                            ? option
                            : option?.text ?? option?.value ?? "";

                        const selected =
                          answers[questionId] === optionValue;

                        return (
                          <label
                            key={optionIndex}
                            className={`professional-option ${
                              selected ? "is-selected" : ""
                            }`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "15px",
                              border: selected
                                ? "2px solid #2563eb"
                                : "1px solid #cbd5e1",
                              borderRadius: "9px",
                              background: selected ? "#eff6ff" : "#ffffff",
                              color: "#0f172a",
                              cursor: submitting ? "not-allowed" : "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name={questionId}
                              value={optionValue}
                              checked={selected}
                              onChange={() =>
                                handleAnswerChange(questionId, optionValue)
                              }
                              disabled={submitting}
                            />

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "30px",
                                height: "30px",
                                background: "#e2e8f0",
                                color: "#0f172a",
                                borderRadius: "6px",
                                fontWeight: 700,
                              }}
                            >
                              {String.fromCharCode(65 + optionIndex)}
                            </span>

                            <span
                              style={{
                                color: "#0f172a",
                                WebkitTextFillColor: "#0f172a",
                                fontSize: "15px",
                                lineHeight: 1.5,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {optionValue}
                            </span>

                            {selected && (
                              <span
                                style={{
                                  marginLeft: "auto",
                                  color: "#2563eb",
                                  fontWeight: 700,
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <footer
              className="professional-exam-footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginTop: "24px",
                padding: "22px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <div
                className="exam-footer-info"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <strong style={{ color: "#0f172a" }}>
                  {answeredCount} of {questions.length} answered
                </strong>
                <span style={{ color: "#64748b" }}>
                  Review your answers before submitting.
                </span>
              </div>

              <button
                type="button"
                className="exam-submit-button"
                onClick={() => handleSubmit(false)}
                disabled={submitting || remainingSeconds === 0}
                style={{
                  padding: "13px 22px",
                  border: "none",
                  borderRadius: "8px",
                  background: submitting ? "#94a3b8" : "#16a34a",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting
                  ? "Submitting Exam..."
                  : remainingSeconds === 0
                    ? "Time is over"
                    : "Submit Examination"}
              </button>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
