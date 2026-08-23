import { useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus, LogIn, AlertCircle } from "lucide-react";
 
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
 
        // Registration successful -> log in automatically
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
          // Account was created but auto-login failed: send the user to log in manually
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Tabs */}
        <div className="flex mb-6 bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              isLogin
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              !isLogin
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Sign up
          </button>
        </div>
 
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h1 className="text-xl font-semibold text-white mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            {isLogin
              ? "Enter your details to continue"
              : "Fill in your details to sign up"}
          </p>
 
          {error && (
            <div className="flex items-start gap-2 bg-red-950/50 border border-red-900 text-red-300 text-sm rounded-lg px-3 py-2 mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
 
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Jane Doe"
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
                    fieldErrors.name ? "border-red-700" : "border-slate-700"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
                )}
              </div>
            )}
 
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
                  fieldErrors.email ? "border-red-700" : "border-slate-700"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
              )}
            </div>
 
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 pr-10 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
                    fieldErrors.password ? "border-red-700" : "border-slate-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
              )}
            </div>
 
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 transition-colors mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Log in" : "Sign up"}
            </button>
          </form>
        </div>
 
        <p className="text-center text-sm text-slate-500 mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}