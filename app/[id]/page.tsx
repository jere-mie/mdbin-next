import { db } from "@/db";
import { pastes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import PasteViewer from "@/components/PasteViewer";
import type { Metadata } from "next";

function deriveTitle(title: string | null, content: string | null): string {
  if (title?.trim()) return title.trim();
  if (!content) return "Untitled paste";
  // Strip markdown syntax and grab first meaningful line
  const cleaned = content
    .replace(/^#+\s*/gm, "")
    .replace(/[*_~`>\-]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
  const firstLine = cleaned.split("\n").find((l) => l.trim())?.trim() ?? "";
  if (!firstLine) return "Untitled paste";
  return firstLine.length > 50 ? firstLine.slice(0, 50) + "..." : firstLine;
}

function deriveDescription(content: string | null, isProtected: boolean): string {
  if (isProtected) return "This paste is password-protected on mdbin.";
  if (!content) return "A shared markdown paste on mdbin.";
  const plain = content
    .replace(/^#+\s*/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/[*_~>\-#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
  if (!plain) return "A shared markdown paste on mdbin.";
  return plain.length > 160 ? plain.slice(0, 160) + "..." : plain;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const results = await db
    .select({
      title: pastes.title,
      content: pastes.content,
      passwordHash: pastes.passwordHash,
    })
    .from(pastes)
    .where(eq(pastes.id, id));
  const paste = results[0];

  if (!paste) {
    return {
      title: "Paste not found - mdbin",
      description: "This paste may have expired or been deleted.",
    };
  }

  const isProtected = !!paste.passwordHash;
  const titleText = deriveTitle(paste.title, isProtected ? null : paste.content);
  const description = deriveDescription(isProtected ? null : paste.content, isProtected);
  const pageTitle = `${titleText} - mdbin`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "article",
      siteName: "mdbin",
    },
    twitter: {
      card: "summary",
      title: pageTitle,
      description,
    },
  };
}

export default async function PastePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const results = await db.select().from(pastes).where(eq(pastes.id, id));
  const paste = results[0];

  if (!paste) {
    notFound();
  }

  // Check expiration - delete if expired
  if (paste.expiresAt && paste.expiresAt < new Date()) {
    await db.delete(pastes).where(eq(pastes.id, id));
    notFound();
  }

  const isProtected = !!paste.passwordHash;

  const displayTitle = deriveTitle(paste.title, isProtected ? null : paste.content);

  return (
    <main className="page-container">
      <PasteViewer
        id={id}
        title={displayTitle}
        content={isProtected ? undefined : paste.content}
        isProtected={isProtected}
        createdAt={paste.createdAt.toISOString()}
        expiresAt={paste.expiresAt?.toISOString() ?? null}
        isNew={sp.new === "1"}
      />
    </main>
  );
}
