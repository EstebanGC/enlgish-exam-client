# English Evaluator — Frontend

React client for an AI-powered English assessment platform.

The application provides interfaces for written evaluation, speaking evaluation, audio recording, rubric management and result visualization.

> **Product vision:** a standalone assessment interface or reference client for an organization-specific English evaluation engine.

---

## Overview

The frontend communicates with the FastAPI backend through REST APIs.

```text
Written
  Question + Response
          ↓
      FastAPI API
          ↓
   Score + Feedback
```

```text
Speaking
  Question
     ↓
  Microphone
     ↓
  MediaRecorder
     ↓
 audio/webm
     ↓
  FastAPI API
     ↓
Whisper + LLM evaluation
     ↓
Speaking result
```

The browser records and submits data; evaluation remains a backend responsibility.

---

## Main features

### Written evaluation

Users can provide:

- a question
- an English response
- an evaluation configuration/rubric

The UI displays:

- overall score
- criterion-level scores
- feedback
- improvement suggestions
- proficiency information where available

### Speaking evaluation

The browser requests microphone access with:

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
```

and records using:

```javascript
MediaRecorder
```

Users can:

- start recording
- stop recording
- replay audio
- discard and re-record
- submit for evaluation

Audio is sent using multipart form data.

### Rubric templates

Users can create and manage reusable criteria and weights.

Example:

```text
Grammar       25%
Vocabulary    25%
Fluency       25%
Pronunciation 25%
```

The rubric builder is intentionally generic so the product can support organization-specific assessment frameworks.

---

## Project structure

```text
src/
├── api/
│   ├── evaluations.js
│   ├── speakingEvaluations.js
│   └── rubricTemplates.js
│
├── components/
│   ├── EvaluationForm.jsx
│   ├── SpeakingEvaluationForm.jsx
│   ├── ResultCard.jsx
│   ├── SpeakingResultCard.jsx
│   ├── RubricBuilder.jsx
│   ├── RubricTemplatesView.jsx
│   └── Sidebar.jsx
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## API layer

The `src/api/` directory isolates backend communication.

### `evaluations.js`

Written evaluation requests.

### `speakingEvaluations.js`

Speaking/audio evaluation requests. Recorded audio is submitted through `FormData`.

### `rubricTemplates.js`

Rubric template operations.

Keeping API access separate from UI components makes the client easier to maintain and change.

---

## Main components

### `EvaluationForm`

Collects written evaluation data, submits it and manages loading/error states.

### `SpeakingEvaluationForm`

Controls:

- microphone permission
- recording
- playback
- re-recording
- exam/rubric selection
- submission
- result handling

### `ResultCard`

Displays written evaluation results.

### `SpeakingResultCard`

Displays:

- overall score
- band/proficiency
- CEFR level
- criterion breakdown
- feedback
- improvement recommendations
- transcript where available

### `RubricBuilder`

Creates evaluation criteria and weights.

### `RubricTemplatesView`

Displays and manages reusable rubrics.

### `Sidebar`

Primary application navigation.

---

## Application flow

```text
Application
   │
   ├── New Evaluation
   │      └── Written assessment
   │
   ├── Speaking
   │      └── Audio assessment
   │
   ├── Rubric Templates
   │
   └── History
```

The current architecture provides a foundation for adding evaluation history and analytics.

---

## Speaking recorder

The speaking recorder is deliberately browser-based.

```text
getUserMedia()
      ↓
MediaRecorder
      ↓
audio/webm
      ↓
FormData
      ↓
POST /evaluate-speaking
```

The backend is responsible for transcription and evaluation.

Production deployments should consider:

- microphone permissions
- unsupported browsers
- mobile browsers
- codec differences
- interrupted recordings
- upload size
- network failures
- maximum recording duration
- audio validation on the server

---

## Result contract

The frontend expects a stable structured response.

Conceptually:

```json
{
  "id": 1,
  "exam_type": "IELTS",
  "question_text": "Describe your daily routine.",
  "overall_score": 6.5,
  "overall_band": "6.5",
  "cefr_level": "B2",
  "approved": true,
  "feedback": "Your response is clear...",
  "score_breakdown": [
    {
      "criterion": "Fluency & Coherence",
      "score": 6,
      "max": 9,
      "comment": "..."
    }
  ],
  "transcript": "...",
  "priority_improvements": [
    "Expand vocabulary range",
    "Use more complex structures"
  ]
}
```

The frontend should rely on this API contract rather than internal backend/database models.

---

## Environment configuration

Use environment variables for the API address.

Example:

```env
VITE_API_URL=https://your-api.example.com
```

Do not put secrets in frontend environment variables. Values exposed to a browser application can be inspected by users.

Only public client configuration belongs there.

---

## Local development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

A typical local architecture is:

```text
React
http://localhost:5173
      │
      ▼
FastAPI
http://localhost:8000
      │
      ├── PostgreSQL
      └── LLM / speech services
```

---

# Product positioning

The frontend can evolve into several product experiences.

### Standalone assessment platform

Learners complete written and speaking assessments.

### Language school

Teachers assign assessments and review learner results.

### Corporate English assessment

Organizations assess employees or candidates using custom rubrics.

### Recruitment screening

Candidates complete standardized English assessments.

### Embedded assessment

An existing LMS, HR platform or education system uses the backend evaluation engine while retaining its own UI.

---

# Product roadmap

## MVP

- Written evaluation
- Speaking recording
- AI evaluation
- Rubrics
- Results
- Feedback

## V1

- Authentication
- User accounts
- Evaluation history
- Learner progress
- Custom exams
- Custom rubrics

## V2

- Organizations
- Multi-tenancy
- Teacher/admin roles
- Assignments
- Analytics
- Reporting
- API keys

## V3

- Advanced speaking analysis
- pronunciation analysis
- acoustic/prosody analysis
- placement testing
- organization integrations

---

# UX roadmap

## Evaluation history

```text
Date
Exam
Score
CEFR
Status
```

## Learner progress

Track score changes over time and criterion-level improvement.

## Teacher dashboard

Potential features:

- create exams
- assign assessments
- manage students
- review results
- compare performance
- export reports

## Organization dashboard

Potential features:

- organization settings
- users
- roles
- rubrics
- assessments
- analytics
- API credentials

---

# Security

The frontend must never contain:

- LLM API keys
- database credentials
- private service tokens
- administrative secrets

Privileged operations belong to the backend.

Production deployments should also implement backend controls for:

- authentication
- authorization
- rate limiting
- input validation
- upload size limits
- MIME/type validation
- secure CORS
- HTTPS
- organization-level data isolation

---

# Design principles

1. **API-first** — the UI is a client of the evaluation engine.
2. **Component separation** — recording, API access, rubric management and results remain separate concerns.
3. **Reusable evaluation UI** — the interface supports multiple assessment types.
4. **Rubric-driven product design** — not hard-coded to one exam.
5. **Backend-owned evaluation** — the browser records/submits; the backend evaluates.
6. **Progressive architecture** — the current MVP can grow into a multi-user assessment platform.

---

## License

Add the project's chosen license before public distribution.

## Disclaimer

Third-party examination names, rubrics and proficiency terminology may be protected intellectual property or trademarks. Describe third-party examinations as compatible with or inspired by public criteria unless the appropriate authorization or licensing has been obtained.
