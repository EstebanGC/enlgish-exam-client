function makeCriterion() {
  return { id: crypto.randomUUID(), name: "", weight: 25, description: "" };
}

export default function RubricBuilder({ criteria, onChange, title = "Grading rubric"  }) {
  const updateCriterion = (id, field, value) => {
    onChange(criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addCriterion = () => {
    onChange([...criteria, makeCriterion()]);
  };

  const removeCriterion = (id) => {
    if (criteria.length <= 1) return;
    onChange(criteria.filter((c) => c.id !== id));
  };

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

  return (
    <fieldset className="rubric-builder">
      <legend>{title}</legend>

      <div className="rubric-builder__list">
        {criteria.map((criterion, index) => (
          <div className="rubric-row" key={criterion.id}>
            <span className="rubric-row__index">{index + 1}</span>

            <div className="rubric-row__fields">
              <input
                type="text"
                placeholder="Criterion name (e.g. grammar)"
                value={criterion.name}
                onChange={(e) => updateCriterion(criterion.id, "name", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="What this criterion checks for"
                value={criterion.description}
                onChange={(e) => updateCriterion(criterion.id, "description", e.target.value)}
              />
            </div>

            <label className="rubric-row__weight">
              <span>Weight</span>
              <input
                type="number"
                min="1"
                max="100"
                value={criterion.weight}
                onChange={(e) => updateCriterion(criterion.id, "weight", e.target.value)}
                required
              />
            </label>

            <button
              type="button"
              className="rubric-row__remove"
              onClick={() => removeCriterion(criterion.id)}
              disabled={criteria.length <= 1}
              aria-label={`Remove criterion ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="rubric-builder__footer">
        <button type="button" className="btn btn--ghost" onClick={addCriterion}>
          + Add evaluation criteria
        </button>
        <span className={`rubric-builder__total ${totalWeight !== 100 ? "is-warning" : ""}`}>
          Total weight: {totalWeight}{totalWeight !== 100 ? " (should equal max score)" : ""}
        </span>
      </div>
    </fieldset>
  );
}
