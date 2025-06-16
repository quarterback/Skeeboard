import { pgTable, text, serial, integer, boolean, timestamp, varchar, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  currentRating: real("current_rating").default(10.0).notNull(),
  totalSessions: integer("total_sessions").default(0).notNull(),
  isProvisional: boolean("is_provisional").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  venueName: varchar("venue_name", { length: 200 }).notNull(),
  score1: integer("score_1").notNull(),
  score2: integer("score_2").notNull(),
  score3: integer("score_3").notNull(),
  score4: integer("score_4").notNull(),
  score5: integer("score_5").notNull(),
  sessionTotal: integer("session_total").notNull(),
  armRatingBefore: real("arm_rating_before"),
  armRatingAfter: real("arm_rating_after"),
  armDelta: real("arm_delta"),
  photoVerified: boolean("photo_verified").default(false).notNull(),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Insert schemas
export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  submittedAt: true,
  sessionTotal: true,
  armRatingBefore: true,
  armRatingAfter: true,
  armDelta: true,
}).extend({
  currentARMRating: z.number().min(7.0).max(25.0).optional(),
  scores: z.array(
    z.number()
      .min(0, "Score must be at least 0")
      .max(900, "Score cannot exceed 900")
      .refine((val) => val % 10 === 0, "Score must be in increments of 10")
  ).length(5),
});

// Types
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Additional types for API responses
export type PlayerProfile = {
  playerName: string;
  currentRating: number;
  totalSessions: number;
  isProvisional: boolean;
  recentSessions: Session[];
};
