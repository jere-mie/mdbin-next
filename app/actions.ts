"use server";

import { db } from "@/db";
import { pastes } from "@/db/schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type CreatePasteState = {
  error?: string;
} | null;

export async function createPaste(
  _prevState: CreatePasteState,
  formData: FormData
): Promise<CreatePasteState> {
  const content = formData.get("content") as string;
  const title = formData.get("title") as string | null;
  const password = formData.get("password") as string | null;
  const expiration = formData.get("expiration") as string | null;

  if (!content?.trim()) {
    return { error: "Content cannot be empty." };
  }

  if (content.length > 500_000) {
    return { error: "Content exceeds maximum length (500KB)." };
  }

  const id = nanoid(10);
  let passwordHash: string | null = null;
  let expiresAt: Date | null = null;

  if (password?.trim()) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  if (expiration && expiration !== "never") {
    const now = Date.now();
    const durations: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "1d": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };
    if (durations[expiration]) {
      expiresAt = new Date(now + durations[expiration]);
    }
  }

  await db.insert(pastes).values({
    id,
    title: title?.trim() || null,
    content,
    passwordHash,
    expiresAt,
    createdAt: new Date(),
  });

  redirect(`/${id}?new=1`);
}

export type VerifyPasswordResult = {
  error?: string;
  content?: string;
  title?: string | null;
};

export async function verifyPassword(
  id: string,
  password: string
): Promise<VerifyPasswordResult> {
  const results = await db
    .select()
    .from(pastes)
    .where(eq(pastes.id, id));
  const paste = results[0];

  if (!paste || !paste.passwordHash) {
    return { error: "Paste not found." };
  }

  if (paste.expiresAt && paste.expiresAt < new Date()) {
    await db.delete(pastes).where(eq(pastes.id, id));
    return { error: "This paste has expired." };
  }

  const valid = await bcrypt.compare(password, paste.passwordHash);
  if (!valid) {
    return { error: "Incorrect password." };
  }

  return { content: paste.content, title: paste.title };
}
