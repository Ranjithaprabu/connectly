
import { useState } from "react";
import "./AuthScreen.css";
import {
  MessageCircle,
  LoaderCircle,
} from "lucide-react";
import { request } from "../api/client";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (mode === "register") {
        const data = await request("/api/auth/register", null, {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });

        // Registration succeeds; ask the user to sign in.
        setMode("login");
        setName("");
        setPassword("");
        setNotice(
          data.message || "Registration successful. Please log in."
        );
      } else {
        const data = await request("/api/auth/login", null, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode((current) =>
      current === "login" ? "register" : "login"
    );
    setError("");
    setNotice("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">
          <MessageCircle size={28} />
        </div>

        <h1>Connectly</h1>
        <p className="muted">
          Conversations that bring people closer.
        </p>

        <h2>
          {mode === "login"
            ? "Welcome back"
            : "Create your account"}
        </h2>

        <p className="muted">
          {mode === "login"
            ? "Sign in to continue chatting."
            : "Join the conversation."}
        </p>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        <form onSubmit={submit} className="auth-form">
          {mode === "register" && (
            <label>
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              maxLength={72}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
            />
          </label>

          <button className="primary-btn" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="switch-mode">
          {mode === "login"
            ? "New to Connectly?"
            : "Already have an account?"}{" "}
          <button type="button" onClick={switchMode}>
            {mode === "login" ? "Create account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}
