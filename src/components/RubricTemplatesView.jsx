import { useEffect, useState } from "react";
import RubricBuilder from "./RubricBuilder";
import { listRubricTemplates, createRubricTemplate, deleteRubricTemplate } from "../api/rubricTemplates";

const emptyCriteria = () => [
  { id: crypto.randomUUID(), name: "", weight: 25, description: "" },
];

export default function RubricTemplatesView() {
  const [templates, setTemplates] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); // loading | error | ready
  const [loadError, setLoadError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState(emptyCriteria);
  const [maxScore, setMaxScore] = useState(100);
  const [passingScore, setPassingScore] = useState(60);

  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | error
  const [saveError, setSaveError] = useState("");

  const fetchTemplates = async () => {
    setLoadStatus("loading");
    try {
      const data = await listRubricTemplates();
      setTemplates(data || []);
      setLoadStatus("ready");
    } catch (err) {
      setLoadError(err.message || "Could not load rubric templates.");
      setLoadStatus("error");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCriteria(emptyCriteria());
    setMaxScore(100);
    setPassingScore(60);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveStatus("saving");
    setSaveError("");

    const payload = {
      name,
      description: description || undefined,
      criteria: criteria.map(({ name: cName, weight, description: cDesc }) => ({
        name: cName,
        weight: Number(weight),
        description: cDesc || undefined,
      })),
      max_score: Number(maxScore),
      passing_score: Number(passingScore),
    };

    try {
      await createRubricTemplate(payload);
      resetForm();
      setSaveStatus("idle");
      fetchTemplates();
    } catch (err) {
      setSaveError(err.message || "Could not save this rubric template.");
      setSaveStatus("error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRubricTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setLoadError(err.message || "Could not delete this template.");
    }
  };

  return (
    <div className="templates-view">
      <header className="evaluation-view__header">
        <p className="eyebrow">Rubric templates</p>
        <h1>Reusable grading rubrics</h1>
        <p className="evaluation-view__lede">
          Save a rubric once, then select it from the evaluation form instead of rebuilding it each time.
        </p>
      </header>

      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="templateName">Template name</label>
          <input
            id="templateName"
            type="text"
            required
            maxLength={150}
            placeholder="e.g. Daily Routine - Present Simple"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="templateDescription">Description <span className="optional">(optional)</span></label>
          <textarea
            id="templateDescription"
            rows={2}
            placeholder="What this rubric is used for"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <RubricBuilder criteria={criteria} onChange={setCriteria} title="Criteria" />

        <div className="field-row">
          <div className="field">
            <label htmlFor="templateMaxScore">Max score</label>
            <input
              id="templateMaxScore"
              type="number"
              min="1"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="templatePassingScore">Passing score</label>
            <input
              id="templatePassingScore"
              type="number"
              min="0"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="evaluation-form__actions">
          <button type="submit" className="btn btn--primary" disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "Saving..." : "Save template"}
          </button>
        </div>

        {saveStatus === "error" && (
          <div className="alert alert--error" role="alert">
            <strong>Could not save this template.</strong>
            <p>{saveError}</p>
          </div>
        )}
      </form>

      <section className="templates-list">
        <h2>Saved templates</h2>

        {loadStatus === "loading" && <p className="templates-list__hint">Loading templates...</p>}

        {loadStatus === "error" && (
          <div className="alert alert--error" role="alert">
            <strong>Could not load templates.</strong>
            <p>{loadError}</p>
          </div>
        )}

        {loadStatus === "ready" && templates.length === 0 && (
          <p className="templates-list__hint">No templates saved yet. Create one above.</p>
        )}

        {loadStatus === "ready" && templates.length > 0 && (
          <ul className="templates-list__items">
            {templates.map((template) => (
              <li key={template.id} className="template-card">
                <div className="template-card__head">
                  <h3>{template.name}</h3>
                  <button
                    type="button"
                    className="template-card__delete"
                    onClick={() => handleDelete(template.id)}
                    aria-label={`Delete ${template.name}`}
                  >
                    Delete
                  </button>
                </div>
                {template.description && <p className="template-card__description">{template.description}</p>}
                <ul className="template-card__criteria">
                  {template.criteria.map((c, i) => (
                    <li key={i}>
                      <span>{c.name}</span>
                      <span className="template-card__weight">{c.weight} pts</span>
                    </li>
                  ))}
                </ul>
                <p className="template-card__meta">
                  Max score {template.max_score} · Passing {template.passing_score}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
