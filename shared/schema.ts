import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for potential future features like progress tracking, authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Progress table to track user's memorization progress
export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  surahId: integer("surah_id").notNull(),
  verseNumber: integer("verse_number").notNull(),
  phase: integer("phase").notNull(),
  completed: boolean("completed").default(false),
  lastAccessed: text("last_accessed").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProgressSchema = createInsertSchema(progress).pick({
  userId: true,
  surahId: true,
  verseNumber: true,
  phase: true,
  completed: true,
  lastAccessed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;
