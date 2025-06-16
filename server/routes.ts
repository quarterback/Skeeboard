import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertSkeecaptainApplicationSchema, insertVenueSchema } from "@shared/schema";
import { z } from "zod";

// ARM Rating System Functions
function expectedScoreForRating(armRating: number): number {
  return (armRating - 7) * 25 + 150;
}

function calculateARMUpdate(currentRating: number, sessionTotal: number, K: number = 0.15): number {
  const expected = expectedScoreForRating(currentRating);
  const delta = (sessionTotal - expected) / 100;
  return Math.round((currentRating + K * delta) * 10) / 10; // Round to 1 decimal place
}

function getInitialARMRating(sessionTotals: number[]): number {
  const avgScore = sessionTotals.reduce((sum, score) => sum + score, 0) / sessionTotals.length;
  const baseRating = 7 + ((avgScore - 150) / 25);
  return Math.max(7.0, Math.min(25.0, Math.round(baseRating * 10) / 10));
}

function getKFactor(totalSessions: number): number {
  if (totalSessions < 10) return 0.20;
  if (totalSessions < 25) return 0.15;
  if (totalSessions < 50) return 0.10;
  return 0.08;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cities
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Get venues by state
  app.get("/api/venues/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const venues = await storage.getVenuesByState(state);
      res.json(venues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch venues" });
    }
  });

  // Submit new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const { scores, ...sessionData } = validatedData;
      
      const sessionTotal = scores.reduce((sum: number, score: number) => sum + score, 0);
      
      // Check for suspicious scores (all perfect, all the same, etc.)
      const allPerfect = scores.every((score: number) => score >= 900);
      const allSame = scores.every((score: number) => score === scores[0]);
      const suspicious = allPerfect || allSame;
      
      // Get player's existing sessions to calculate ARM rating
      const existingSessions = await storage.getSessionsByPlayer(sessionData.playerName);
      const totalSessions = existingSessions.length;
      
      let armRating: number | null = null;
      let armDelta: number | null = null;
      
      if (totalSessions === 0) {
        // First session - start provisional
        armRating = 10.0; // Start at middle rating
      } else if (totalSessions >= 2) {
        // Calculate ARM rating after 3+ sessions
        if (totalSessions === 2) {
          // Third session - calculate initial rating from first 3 sessions
          const firstThree = [
            ...existingSessions.slice(0, 2).map(s => s.sessionTotal),
            sessionTotal
          ];
          armRating = getInitialARMRating(firstThree);
          armDelta = armRating - 10.0; // Delta from initial provisional
        } else {
          // Update existing rating
          const currentRating = existingSessions[0].armRating || 10.0;
          const kFactor = getKFactor(totalSessions);
          armRating = calculateARMUpdate(currentRating, sessionTotal, kFactor);
          armDelta = armRating - currentRating;
        }
      }
      
      const session = await storage.createSession({
        ...sessionData,
        score1: scores[0],
        score2: scores[1],
        score3: scores[2],
        score4: scores[3],
        score5: scores[4],
        sessionTotal,
        armRating,
        armDelta,
        approved: !suspicious, // Auto-approve unless suspicious
      });
      
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        console.error("Session creation error:", error);
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });

  // Get global leaderboard
  app.get("/api/leaderboard/global", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const leaderboard = await storage.getGlobalLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch global leaderboard" });
    }
  });

  // Get state leaderboard
  app.get("/api/leaderboard/state/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const leaderboard = await storage.getStateLeaderboard(state, limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch state leaderboard" });
    }
  });

  // Get venue leaderboard
  app.get("/api/leaderboard/venue/:venueName", async (req, res) => {
    try {
      const { venueName } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const leaderboard = await storage.getVenueLeaderboard(decodeURIComponent(venueName), limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch venue leaderboard" });
    }
  });

  // Get player stats
  app.get("/api/player/:playerName", async (req, res) => {
    try {
      const { playerName } = req.params;
      const stats = await storage.getPlayerStats(playerName);
      if (!stats) {
        res.status(404).json({ message: "Player not found" });
      } else {
        res.json(stats);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player stats" });
    }
  });

  // Submit skeecaptain application
  app.post("/api/skeecaptain/apply", async (req, res) => {
    try {
      const validatedData = insertSkeecaptainApplicationSchema.parse(req.body);
      const application = await storage.createSkeecaptainApplication(validatedData);
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid application data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit application" });
      }
    }
  });

  // Add new venue (for skeecaptains)
  app.post("/api/venues", async (req, res) => {
    try {
      const validatedData = insertVenueSchema.parse(req.body);
      const venue = await storage.createVenue(validatedData);
      res.json(venue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid venue data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create venue" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
