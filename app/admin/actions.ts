"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { pastes, reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const ADMIN_COOKIE = "mdbin_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

function getAdminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD environment variable is not set.");
  return pw;
}

export async function adminLogin(password: string): Promise<{ error?: string }> {
  if (password !== getAdminPassword()) {
    return { error: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return {};
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    getAdminPassword(); // ensure env var exists
  } catch {
    return false;
  }
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function adminGetAllPastes() {
  const authed = await isAdminAuthenticated();
  if (!authed) return { error: "Unauthorized" as const };

  const allPastes = await db
    .select({
      id: pastes.id,
      title: pastes.title,
      createdAt: pastes.createdAt,
      expiresAt: pastes.expiresAt,
      isProtected: pastes.passwordHash,
      contentLength: pastes.content,
    })
    .from(pastes)
    .orderBy(desc(pastes.createdAt));

  return {
    pastes: allPastes.map((p) => ({
      id: p.id,
      title: p.title,
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt?.toISOString() ?? null,
      isProtected: !!p.isProtected,
      contentLength: p.contentLength.length,
    })),
  };
}

export async function adminDeletePaste(id: string): Promise<{ error?: string }> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { error: "Unauthorized" };

  await db.delete(reports).where(eq(reports.pasteId, id));
  await db.delete(pastes).where(eq(pastes.id, id));
  return {};
}

export async function adminGetReports() {
  const authed = await isAdminAuthenticated();
  if (!authed) return { error: "Unauthorized" as const };

  const allReports = await db
    .select({
      reportId: reports.id,
      pasteId: reports.pasteId,
      reason: reports.reason,
      reportedAt: reports.createdAt,
      pasteTitle: pastes.title,
    })
    .from(reports)
    .leftJoin(pastes, eq(reports.pasteId, pastes.id))
    .orderBy(desc(reports.createdAt));

  return {
    reports: allReports.map((r) => ({
      reportId: r.reportId,
      pasteId: r.pasteId,
      reason: r.reason,
      reportedAt: r.reportedAt.toISOString(),
      pasteTitle: r.pasteTitle,
      pasteExists: r.pasteTitle !== undefined,
    })),
  };
}

export async function adminDismissReport(reportId: number): Promise<{ error?: string }> {
  const authed = await isAdminAuthenticated();
  if (!authed) return { error: "Unauthorized" };

  await db.delete(reports).where(eq(reports.id, reportId));
  return {};
}

export async function adminViewPaste(id: string) {
  const authed = await isAdminAuthenticated();
  if (!authed) return { error: "Unauthorized" as const };

  const results = await db.select().from(pastes).where(eq(pastes.id, id));
  const paste = results[0];
  if (!paste) return { error: "Paste not found" as const };

  return {
    paste: {
      id: paste.id,
      title: paste.title,
      content: paste.content,
      createdAt: paste.createdAt.toISOString(),
      expiresAt: paste.expiresAt?.toISOString() ?? null,
      isProtected: !!paste.passwordHash,
    },
  };
}

export async function reportPaste(
  pasteId: string,
  reason: string
): Promise<{ error?: string }> {
  // Check paste exists
  const results = await db
    .select({ id: pastes.id })
    .from(pastes)
    .where(eq(pastes.id, pasteId));
  if (!results[0]) return { error: "Paste not found." };

  await db.insert(reports).values({
    pasteId,
    reason: reason.trim() || null,
    createdAt: new Date(),
  });

  return {};
}
