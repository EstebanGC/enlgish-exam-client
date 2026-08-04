import { useState } from "react";

function cefrColor(level) {
  const map = { A1: "#e74c3c", A2: "#e67e22", B1: "#f1c40f", B2: "#2ecc71", C1: "#3498db", C2: "#9b59b6" };
  return map[level?.toUpperCase()] || "#95a5a6";
}

export default function SpeakingResultCard({ result }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const breakdown = result.score_breakdown || [];
  const improvements = result.priority_improvements || [];

  return (
    <div className="result-card speaking-result">
      <div className="result-card__header">
        <div className="result-card__score-ring">
          <span className="result-card__score-value">{result.overall_score}</span>
          <span className="result-card__score-label">/ {result.max_score || (result.exam_type === "IELTS" ? 9 : 5)}</span>
        </div>
        <div className="result-card__meta">
          <span className="cefr-badge" style={{ backgroundColor: cefrColor(result.cefr_level) }}>
            {result.cefr_level || "—"}
          </span>
          {result.overall_band && <span className="band-badge">Band {result.overall_band}</span>}
          <span className={`status-badge ${result.approved ? "approved" : "rejected"}`}>
            {result.approved ? "Approved" : "Not approved"}
          </span>
        </div>
      </div>

      <div className="result-card__feedback">
        <h4>Overall feedback</h4>
        <p>{result.feedback || "No feedback provided."}</p>
      </div>

      {breakdown.length > 0 && (
        <div className="result-card__breakdown">
          <h4>Score breakdown</h4>
          {breakdown.map((item, idx) => (
            <div key={idx} className="breakdown-row">
              <div className="breakdown-info">
                <span className="breakdown-name">{item.criterion}</span>
                <span className="breakdown-score">{item.score} / {item.max}</span>
              </div>
              <div className="breakdown-bar-bg">
                <div className="breakdown-bar-fill" style={{ width: `${(item.score / item.max) * 100}%` }} />
              </div>
              {item.comment && <p className="breakdown-comment">{item.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {improvements.length > 0 && (
        <div className="result-card__improvements">
          <h4>Priority improvements</h4>
          <ol>{improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}</ol>
        </div>
      )}

      {result.transcript && (
        <div className="result-card__transcript">
          <button type="button" className="btn btn--secondary btn--small" onClick={() => setShowTranscript((s) => !s)}>
            {showTranscript ? "Hide transcript" : "Show AI transcript"}
          </button>
          {showTranscript && <div className="transcript-box"><p><em>{result.transcript}</em></p></div>}
        </div>
      )}

      <div className="result-card__footer">
        <span className="model-tag">{result.model_used}</span>
        <span className="eval-time">{result.evaluated_at ? new Date(result.evaluated_at).toLocaleString() : ""}</span>
      </div>
    </div>
  );
}