import { useState } from "react";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import EvaluationForm from "./components/EvaluationForm";
import SpeakingEvaluationForm from "./components/SpeakingEvaluationForm";
import RubricTemplatesView from "./components/RubricTemplatesView";
import HistoryView from "./components/HistoryView";

export default function App() {
  const [activeView, setActiveView] = useState("new");

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main">
        {activeView === "new" && <EvaluationForm />}
        
        {activeView === "speaking" && <SpeakingEvaluationForm />}
        {activeView === "rubrics" && <RubricTemplatesView />}
        {activeView === "history" && <HistoryView />}
        {activeView === "authform" && <AuthForm />}
      </main>
    </div>
  );
}
