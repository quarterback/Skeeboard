import { 
  cities, venues, sessions, skeecaptainApplications,
  type City, type Venue, type Session, type SkeecaptainApplication,
  type InsertCity, type InsertVenue, type InsertSession, type InsertSkeecaptainApplication,
  type LeaderboardEntry, type PlayerStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, or } from "drizzle-orm";

export interface IStorage {
  // Cities
  getCities(): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;
  
  // Venues
  getVenuesByCity(cityId: number): Promise<Venue[]>;
  getVenuesByState(state: string): Promise<Venue[]>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  
  // Sessions
  createSession(session: Omit<InsertSession, 'scores'> & { 
    score1: number; score2: number; score3: number; score4: number; score5: number; 
  }): Promise<Session>;
  getSessionsByPlayer(playerName: string): Promise<Session[]>;
  getSessionsByVenue(venueId: number): Promise<Session[]>;
  
  // Leaderboards
  getGlobalLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getStateLeaderboard(state: string, limit?: number): Promise<LeaderboardEntry[]>;
  getVenueLeaderboard(venueId: number, limit?: number): Promise<LeaderboardEntry[]>;
  
  // Player stats
  getPlayerStats(playerName: string): Promise<PlayerStats | null>;
  
  // Skeecaptain applications
  createSkeecaptainApplication(application: InsertSkeecaptainApplication): Promise<SkeecaptainApplication>;
  getSkeecaptainApplications(): Promise<SkeecaptainApplication[]>;
}

export class DatabaseStorage implements IStorage {
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.active, true));
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async getVenuesByCity(cityId: number): Promise<Venue[]> {
    return await db.select().from(venues).where(and(eq(venues.cityId, cityId), eq(venues.active, true)));
  }

  async getVenuesByState(state: string): Promise<Venue[]> {
    return await db.select({
      id: venues.id,
      name: venues.name,
      cityId: venues.cityId,
      address: venues.address,
      verified: venues.verified,
      active: venues.active,
    }).from(venues)
    .innerJoin(cities, eq(venues.cityId, cities.id))
    .where(and(eq(cities.state, state), eq(venues.active, true), eq(cities.active, true)));
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db.insert(venues).values(venue).returning();
    return newVenue;
  }

  async createSession(session: Omit<InsertSession, 'scores'> & { 
    score1: number; score2: number; score3: number; score4: number; score5: number; 
  }): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSessionsByPlayer(playerName: string): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.playerName, playerName)).orderBy(desc(sessions.submittedAt));
  }

  async getSessionsByVenue(venueId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.venueId, venueId)).orderBy(desc(sessions.submittedAt));
  }

  async getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const result = await db.select({
      playerName: sessions.playerName,
      rating: sql<number>`AVG(${sessions.calculatedRating})::int`,
      sessions: sql<number>`COUNT(*)::int`,
      venueName: venues.name,
      cityName: cities.name,
      state: cities.state,
    })
    .from(sessions)
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .innerJoin(cities, eq(venues.cityId, cities.id))
    .where(eq(sessions.approved, true))
    .groupBy(sessions.playerName, venues.name, cities.name, cities.state)
    .orderBy(sql`AVG(${sessions.calculatedRating}) DESC`)
    .limit(limit);

    return result.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getStateLeaderboard(state: string, limit = 50): Promise<LeaderboardEntry[]> {
    const result = await db.select({
      playerName: sessions.playerName,
      rating: sql<number>`AVG(${sessions.calculatedRating})::int`,
      sessions: sql<number>`COUNT(*)::int`,
      venueName: venues.name,
      cityName: cities.name,
      state: cities.state,
    })
    .from(sessions)
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .innerJoin(cities, eq(venues.cityId, cities.id))
    .where(and(eq(sessions.approved, true), eq(cities.state, state)))
    .groupBy(sessions.playerName, venues.name, cities.name, cities.state)
    .orderBy(sql`AVG(${sessions.calculatedRating}) DESC`)
    .limit(limit);

    return result.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getVenueLeaderboard(venueId: number, limit = 50): Promise<LeaderboardEntry[]> {
    const result = await db.select({
      playerName: sessions.playerName,
      rating: sql<number>`AVG(${sessions.calculatedRating})::int`,
      sessions: sql<number>`COUNT(*)::int`,
      venueName: venues.name,
      cityName: cities.name,
      state: cities.state,
    })
    .from(sessions)
    .innerJoin(venues, eq(sessions.venueId, venues.id))
    .innerJoin(cities, eq(venues.cityId, cities.id))
    .where(and(eq(sessions.approved, true), eq(sessions.venueId, venueId)))
    .groupBy(sessions.playerName, venues.name, cities.name, cities.state)
    .orderBy(sql`AVG(${sessions.calculatedRating}) DESC`)
    .limit(limit);

    return result.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getPlayerStats(playerName: string): Promise<PlayerStats | null> {
    const result = await db.select({
      playerName: sessions.playerName,
      totalSessions: sql<number>`COUNT(*)::int`,
      bestRating: sql<number>`MAX(${sessions.calculatedRating})::int`,
      averageRating: sql<number>`AVG(${sessions.calculatedRating})::int`,
      venuesPlayed: sql<number>`COUNT(DISTINCT ${sessions.venueId})::int`,
    })
    .from(sessions)
    .where(and(eq(sessions.playerName, playerName), eq(sessions.approved, true)))
    .groupBy(sessions.playerName);

    return result[0] || null;
  }

  async createSkeecaptainApplication(application: InsertSkeecaptainApplication): Promise<SkeecaptainApplication> {
    const [newApplication] = await db.insert(skeecaptainApplications).values(application).returning();
    return newApplication;
  }

  async getSkeecaptainApplications(): Promise<SkeecaptainApplication[]> {
    return await db.select().from(skeecaptainApplications).orderBy(desc(skeecaptainApplications.submittedAt));
  }
}

export const storage = new DatabaseStorage();
