"use client";

import React from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";

export function SignInCard({ authError = null, next = "/admin" }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(authError);

  const onGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError("Authentication isn't configured yet. Add your Supabase keys to .env.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = next
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth/callback`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="if-auth">
      <div className="if-auth__card">
        <Link href="/" className="if-auth__brand">
          <span className="if-auth__badge">IF</span>
          <span>Iconic Faculty</span>
        </Link>

        <h1 className="if-auth__title">Admin Sign In</h1>
        <p className="if-auth__lead">
          Sign in with your authorized Google account to manage Iconic Faculty links &amp; analytics.
        </p>

        <button
          type="button"
          className="if-auth__google"
          onClick={onGoogle}
          disabled={loading}
        >
          {!loading && (
            <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.32z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
          )}
          {loading ? "Connecting…" : "Continue with Google"}
        </button>

        {error && <p className="if-auth__error" role="alert">{error}</p>}

        <div className="if-auth__foot">
          <Link href="/links">View public links →</Link>
        </div>
      </div>

      <style>{`
        .if-auth {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .if-auth__card {
          width: 100%;
          max-width: 420px;
          background: rgba(24, 4, 4, 0.78);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 36px 28px;
          text-align: center;
          backdrop-filter: blur(14px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
        }
        .if-auth__brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .if-auth__badge {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }
        .if-auth__title {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .if-auth__lead {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .if-auth__google {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: #fff;
          color: #111;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .if-auth__google:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(230, 57, 70, 0.25);
        }
        .if-auth__google:disabled {
          opacity: 0.7;
          cursor: wait;
        }
        .if-auth__error {
          margin-top: 16px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(230, 57, 70, 0.15);
          border: 1px solid rgba(230, 57, 70, 0.45);
          color: #ff9da5;
          font-size: 13px;
        }
        .if-auth__foot {
          margin-top: 22px;
          font-size: 13px;
        }
        .if-auth__foot a {
          color: var(--text-muted);
          text-decoration: none;
        }
        .if-auth__foot a:hover {
          color: var(--accent);
        }
      `}</style>
    </section>
  );
}
