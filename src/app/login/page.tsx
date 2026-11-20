"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PASSWORD_RULES =
  "At least 8 characters, with an uppercase letter, a lowercase letter and a number.";

// Returns an error message, or '' if the password is OK.
function checkPassword(password: string, confirm: string) {
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return `Password must have: ${PASSWORD_RULES.toLowerCase()}`;
  }
  if (password !== confirm) return "Passwords do not match.";
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (isSignUp) {
      const problem = checkPassword(password, confirm);
      if (problem) return setMessage(problem);
    }

    setSubmitting(true);
    setMessage("");
    const supabase = createClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setSubmitting(false);
      if (error) return setMessage(error.message);
      // No session means Supabase wants the user to confirm their email first.
      if (!data.session)
        return setMessage(
          "Check your email to confirm your account, then sign in.",
        );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setSubmitting(false);
      if (error) return setMessage(error.message);
    }

    // Only allow redirects inside this site.
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(
      next?.startsWith("/") && !next.startsWith("//") ? next : "/Home",
    );
    router.refresh();
  }

  return (
    <main className="hero login-hero">
      <h1>Toy Library</h1>
      <h2 className="login-subtitle">
        {isSignUp ? "Join the Toy Library" : "Welcome Back"}
      </h2>
      <p>
        {isSignUp
          ? "Create an account to borrow toys."
          : "Log in to borrow our adapted toys."}
      </p>

      <form onSubmit={onSubmit} className="login-form">
        <input
          type="email"
          required
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Password"
          aria-label="Password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isSignUp && (
          <>
            <input
              type="password"
              required
              placeholder="Confirm password"
              aria-label="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {confirm && (
              <p
                className={`password-match ${password === confirm ? "ok" : "bad"}`}
              >
                {password === confirm
                  ? "Passwords match"
                  : "Passwords don’t match"}
              </p>
            )}
            <p className="login-message">{PASSWORD_RULES}</p>
          </>
        )}

        {message && <p className="login-message">{message}</p>}

        <button
          className="btn btn-primary btn-pill"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Please wait…" : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p className="login-switch">
        {isSignUp ? "Already have an account? " : "New here? "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? "signin" : "signup");
            setMessage("");
            setConfirm("");
          }}
        >
          {isSignUp ? "Log in" : "Create an account"}
        </button>
      </p>
    </main>
  );
}
