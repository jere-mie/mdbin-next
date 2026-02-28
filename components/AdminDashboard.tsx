"use client";

import { useState, useEffect, useCallback } from "react";
import {
  adminGetAllPastes,
  adminGetReports,
  adminDeletePaste,
  adminDismissReport,
  adminViewPaste,
  adminLogout,
} from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "./MarkdownRenderer";

type Paste = {
  id: string;
  title: string | null;
  createdAt: string;
  expiresAt: string | null;
  isProtected: boolean;
  contentLength: number;
};

type Report = {
  reportId: number;
  pasteId: string;
  reason: string | null;
  reportedAt: string;
  pasteTitle: string | null;
  pasteExists: boolean;
};

type ViewedPaste = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  expiresAt: string | null;
  isProtected: boolean;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"pastes" | "reports">("reports");
  const [pastesList, setPastesList] = useState<Paste[]>([]);
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [viewedPaste, setViewedPaste] = useState<ViewedPaste | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pastesResult, reportsResult] = await Promise.all([
      adminGetAllPastes(),
      adminGetReports(),
    ]);

    if ("pastes" in pastesResult && pastesResult.pastes) setPastesList(pastesResult.pastes);
    if ("reports" in reportsResult && reportsResult.reports) setReportsList(reportsResult.reports);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete paste "${id}"? This cannot be undone.`)) return;
    setActionLoading(id);
    await adminDeletePaste(id);
    setPastesList((prev) => prev.filter((p) => p.id !== id));
    setReportsList((prev) => prev.filter((r) => r.pasteId !== id));
    if (viewedPaste?.id === id) setViewedPaste(null);
    setActionLoading(null);
  };

  const handleDismiss = async (reportId: number) => {
    setActionLoading(`report-${reportId}`);
    await adminDismissReport(reportId);
    setReportsList((prev) => prev.filter((r) => r.reportId !== reportId));
    setActionLoading(null);
  };

  const handleView = async (id: string) => {
    setActionLoading(`view-${id}`);
    const result = await adminViewPaste(id);
    if ("paste" in result && result.paste) {
      setViewedPaste(result.paste);
    }
    setActionLoading(null);
  };

  const handleLogout = async () => {
    await adminLogout();
    router.push("/");
  };

  if (viewedPaste) {
    return (
      <div className="admin-page">
        <header className="paste-header">
          <Link href="/" className="logo">
            <span className="logo-mark">◈</span> mdbin
          </Link>
          <div className="paste-actions">
            <button
              onClick={() => setViewedPaste(null)}
              className="copy-button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 7H3M6 4L3 7l3 3" />
              </svg>
              Back
            </button>
            <button
              onClick={() => handleDelete(viewedPaste.id)}
              className="admin-delete-btn"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2.5 4h9M5 4V2.5h4V4M3.5 4v7.5a1 1 0 001 1h5a1 1 0 001-1V4" />
              </svg>
              Delete
            </button>
            <a
              href={`/${viewedPaste.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="copy-button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 7.5v3a1 1 0 01-1 1H3.5a1 1 0 01-1-1V5a1 1 0 011-1H7M9 2h3v3M6.5 7.5L12 2" />
              </svg>
              Open
            </a>
          </div>
        </header>

        <div className="paste-meta">
          <h1 className="paste-title">{viewedPaste.title || "Untitled"}</h1>
          <div className="paste-info">
            <span>ID: {viewedPaste.id}</span>
            <span className="info-sep">·</span>
            <span>{formatDate(new Date(viewedPaste.createdAt))}</span>
            {viewedPaste.isProtected && (
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
          <MarkdownRenderer content={viewedPaste.content} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="paste-header">
        <Link href="/" className="logo">
          <span className="logo-mark">◈</span> mdbin
        </Link>
        <div className="paste-actions">
          <span className="admin-badge">Admin</span>
          <button onClick={handleLogout} className="admin-logout-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9.5 10l3-3-3-3M5.5 7h7" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "reports" ? "active" : ""}`}
          onClick={() => setTab("reports")}
        >
          Reports
          {reportsList.length > 0 && (
            <span className="tab-count">{reportsList.length}</span>
          )}
        </button>
        <button
          className={`admin-tab ${tab === "pastes" ? "active" : ""}`}
          onClick={() => setTab("pastes")}
        >
          All Pastes
          <span className="tab-count">{pastesList.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <span className="spinner" />
          Loading...
        </div>
      ) : tab === "reports" ? (
        <div className="admin-list">
          {reportsList.length === 0 ? (
            <div className="admin-empty">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="16" cy="16" r="12" />
                <path d="M12 20c1.5 1.5 6.5 1.5 8 0M11 12h.01M21 12h.01" />
              </svg>
              <p>No reports to review</p>
            </div>
          ) : (
            reportsList.map((r) => (
              <div key={r.reportId} className="admin-item report-item">
                <div className="admin-item-main">
                  <div className="admin-item-title">
                    <span className="report-flag">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2 1v10M2 2h7l-2 2.5L9 7H2" />
                      </svg>
                    </span>
                    {r.pasteTitle || r.pasteId}
                  </div>
                  <div className="admin-item-meta">
                    <span>Paste: {r.pasteId}</span>
                    <span className="info-sep">·</span>
                    <span>Reported: {formatDate(new Date(r.reportedAt))}</span>
                    {r.reason && (
                      <>
                        <span className="info-sep">·</span>
                        <span className="report-reason">"{r.reason}"</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button
                    onClick={() => handleView(r.pasteId)}
                    disabled={actionLoading === `view-${r.pasteId}`}
                    className="copy-button"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDismiss(r.reportId)}
                    disabled={actionLoading === `report-${r.reportId}`}
                    className="admin-dismiss-btn"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleDelete(r.pasteId)}
                    disabled={actionLoading === r.pasteId}
                    className="admin-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="admin-list">
          {pastesList.length === 0 ? (
            <div className="admin-empty">
              <p>No pastes yet</p>
            </div>
          ) : (
            pastesList.map((p) => (
              <div key={p.id} className="admin-item">
                <div className="admin-item-main">
                  <div className="admin-item-title">
                    {p.title || p.id}
                    {p.isProtected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" className="inline-icon">
                        <rect x="1.5" y="4.5" width="7" height="4.5" rx="1" />
                        <path d="M3 4.5V3a2 2 0 014 0v1.5" />
                      </svg>
                    )}
                  </div>
                  <div className="admin-item-meta">
                    <span>{p.id}</span>
                    <span className="info-sep">·</span>
                    <span>{formatDate(new Date(p.createdAt))}</span>
                    <span className="info-sep">·</span>
                    <span>{(p.contentLength / 1000).toFixed(1)}KB</span>
                    {p.expiresAt && (
                      <>
                        <span className="info-sep">·</span>
                        <span className="expires-badge">
                          Expires {formatDate(new Date(p.expiresAt))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button
                    onClick={() => handleView(p.id)}
                    disabled={actionLoading === `view-${p.id}`}
                    className="copy-button"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={actionLoading === p.id}
                    className="admin-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
