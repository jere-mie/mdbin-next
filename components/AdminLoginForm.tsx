"use client";

import { useState } from "react";
import { adminLogin } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");

    const result = await adminLogin(password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="paste-page">
      <header className="paste-header">
        <Link href="/" className="logo">
          <span className="logo-mark">◈</span> mdbin
        </Link>
      </header>

      <div className="password-gate">
        <div className="lock-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="10" y="22" width="28" height="20" rx="4" />
            <path d="M16 22v-6a8 8 0 0116 0v6" />
            <circle cx="24" cy="33" r="2" fill="currentColor" />
          </svg>
        </div>
        <h2>Admin Access</h2>
        <p className="gate-subtitle">Enter the admin password to continue</p>

        <form onSubmit={handleSubmit} className="password-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="password-input"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="unlock-button"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Verifying...
              </>
            ) : (
              <>
                Login
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 7h8M8 4l3 3-3 3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5.5" />
              <path d="M7 4.5v3M7 9.5v.01" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
