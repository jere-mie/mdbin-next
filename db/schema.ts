import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const temp = sqliteTable("temp", {
    id: int("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
});