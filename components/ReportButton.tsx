"use client";

import { useState } from "react";
import { reportPaste } from "@/app/admin/actions";

export default function ReportButton({ pasteId }: { pasteId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReport = async () => {
    setLoading(true);
    const result = await reportPaste(pasteId, reason);
    setLoading(false);
    if (!result.error) {
      setSubmitted(true);
      setShowForm(false);
    }
  };

  if (submitted) {
    return (
      <span className="report-submitted">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
        Reported
      </span>
    );
  }

  if (showForm) {
    return (
      <div className="report-form">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="report-input"
          maxLength={200}
          autoFocus
        />
        <button
          onClick={handleReport}
          disabled={loading}
          className="report-submit-btn"
        >
          {loading ? "Sending..." : "Submit"}
        </button>
        <button
          onClick={() => setShowForm(false)}
          className="report-cancel-btn"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="report-button"
      title="Report abuse"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2 1v10M2 2h7l-2 2.5L9 7H2" />
      </svg>
      Report
    </button>
  );
}
