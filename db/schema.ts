import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pastes = sqliteTable("pastes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content").notNull(),
  passwordHash: text("password_hash"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pasteId: text("paste_id").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});