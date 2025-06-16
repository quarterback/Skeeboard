import { pgTable, text, serial, integer, boolean, timestamp, varchar, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  state: varchar("state", { length: 10 }).notNull(),
  skeecaptainEmail: varchar("skeecaptain_email", { length: 255 }),
  active: boolean("active").default(true).notNull(),
});

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  address: text("address"),
  arsRating: real("ars_rating"), // Alley Ranking Score 1.0-5.0 for difficulty
  totalSessions: integer("total_sessions").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  venueName: varchar("venue_name", { length: 200 }).notNull(), // Changed to freeform venue name
  score1: integer("score_1").notNull(),
  score2: integer("score_2").notNull(),
  score3: integer("score_3").notNull(),
  score4: integer("score_4").notNull(),
  score5: integer("score_5").notNull(),
  sessionTotal: integer("session_total").notNull(), // Sum of all 5 scores
  armRating: real("arm_rating"), // ARM rating after this session (7.0-25.0)
  armDelta: real("arm_delta"), // Change in rating from this session
  photoVerified: boolean("photo_verified").default(false).notNull(),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  approved: boolean("approved").default(true).notNull(),
});

export const skeecaptainApplications = pgTable("skeecaptain_applications", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 10 }).notNull(),
  venueList: text("venue_list").notNull(),
  experience: text("experience").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
});

// Relations
export const citiesRelations = relations(cities, ({ many }) => ({
  venues: many(venues),
}));

export const venuesRelations = relations(venues, ({ one }) => ({
  city: one(cities, {
    fields: [venues.cityId],
    references: [cities.id],
  }),
}));

// Insert schemas
export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
});

export const insertVenueSchema = createInsertSchema(venues).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  submittedAt: true,
  armRating: true,
  armDelta: true,
  sessionTotal: true,
}).extend({
  scores: z.array(z.number().min(0).max(1000)).length(5),
});

export const insertSkeecaptainApplicationSchema = createInsertSchema(skeecaptainApplications).omit({
  id: true,
  submittedAt: true,
  status: true,
});

// Types
export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type SkeecaptainApplication = typeof skeecaptainApplications.$inferSelect;
export type InsertSkeecaptainApplication = z.infer<typeof insertSkeecaptainApplicationSchema>;

// Additional types for API responses
export type LeaderboardEntry = {
  playerName: string;
  rating: number; // ARM rating
  sessions: number;
  venueName: string;
  cityName: string;
  state: string;
  rank: number;
};

export type PlayerStats = {
  playerName: string;
  totalSessions: number;
  bestRating: number; // Best ARM rating
  averageRating: number; // Average ARM rating
  venuesPlayed: number;
};
