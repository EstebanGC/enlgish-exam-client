import { useState } from "react";
import Sidebar from "./components/Sidebar";
import EvaluationForm from "./components/EvaluationForm";
import RubricTemplatesView from "./components/RubricTemplatesView";

export default function App() {
  const [activeView, setActiveView] = useState("new");

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main">
        {activeView === "new" && <EvaluationForm />}
        {activeView === "rubrics" && <RubricTemplatesView />}
      </main>
    </div>
  );
}