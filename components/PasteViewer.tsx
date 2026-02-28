"use client";

import { useState, useEffect } from "react";
import { verifyPassword } from "@/app/actions";
import MarkdownRenderer from "./MarkdownRenderer";
import CopyButton from "./CopyButton";
import ReportButton from "./ReportButton";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function timeRemaining(date: Date) {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days}d remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return `${mins}m remaining`;
}

type Props = {
  id: string;
  title: string | null;
  content?: string;
  isProtected?: boolean;
  createdAt: string;
  expiresAt: string | null;
  isNew?: boolean;
};

export default function PasteViewer({
  id,
  title,
  content: initialContent,
  isProtected,
  createdAt,
  expiresAt,
  isNew,
}: Props) {
  const [content, setContent] = useState<string | null>(initialContent ?? null);
  const [resolvedTitle, setResolvedTitle] = useState(title);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [showNewBanner, setShowNewBanner] = useState(!!isNew);

  const created = new Date(createdAt);
  const expires = expiresAt ? new Date(expiresAt) : null;

  // Auto-copy URL for newly created pastes
  useEffect(() => {
    if (isNew && typeof window !== "undefined") {
      const cleanUrl = window.location.origin + window.location.pathname;
      navigator.clipboard.writeText(cleanUrl).catch(() => {});
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [isNew]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await verifyPassword(id, password);
      if (result.error) {
        setError(result.error);
      } else {
        setContent(result.content ?? null);
        setResolvedTitle(result.title ?? null);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Password gate
  if (isProtected && content === null) {
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
          <h2>This paste is protected</h2>
          <p className="gate-subtitle">Enter the password to view the contents</p>

          <form onSubmit={handlePasswordSubmit} className="password-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
                  Verifying…
                </>
              ) : (
                <>
                  Unlock
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

  return (
    <div className="paste-page">
      {showNewBanner && (
        <div className="new-banner">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7.5l3 3 5-6" />
          </svg>
          Paste created - link copied to clipboard
          <button
            className="banner-dismiss"
            onClick={() => setShowNewBanner(false)}
          >
            ×
          </button>
        </div>
      )}

      <header className="paste-header">
        <Link href="/" className="logo">
          <span className="logo-mark">◈</span> mdbin
        </Link>

        <div className="paste-actions">
          <CopyButton
            text={typeof window !== "undefined" ? window.location.href : ""}
            label="Copy link"
            successLabel="Copied!"
          />
          {content && (
            <CopyButton
              text={content}
              label="Copy raw"
              successLabel="Copied!"
            />
          )}
          <button
            type="button"
            className={`toggle-raw ${showRaw ? "active" : ""}`}
            onClick={() => setShowRaw(!showRaw)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M4.5 3L1.5 7l3 4M9.5 3l3 4-3 4" />
            </svg>
            {showRaw ? "Preview" : "Source"}
          </button>
          <Link href="/" className="new-paste-button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2v10M2 7h10" />
            </svg>
            New
          </Link>
        </div>
      </header>

      <div className="paste-meta">
        <h1 className="paste-title">{resolvedTitle || title || "Untitled"}</h1>
        <div className="paste-info">
          <span>{formatDate(created)}</span>
          {expires && (
            <>
              <span className="info-sep">·</span>
              <span className="expires-badge">{timeRemaining(expires)}</span>
            </>
          )}
          {isProtected && (
            <>
              <span className="info-sep">·</span>
              <span className="protected-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="1.5" y="4.5" width="7" height="4.5" rx="1" />
                  <path d="M3 4.5V3a2 2 0 014 0v1.5" />
                </svg>
                Protected
              </span>
            </>
          )}
        </div>
      </div>

      <div className="paste-content">
        {content && (
          showRaw ? (
            <pre className="raw-content"><code>{content}</code></pre>
          ) : (
            <MarkdownRenderer content={content} />
          )
        )}
      </div>

      <div className="paste-footer">
        <ReportButton pasteId={id} />
      </div>
    </div>
  );
}
