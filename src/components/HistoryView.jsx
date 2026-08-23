import { useEffect, useState } from "react";
import { getEvaluationHistory, getSpeakingHistory, getHistorySummary } from "../api/history";

export default function HistoryView() {
  const [summary, setSummary] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [speakingEvaluations, setSpeakingEvaluations] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setStatus("loading");
      setErrorMessage("");

      try {
        const [summaryData, evalData, speakingData] = await Promise.all([
          getHistorySummary(),
          getEvaluationHistory(),
          getSpeakingHistory(),
        ]);

        if (cancelled) return;

        setSummary(summaryData);
        setEvaluations(evalData || []);
        setSpeakingEvaluations(speakingData || []);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err.message || "Could not load history.");
        setStatus("error");
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="history-view">
        <p>Loading history...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="history-view">
        <div className="alert alert--error" role="alert">
          <strong>Could not load history.</strong>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-view">
      <header className="history-view__header">
        <h1 className="eyebrow">History</h1>
        <h2>Your progress</h2>
      </header>

      {summary && (
        <div className="history-summary">
          <div className="history-summary__card">
            <span className="history-summary__label">Written evaluations</span>
            <span className="history-summary__value">{summary.total_evaluations}</span>
          </div>
          <div className="history-summary__card">
            <span className="history-summary__label">Avg. written score</span>
            <span className="history-summary__value">
              {summary.average_score != null ? summary.average_score : "—"}
            </span>
          </div>
          <div className="history-summary__card">
            <span className="history-summary__label">Speaking evaluations</span>
            <span className="history-summary__value">{summary.total_speaking_evaluations}</span>
          </div>
          <div className="history-summary__card">
            <span className="history-summary__label">Avg. speaking score</span>
            <span className="history-summary__value">
              {summary.average_speaking_score != null ? summary.average_speaking_score : "—"}
            </span>
          </div>
        </div>
      )}

      <section className="history-section">
        <h3>Written evaluations</h3>
        {evaluations.length === 0 ? (
          <p className="history-empty">No written evaluations yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Question</th>
                <th>Score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.evaluated_at ? new Date(ev.evaluated_at).toLocaleDateString() : "—"}</td>
                  <td className="history-table__truncate">{ev.question_text}</td>
                  <td>
                    {ev.score} / {ev.max_score}
                  </td>
                  <td>
                    <span className={`badge ${ev.approved ? "badge--success" : "badge--fail"}`}>
                      {ev.approved ? "Passed" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="history-section">
        <h3>Speaking evaluations</h3>
        {speakingEvaluations.length === 0 ? (
          <p className="history-empty">No speaking evaluations yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam</th>
                <th>Question</th>
                <th>Score</th>
                <th>Band</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {speakingEvaluations.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.created_at ? new Date(ev.created_at).toLocaleDateString() : "—"}</td>
                  <td>{ev.exam_type}</td>
                  <td className="history-table__truncate">{ev.question}</td>
                  <td>{ev.overall_score}</td>
                  <td>{ev.band || ev.cefr_level || "—"}</td>
                  <td>
                    <span className={`badge ${ev.passed ? "badge--success" : "badge--fail"}`}>
                      {ev.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
