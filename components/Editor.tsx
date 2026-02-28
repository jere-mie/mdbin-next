"use client";

import { useActionState, useState, useRef } from "react";
import { createPaste, type CreatePasteState } from "@/app/actions";

export default function Editor() {
  const [state, formAction, isPending] = useActionState<CreatePasteState, FormData>(
    createPaste,
    null
  );
  const [content, setContent] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = content.split("\n").length;
  const charCount = content.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form action={formAction} className="editor-form">
      <input
        name="title"
        type="text"
        placeholder="Untitled paste…"
        className="title-input"
        autoComplete="off"
        spellCheck={false}
      />

      <div className="editor-container">
        <textarea
          ref={textareaRef}
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"# Hello World\n\nPaste or type your markdown here…"}
          className="editor-textarea"
          spellCheck={false}
          autoFocus
        />
        <div className="editor-status">
          <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
          <span className="status-sep">·</span>
          <span>{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      <div className="editor-controls">
        <button
          type="button"
          className="options-toggle"
          onClick={() => setShowOptions(!showOptions)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
          </svg>
          <span>Options</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`chevron ${showOptions ? "open" : ""}`}
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </button>

        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="share-button"
        >
          {isPending ? (
            <>
              <span className="spinner" />
              Creating…
            </>
          ) : (
            <>
              Share
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </>
          )}
        </button>
      </div>

      {showOptions && (
        <div className="options-panel">
          <div className="option-group">
            <label htmlFor="expiration">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="7" cy="7" r="5.5" />
                <path d="M7 4v3.5l2.5 1.5" />
              </svg>
              Expiration
            </label>
            <select name="expiration" id="expiration">
              <option value="never">Never</option>
              <option value="1h">1 hour</option>
              <option value="1d">1 day</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>

          <div className="option-group">
            <label htmlFor="password">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="2" y="6" width="10" height="6.5" rx="1.5" />
                <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" />
              </svg>
              Password
            </label>
            <input
              name="password"
              id="password"
              type="password"
              placeholder="Leave empty for public"
              autoComplete="new-password"
            />
          </div>
        </div>
      )}

      {state?.error && (
        <div className="error-message">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4.5v3M7 9.5v.01" />
          </svg>
          {state.error}
        </div>
      )}
    </form>
  );
}
