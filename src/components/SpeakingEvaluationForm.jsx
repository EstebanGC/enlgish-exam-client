import { useEffect, useRef, useState } from "react";
import RubricBuilder from "./RubricBuilder";
import SpeakingResultCard from "./SpeakingResultCard";
import { submitSpeakingEvaluation } from "../api/speakingEvaluations";

const EXAM_TYPES = [
  { value: "KET", label: "KET (A2 Key)", desc: "6 criteria · Scale 1–5" },
  { value: "FCE", label: "FCE (B2 First)", desc: "5 criteria · Scale 1–5" },
  { value: "IELTS", label: "IELTS Speaking", desc: "4 criteria · Band 1–9" },
  { value: "CUSTOM", label: "Custom rubric", desc: "Build your own criteria" },
];

const initialCustomCriteria = () => [
  { id: crypto.randomUUID(), name: "Pronunciation", weight: 25, description: "Phoneme accuracy, stress, intonation, rhythm" },
  { id: crypto.randomUUID(), name: "Fluency", weight: 25, description: "Flow, hesitation, linking, discourse markers" },
  { id: crypto.randomUUID(), name: "Vocabulary", weight: 25, description: "Range, precision, collocations" },
  { id: crypto.randomUUID(), name: "Grammar", weight: 25, description: "Structures, accuracy, complexity" },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function SpeakingEvaluationForm() {
  const [examType, setExamType] = useState("IELTS");
  const [questionText, setQuestionText] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const [customCriteria, setCustomCriteria] = useState(initialCustomCriteria);
  const [customMaxScore, setCustomMaxScore] = useState(100);
  const [customPassingScore, setCustomPassingScore] = useState(60);

  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const startRecording = async () => {
    setRecordingStatus("requesting");
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setAudioLevel(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingStatus("stopped");
        stopVisualizer();
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100);
      setRecordingStatus("recording");

      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        setAudioLevel(dataArray.reduce((a, b) => a + b, 0) / dataArray.length);
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch (err) {
      console.error(err);
      setRecordingStatus("idle");
      alert("Could not access microphone. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setAudioLevel(0);
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setRecordingStatus("idle");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!audioBlob) {
      setErrorMessage("Please record an audio response before submitting.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    const formData = new FormData();
    formData.append("audio", audioBlob, "response.webm");
    formData.append("exam_type", examType);
    formData.append("question_text", questionText);
    if (referenceId) formData.append("external_response_id", referenceId);

    if (examType === "CUSTOM") {
      formData.append("custom_rubric", JSON.stringify({
        criteria: customCriteria.map(({ name, weight, description }) => ({
          name, weight: Number(weight), description: description || undefined,
        })),
      }));
      formData.append("max_score", String(customMaxScore));
      formData.append("passing_score", String(customPassingScore));
    }

    try {
      const data = await submitSpeakingEvaluation(formData);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong while evaluating the speaking response.");
      setStatus("error");
    }
  };

  const isOfficial = examType !== "CUSTOM";

  return (
    <div className="evaluation-view">
      <header className="evaluation-view__header">
        <h1 className="eyebrow">Speaking evaluation</h1>
        <h2>Grade a spoken response</h2>
        <p className="evaluation-view__lede">
          The student records their spoken answer. The AI listens to the audio natively and evaluates pronunciation, fluency, vocabulary, grammar, and coherence.
        </p>
      </header>

      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="examType">Exam type</label>
          <select id="examType" value={examType} onChange={(e) => { setExamType(e.target.value); setResult(null); setStatus("idle"); }}>
            {EXAM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <span className="field-hint">{EXAM_TYPES.find((t) => t.value === examType)?.desc}</span>
        </div>

        <div className="field">
          <label htmlFor="referenceId">Reference ID <span className="optional">(optional)</span></label>
          <input id="referenceId" type="text" placeholder="e.g. resp_001" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="questionText">Speaking prompt / question</label>
          <textarea id="questionText" rows={3} required minLength={10} maxLength={5000}
            placeholder="Describe your daily routine using present simple tense."
            value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
        </div>

        <div className="field">
          <label>Student audio response</label>
          <div className="audio-recorder">
            {recordingStatus === "idle" && (
              <button type="button" className="btn btn--primary btn--large" onClick={startRecording}>🎙️ Start recording</button>
            )}
            {recordingStatus === "requesting" && <div className="recorder-status">Requesting microphone access…</div>}
            {recordingStatus === "recording" && (
              <div className="recorder-active">
                <div className="recorder-timer">{formatTime(recordingTime)}</div>
                <div className="audio-visualizer"><div className="audio-bar" style={{ height: `${Math.min(100, audioLevel)}%` }} /></div>
                <button type="button" className="btn btn--danger" onClick={stopRecording}>⏹ Stop recording</button>
              </div>
            )}
            {recordingStatus === "stopped" && audioUrl && (
              <div className="recorder-playback">
                <audio controls src={audioUrl} className="playback-audio" />
                <div className="recorder-actions">
                  <button type="button" className="btn btn--secondary" onClick={discardRecording}>Discard & re-record</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isOfficial && (
          <>
            <RubricBuilder criteria={customCriteria} onChange={setCustomCriteria} />
            <div className="field-row">
              <div className="field">
                <label htmlFor="customMaxScore">Max score</label>
                <input id="customMaxScore" type="number" min="1" value={customMaxScore} onChange={(e) => setCustomMaxScore(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="customPassingScore">Passing score</label>
                <input id="customPassingScore" type="number" min="0" value={customPassingScore} onChange={(e) => setCustomPassingScore(e.target.value)} required />
              </div>
            </div>
          </>
        )}

        {isOfficial && (
          <div className="alert alert--info">
            <strong>Official {examType} rubric will be used.</strong>
            <p>The AI evaluator will apply the certified {examType} Speaking descriptors.</p>
          </div>
        )}

        <div className="evaluation-form__actions">
          <button type="submit" className="btn btn--primary" disabled={status === "loading" || !audioBlob}>
            {status === "loading" ? "Evaluating audio…" : "Evaluate speaking"}
          </button>
          {status === "loading" && <span className="evaluation-form__hint">The AI is listening to the audio. This may take 20-60 seconds.</span>}
        </div>

        {status === "error" && (
          <div className="alert alert--error" role="alert">
            <strong>Could not evaluate this response.</strong>
            <p>{errorMessage}</p>
          </div>
        )}
      </form>

      {result && <SpeakingResultCard result={result} />}
    </div>
  );
}