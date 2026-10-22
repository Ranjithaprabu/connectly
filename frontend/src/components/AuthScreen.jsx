
import { useState } from "react";
import "./AuthScreen.css";
import {
  MessageCircle,
  LoaderCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { request } from "../api/client";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isLogin = mode === "login";

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (!isLogin) {
        const data = await request("/api/auth/register", null, {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        });

        setMode("login");
        setName("");
        setPassword("");
        setShowPassword(false);

        setNotice(
          data.message || "Account created successfully. Please sign in."
        );
      } else {
        const data = await request("/api/auth/login", null, {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        onLogin(data);
      }
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
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
    setPassword("");
    setShowPassword(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">
          <MessageCircle size={25} strokeWidth={2.2} />
        </div>

      

        <div className="auth-heading">
          <h2>
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>

          <p>
            {isLogin
              ? "Sign in to pick up where you left off."
              : "Join Connectly and start a conversation."}
          </p>
        </div>

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="alert success" role="status">
            {notice}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {!isLogin && (
            <div className="input-field">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                aria-label="Full name"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="input-field">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              required
            />
          </div>

          <div className="input-field password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              aria-label="Password"
              autoComplete={
                isLogin ? "current-password" : "new-password"
              }
              minLength={8}
              maxLength={72}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={busy}
          >
            {busy ? (
              <>
                <LoaderCircle className="spin" size={18} />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                {isLogin ? "Sign in" : "Create account"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            {isLogin
              ? "New to Connectly?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={switchMode}
            disabled={busy}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </div>

        <p className="auth-legal">
          Your conversations begin with a connection.
        </p>
      </section>
    </main>
  );
}
