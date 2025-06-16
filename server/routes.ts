import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema } from "@shared/schema";
import { z } from "zod";
import { expectedScoreForRating, calculateARMUpdate, getKFactor } from "../client/src/lib/arm-rating";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Submit a new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const result = insertSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid session data", details: result.error.issues });
      }

      const { scores, ...sessionData } = result.data;
      const sessionTotal = scores.reduce((sum, score) => sum + score, 0);

      // Get or create player
      let player = await storage.getPlayer(sessionData.playerName);
      if (!player) {
        player = await storage.createPlayer({
          name: sessionData.playerName,
          currentRating: 10.0,
          totalSessions: 0,
          isProvisional: true,
        });
      }

      // Calculate ARM rating updates
      let armRatingBefore = player.currentRating;
      let armRatingAfter = player.currentRating;
      let armDelta = 0;

      if (player.totalSessions >= 3 && player.isProvisional) {
        // Calculate initial rating from first 3 sessions
        const playerSessions = await storage.getSessionsByPlayer(player.name);
        const firstThreeTotals = playerSessions.slice(-2).map(s => s.sessionTotal).concat([sessionTotal]);
        const avgScore = firstThreeTotals.reduce((sum, total) => sum + total, 0) / 3;
        armRatingAfter = Math.max(7.0, Math.min(25.0, 7 + ((avgScore - 150) / 25)));
        armDelta = armRatingAfter - armRatingBefore;
        
        // Update player to non-provisional
        await storage.updatePlayer(player.name, {
          currentRating: armRatingAfter,
          totalSessions: player.totalSessions + 1,
          isProvisional: false,
        });
      } else if (!player.isProvisional) {
        // Update rating using ARM formula
        const kFactor = getKFactor(player.totalSessions);
        armRatingAfter = calculateARMUpdate(player.currentRating, sessionTotal, kFactor);
        armDelta = armRatingAfter - armRatingBefore;
        
        // Update player rating
        await storage.updatePlayer(player.name, {
          currentRating: armRatingAfter,
          totalSessions: player.totalSessions + 1,
        });
      } else {
        // Provisional player, just increment session count
        await storage.updatePlayer(player.name, {
          totalSessions: player.totalSessions + 1,
        });
      }

      // Create session record
      const session = await storage.createSession({
        ...sessionData,
        score1: scores[0],
        score2: scores[1],
        score3: scores[2],
        score4: scores[3],
        score5: scores[4],
        armRatingBefore,
        armRatingAfter,
        armDelta,
      });

      res.json({ 
        session,
        armRating: armRatingAfter,
        armDelta,
        isProvisional: player.isProvisional && player.totalSessions < 3
      });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Get player profile
  app.get("/api/players/:playerName", async (req, res) => {
    try {
      const profile = await storage.getPlayerProfile(req.params.playerName);
      if (!profile) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching player profile:", error);
      res.status(500).json({ error: "Failed to fetch player profile" });
    }
  });

  // Get player sessions
  app.get("/api/players/:playerName/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessionsByPlayer(req.params.playerName);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching player sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  return httpServer;
}