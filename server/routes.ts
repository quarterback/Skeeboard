import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertSkeecaptainApplicationSchema, insertVenueSchema } from "@shared/schema";
import { z } from "zod";

function calculateRating(scores: number[]): number {
  const validScores = scores.filter(score => score > 0);
  if (validScores.length < 3) return 0;
  
  const sorted = [...validScores].sort((a, b) => b - a);
  const middleThree = sorted.slice(1, 4);
  return Math.round(middleThree.reduce((sum, score) => sum + score, 0) / 3);
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
      
      const calculatedRating = calculateRating(scores);
      
      // Check for suspicious scores (all perfect, all the same, etc.)
      const allPerfect = scores.every(score => score >= 900);
      const allSame = scores.every(score => score === scores[0]);
      const suspicious = allPerfect || allSame;
      
      const session = await storage.createSession({
        ...sessionData,
        score1: scores[0],
        score2: scores[1],
        score3: scores[2],
        score4: scores[3],
        score5: scores[4],
        calculatedRating,
        approved: !suspicious, // Auto-approve unless suspicious
      });
      
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
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
  app.get("/api/leaderboard/venue/:venueId", async (req, res) => {
    try {
      const venueId = parseInt(req.params.venueId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const leaderboard = await storage.getVenueLeaderboard(venueId, limit);
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
