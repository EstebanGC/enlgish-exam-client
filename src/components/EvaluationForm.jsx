import { useEffect, useState } from "react";
import RubricBuilder from "./RubricBuilder";
import ResultCard from "./ResultCard";
import { submitEvaluation } from "../api/evaluations";
import { listRubricTemplates } from "../api/rubricTemplates";

const initialCriteria = () => [
  { id: crypto.randomUUID(), name: "grammar", weight: 25, description: "Correct use of grammar and tenses" },
  { id: crypto.randomUUID(), name: "vocabulary", weight: 25, description: "Range and accuracy of vocabulary" },
  { id: crypto.randomUUID(), name: "coherence", weight: 25, description: "Logical flow of ideas" },
  { id: crypto.randomUUID(), name: "task_achievement", weight: 25, description: "Covers what the question asks" },
];

export default function EvaluationForm() {
  const [questionText, setQuestionText] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [criteria, setCriteria] = useState(initialCriteria);
  const [maxScore, setMaxScore] = useState(100);
  const [passingScore, setPassingScore] = useState(60);
  const [referenceId, setReferenceId] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [status, setStatus] = useState("idle"); // idle | loading | error | success
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    listRubricTemplates()
      .then((data) => setTemplates(data || []))
      .catch(() => setTemplates([]));
  }, []);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);

    if (!templateId) return;

    const template = templates.find((t) => String(t.id) === templateId);
    if (!template) return;

    setCriteria(
      template.criteria.map((c) => ({
        id: crypto.randomUUID(),
        name: c.name,
        weight: c.weight,
        description: c.description || "",
      }))
    );
    setMaxScore(template.max_score);
    setPassingScore(template.passing_score);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    const payload = {
      external_response_id: referenceId || undefined,
      question_text: questionText,
      student_answer: studentAnswer,
      rubric: {
        criteria: criteria.map(({ name, weight, description }) => ({
          name,
          weight: Number(weight),
          description: description || undefined,
        })),
      },
      max_score: Number(maxScore),
      passing_score: Number(passingScore),
    };

    try {
      const data = await submitEvaluation(payload);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong while grading this response.");
      setStatus("error");
    }
  };

  return (
    <div className="evaluation-view">
      <header className="evaluation-view__header">
        <h1 className="eyebrow">New evaluation</h1>
        <h2>Grade a student response</h2>
        <p className="evaluation-view__lede">
          Paste the exam question, the student's answer, define the rubric, and send it for grading.
        </p>
      </header>

      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="referenceId">Reference ID <span className="optional">(optional)</span></label>
          <input
            id="referenceId"
            type="text"
            placeholder="e.g. resp_001"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="questionText">Exam question</label>
          <textarea
            id="questionText"
            rows={3}
            required
            minLength={10}
            maxLength={5000}
            placeholder="Describe your daily routine using present simple tense."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="studentAnswer">Student answer</label>
          <textarea
            id="studentAnswer"
            rows={6}
            required
            minLength={10}
            maxLength={10000}
            placeholder="I wake up at 7 am. I goes to work by bus..."
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="rubricTemplate">Use a saved rubric <span className="optional">(optional)</span></label>
          <select
            id="rubricTemplate"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
          >
            <option value="">— Build rubric manually —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <RubricBuilder criteria={criteria} onChange={setCriteria} />

        <div className="field-row">
          <div className="field">
            <label htmlFor="maxScore">Max score</label>
            <input
              id="maxScore"
              type="number"
              min="1"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="passingScore">Passing score</label>
            <input
              id="passingScore"
              type="number"
              min="0"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="evaluation-form__actions">
          <button type="submit" className="btn btn--primary" disabled={status === "loading"}>
            {status === "loading" ? "Grading..." : "Grade response"}
          </button>
          {status === "loading" && (
            <span className="evaluation-form__hint">
              This can take longer on the first request while the model loads.
            </span>
          )}
        </div>

        {status === "error" && (
          <div className="alert alert--error" role="alert">
            <strong>Could not grade this response.</strong>
            <p>{errorMessage}</p>
          </div>
        )}
      </form>

      {result && <ResultCard result={result} />}
    </div>
  );
}