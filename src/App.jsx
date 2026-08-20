import { useState } from "react";
import AuthForm from "./components/Authform";
import Sidebar from "./components/Sidebar";
import EvaluationForm from "./components/EvaluationForm";
import SpeakingEvaluationForm from "./components/SpeakingEvaluationForm";
import RubricTemplatesView from "./components/RubricTemplatesView";


export default function App() {
  const [activeView, setActiveView] = useState("new");

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main">
        {activeView === "new" && <EvaluationForm />}
        {activeView === "speaking" && <SpeakingEvaluationForm />}
        {activeView === "rubrics" && <RubricTemplatesView />}
        {activeView === "authform" && <AuthForm />}

      </main>
    </div>
  );
}