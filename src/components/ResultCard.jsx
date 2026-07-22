export default function ResultCard({ result }) {
  if (!result) return null;

  const { score, approved, feedback, score_breakdown: breakdown, model_used, evaluated_at } = result;

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-card__head">
        <div className="result-card__score">
          <svg viewBox="0 0 140 140" className="result-card__circle" aria-hidden="true">
            <path
              d="M 70 12
                 C 105 10, 130 35, 128 70
                 C 130 106, 103 130, 69 129
                 C 33 131, 10 104, 12 69
                 C 9 34, 36 9, 70 12 Z"
              fill="none"
              stroke="var(--ink-red)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="result-card__number">{Math.round(score)}</span>
        </div>

        <div className="result-card__meta">
          <span className={`result-card__status ${approved ? "is-approved" : "is-not-approved"}`}>
            {approved ? "Approved" : "Not approved"}
          </span>
          <p className="result-card__model">Graded by {model_used || "unknown model"}</p>
          {evaluated_at && (
            <p className="result-card__date">
              {new Date(evaluated_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {feedback && (
        <div className="result-card__feedback">
          <h3>Overall feedback</h3>
          <p>{feedback}</p>
        </div>
      )}

      {Array.isArray(breakdown) && breakdown.length > 0 && (
        <div className="result-card__breakdown">
          <h3>Breakdown by criterion</h3>
          <ul>
            {breakdown.map((item, index) => (
              <li key={`${item.criterion}-${index}`}>
                <div className="breakdown-row__head">
                  <span className="breakdown-row__name">{item.criterion}</span>
                  <span className="breakdown-row__score">
                    {item.score} / {item.max}
                  </span>
                </div>
                {item.comment && <p className="breakdown-row__comment">{item.comment}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
