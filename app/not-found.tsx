import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container">
      <div className="not-found">
        <div className="not-found-code">404</div>
        <h2>Paste not found</h2>
        <p>This paste may have expired, been deleted, or never existed.</p>
        <Link href="/" className="not-found-link">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 7H3M6 4L3 7l3 3" />
          </svg>
          Create a new paste
        </Link>
      </div>
    </main>
  );
}
