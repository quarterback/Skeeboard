import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { expectedScoreForRating, calculateARMUpdate, getKFactor } from "../client/src/lib/arm-rating";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Calculate ARM rating (no storage)
  app.post("/api/calculate-arm", async (req, res) => {
    try {
      const calculatorSchema = z.object({
        currentARMRating: z.number().min(7.0).max(25.0).optional(),
        scores: z.array(z.number().min(0).max(900)).length(5),
      });

      const result = calculatorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error.issues });
      }

      const { scores, currentARMRating } = result.data;
      const sessionTotal = scores.reduce((sum: number, score: number) => sum + score, 0);

      // Use provided ARM rating or default to 7.0 for new players
      const armRatingBefore = currentARMRating || 7.0;
      
      // Calculate new ARM rating using your exact formula
      const armRatingAfter = calculateARMUpdate(armRatingBefore, sessionTotal, 0.15);
      const armDelta = armRatingAfter - armRatingBefore;

      res.json({ 
        armRating: armRatingAfter,
        armDelta,
        sessionTotal
      });
    } catch (error) {
      console.error("Error calculating ARM rating:", error);
      res.status(500).json({ error: "Failed to calculate ARM rating" });
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