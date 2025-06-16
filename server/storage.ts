import { 
  players, sessions,
  type Player, type Session,
  type InsertPlayer, type InsertSession,
  type PlayerProfile
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Players
  getPlayer(playerName: string): Promise<Player | null>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(playerName: string, updates: Partial<Player>): Promise<Player>;
  
  // Sessions
  createSession(session: Omit<InsertSession, 'scores'>): Promise<Session>;
  getSessionsByPlayer(playerName: string): Promise<Session[]>;
  
  // Player profiles with ARM ratings
  getPlayerProfile(playerName: string): Promise<PlayerProfile | null>;
}

export class DatabaseStorage implements IStorage {
  async getPlayer(playerName: string): Promise<Player | null> {
    const [player] = await db.select().from(players).where(eq(players.name, playerName));
    return player || null;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async updatePlayer(playerName: string, updates: Partial<Player>): Promise<Player> {
    const [updatedPlayer] = await db
      .update(players)
      .set(updates)
      .where(eq(players.name, playerName))
      .returning();
    return updatedPlayer;
  }

  async createSession(session: Omit<InsertSession, 'scores'>): Promise<Session> {
    const sessionData = {
      ...session,
      sessionTotal: session.score1 + session.score2 + session.score3 + session.score4 + session.score5
    };
    const [newSession] = await db.insert(sessions).values(sessionData).returning();
    return newSession;
  }

  async getSessionsByPlayer(playerName: string): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.playerName, playerName))
      .orderBy(desc(sessions.submittedAt));
  }

  async getPlayerProfile(playerName: string): Promise<PlayerProfile | null> {
    const player = await this.getPlayer(playerName);
    if (!player) return null;

    const recentSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.playerName, playerName))
      .orderBy(desc(sessions.submittedAt))
      .limit(10);

    return {
      playerName: player.name,
      currentRating: player.currentRating,
      totalSessions: player.totalSessions,
      isProvisional: player.isProvisional,
      recentSessions,
    };
  }
}

export const storage = new DatabaseStorage();