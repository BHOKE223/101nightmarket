import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const magicTokensTable = pgTable("magic_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  type: text("type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MagicToken = typeof magicTokensTable.$inferSelect;
