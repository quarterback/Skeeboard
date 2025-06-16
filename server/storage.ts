import { 
  players, sessions,
  type Player, type Session,
  type InsertPlayer, type InsertSession,
  type PlayerProfile
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, and, or } from "drizzle-orm";

export interface IStorage {
  // Cities
  getCities(): Promise<City[]>;
  createCity(city: InsertCity): Promise<City>;
  
  // Venues
  getVenuesByState(state: string): Promise<Venue[]>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  getOrCreateVenueByName(venueName: string, state: string): Promise<Venue>;
  
  // Sessions
  createSession(session: Omit<InsertSession, 'scores'>): Promise<Session>;
  getSessionsByPlayer(playerName: string): Promise<Session[]>;
  getSessionsByVenue(venueName: string): Promise<Session[]>;
  
  // ARM Leaderboards
  getGlobalLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getStateLeaderboard(state: string, limit?: number): Promise<LeaderboardEntry[]>;
  getVenueLeaderboard(venueName: string, limit?: number): Promise<LeaderboardEntry[]>;
  
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

  async getVenuesByState(state: string): Promise<Venue[]> {
    return await db.select({
      id: venues.id,
      name: venues.name,
      cityId: venues.cityId,
      address: venues.address,
      arsRating: venues.arsRating,
      totalSessions: venues.totalSessions,
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

  async getOrCreateVenueByName(venueName: string, state: string): Promise<Venue> {
    // Try to find existing venue with this name
    const existing = await db.select().from(venues)
      .innerJoin(cities, eq(venues.cityId, cities.id))
      .where(and(eq(venues.name, venueName), eq(cities.state, state)))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].venues;
    }

    // Create new venue - find or create a default city for this state
    let city = await db.select().from(cities)
      .where(and(eq(cities.state, state), eq(cities.active, true)))
      .limit(1);

    if (city.length === 0) {
      // Create a default city for this state
      const [newCity] = await db.insert(cities).values({
        name: `${state} Region`,
        state: state,
        active: true,
      }).returning();
      city = [newCity];
    }

    const [newVenue] = await db.insert(venues).values({
      name: venueName,
      cityId: city[0].id,
      active: true,
      verified: false,
      totalSessions: 0,
    }).returning();

    return newVenue;
  }

  async createSession(session: Omit<InsertSession, 'scores'>): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSessionsByPlayer(playerName: string): Promise<Session[]> {
    return await db.select().from(sessions)
      .where(eq(sessions.playerName, playerName))
      .orderBy(desc(sessions.submittedAt));
  }

  async getSessionsByVenue(venueName: string): Promise<Session[]> {
    return await db.select().from(sessions)
      .where(eq(sessions.venueName, venueName))
      .orderBy(desc(sessions.submittedAt));
  }

  async getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    // Get most recent ARM rating for each player
    const result = await db.select({
      playerName: sessions.playerName,
      rating: sql<number>`
        (SELECT s2.arm_rating 
         FROM ${sessions} s2 
         WHERE s2.player_name = ${sessions.playerName} 
           AND s2.arm_rating IS NOT NULL 
         ORDER BY s2.submitted_at DESC 
         LIMIT 1)::real`,
      sessions: sql<number>`COUNT(*)::int`,
      venueName: sql<string>`
        (SELECT s3.venue_name 
         FROM ${sessions} s3 
         WHERE s3.player_name = ${sessions.playerName} 
         ORDER BY s3.submitted_at DESC 
         LIMIT 1)`,
      cityName: sql<string>`'Global'`,
      state: sql<string>`'ALL'`,
    })
    .from(sessions)
    .where(and(eq(sessions.approved, true), sql`${sessions.armRating} IS NOT NULL`))
    .groupBy(sessions.playerName)
    .having(sql`COUNT(*) >= 3`) // Only show players with 3+ sessions
    .orderBy(sql`
      (SELECT s2.arm_rating 
       FROM ${sessions} s2 
       WHERE s2.player_name = ${sessions.playerName} 
         AND s2.arm_rating IS NOT NULL 
       ORDER BY s2.submitted_at DESC 
       LIMIT 1) DESC`)
    .limit(limit);

    return result.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getStateLeaderboard(state: string, limit = 50): Promise<LeaderboardEntry[]> {
    // For state leaderboards, we'll use venue names that contain state info
    const result = await db.select({
      playerName: sessions.playerName,
      rating: sql<number>`
        (SELECT s2.arm_rating 
         FROM ${sessions} s2 
         WHERE s2.player_name = ${sessions.playerName} 
           AND s2.arm_rating IS NOT NULL 
         ORDER BY s2.submitted_at DESC 
         LIMIT 1)::real`,
      sessions: sql<number>`COUNT(*)::int`,
      venueName: sql<string>`
        (SELECT s3.venue_name 
         FROM ${sessions} s3 
         WHERE s3.player_name = ${sessions.playerName} 
         ORDER BY s3.submitted_at DESC 
         LIMIT 1)`,
      cityName: sql<string>`'Region'`,
      state: sql<string>`'${state}'`,
    })
    .from(sessions)
    .where(and(
      eq(sessions.approved, true), 
      sql`${sessions.armRating} IS NOT NULL`,
      // For now, assume venue names or we can filter by state later
      sql`1=1`
    ))
    .groupBy(sessions.playerName)
    .having(sql`COUNT(*) >= 3`)
    .orderBy(sql`
      (SELECT s2.arm_rating 
       FROM ${sessions} s2 
       WHERE s2.player_name = ${sessions.playerName} 
         AND s2.arm_rating IS NOT NULL 
       ORDER BY s2.submitted_at DESC 
       LIMIT 1) DESC`)
    .limit(limit);

    return result.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getVenueLeaderboard(venueName: string, limit = 50): Promise<LeaderboardEntry[]> {
    const result = await db.select({
      playerName: sessions.playerName,
      rating: sql<number>`
        (SELECT s2.arm_rating 
         FROM ${sessions} s2 
         WHERE s2.player_name = ${sessions.playerName} 
           AND s2.venue_name = ${venueName}
           AND s2.arm_rating IS NOT NULL 
         ORDER BY s2.submitted_at DESC 
         LIMIT 1)::real`,
      sessions: sql<number>`COUNT(*)::int`,
      venueName: sql<string>`${venueName}`,
      cityName: sql<string>`'Local'`,
      state: sql<string>`'--'`,
    })
    .from(sessions)
    .where(and(
      eq(sessions.approved, true), 
      eq(sessions.venueName, venueName),
      sql`${sessions.armRating} IS NOT NULL`
    ))
    .groupBy(sessions.playerName)
    .having(sql`COUNT(*) >= 3`)
    .orderBy(sql`
      (SELECT s2.arm_rating 
       FROM ${sessions} s2 
       WHERE s2.player_name = ${sessions.playerName} 
         AND s2.venue_name = ${venueName}
         AND s2.arm_rating IS NOT NULL 
       ORDER BY s2.submitted_at DESC 
       LIMIT 1) DESC`)
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
      bestRating: sql<number>`MAX(${sessions.armRating})::real`,
      averageRating: sql<number>`AVG(${sessions.armRating})::real`,
      venuesPlayed: sql<number>`COUNT(DISTINCT ${sessions.venueName})::int`,
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
