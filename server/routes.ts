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

      const { scores, currentARMRating, ...sessionData } = result.data;
      const sessionTotal = scores.reduce((sum, score) => sum + score, 0);

      // Use provided ARM rating or default
      let armRatingBefore = currentARMRating || 10.0;
      
      // Calculate new ARM rating using your exact formula
      const armRatingAfter = calculateARMUpdate(armRatingBefore, sessionTotal, 0.15);
      const armDelta = armRatingAfter - armRatingBefore;

      // Get or create player
      let player = await storage.getPlayer(sessionData.playerName);
      if (!player) {
        player = await storage.createPlayer({
          name: sessionData.playerName,
          currentRating: armRatingAfter,
          totalSessions: 1,
          isProvisional: false,
        });
      } else {
        // Update player with new rating
        await storage.updatePlayer(player.name, {
          currentRating: armRatingAfter,
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