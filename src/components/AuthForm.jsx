import { useState } from "react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const API_BASE_URL = "https://english-exam-app-99zy.onrender.com";

export default function AuthForm({ onAuthSuccess = (token, mode) => {} }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isLogin = mode === "login";

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate() {
    const errors = {};
    if (!isLogin && form.name.trim().length < 2) {
      errors.name = "Enter your full name";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address";
    }
    if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Invalid credentials");
        }

        localStorage.setItem("access_token", data.access_token);
        onAuthSuccess(data.access_token, "login");
      } else {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Could not create account");
        }

        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          setMode("login");
          setError("Account created. Please log in.");
          setLoading(false);
          return;
        }

        localStorage.setItem("access_token", loginData.access_token);
        onAuthSuccess(loginData.access_token, "register");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setFieldErrors({});
  }

  return (
    <div className="evaluation-view auth-view">
      <header className="evaluation-view__header">
        <p className="eyebrow">{isLogin ? "Grading desk" : "New account"}</p>
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="evaluation-view__lede">
          {isLogin
            ? "Sign in to grade responses and track progress over time."
            : "Set up an account to start grading and keep a record of every evaluation."}
        </p>
      </header>

      <div className="evaluation-form auth-form-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "is-active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "is-active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="alert alert--error" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-fields">
          {!isLogin && (
            <div className="field">
              <label htmlFor="authName">Full name</label>
              <input
                id="authName"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Jane Doe"
                className={fieldErrors.name ? "has-error" : ""}
              />
              {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </div>
          )}

          <div className="field">
            <label htmlFor="authEmail">Email address</label>
            <input
              id="authEmail"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={fieldErrors.email ? "has-error" : ""}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="authPassword">Password</label>
            <div className="auth-password-wrap">
              <input
                id="authPassword"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={fieldErrors.password ? "has-error" : ""}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          <div className="evaluation-form__actions">
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading && <Loader2 className="btn__spinner" size={16} />}
              {isLogin ? "Log in" : "Sign up"}
            </button>
          </div>
        </form>
      </div>

      <p className="auth-switch">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" className="auth-switch__link" onClick={() => switchMode(isLogin ? "register" : "login")}>
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
