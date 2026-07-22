const NAV_ITEMS = [
  { key: "new", label: "New evaluation", enabled: true },
  { key: "history", label: "History", enabled: false },
  { key: "rubrics", label: "Rubric templates", enabled: true },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark" aria-hidden="true">✓</span>
        <div>
          <p className="sidebar__title">Exam Evaluator</p>
          <p className="sidebar__subtitle">Grading desk</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`sidebar__link ${activeView === item.key ? "is-active" : ""}`}
            disabled={!item.enabled}
            onClick={() => item.enabled && onNavigate(item.key)}
            title={item.enabled ? undefined : "Coming soon"}
          >
            {item.label}
            {!item.enabled && <span className="sidebar__badge">soon</span>}
          </button>
        ))}
      </nav>

      <p className="sidebar__footnote">
        English Evaluator Group S.A.
      </p>
    </aside>
  );
}
