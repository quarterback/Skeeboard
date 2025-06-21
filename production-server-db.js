import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to database successfully');
    release();
  }
});

// Basic middleware
app.use(express.json());
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get player profile
app.get('/api/players/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Get player data
    const playerResult = await pool.query(
      'SELECT * FROM players WHERE name = $1',
      [name]
    );
    
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const player = playerResult.rows[0];
    
    // Get recent sessions
    const sessionsResult = await pool.query(
      'SELECT * FROM sessions WHERE player_name = $1 ORDER BY submitted_at DESC LIMIT 10',
      [name]
    );
    
    res.json({
      playerName: player.name,
      currentRating: player.current_rating,
      totalSessions: player.total_sessions,
      isProvisional: player.is_provisional,
      recentSessions: sessionsResult.rows.map(session => ({
        scores: [session.score_1, session.score_2, session.score_3, session.score_4, session.score_5],
        sessionTotal: session.session_total,
        venueName: session.venue_name,
        armRating: session.arm_rating_after,
        armDelta: session.arm_delta,
        submittedAt: session.submitted_at
      }))
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player data' });
  }
});

// Submit session
app.post('/api/sessions', async (req, res) => {
  try {
    const { playerName, scores, venueName, cityName, notes, currentARMRating } = req.body;
    
    if (!playerName || !scores || scores.length !== 5 || !venueName || !cityName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sessionTotal = scores.reduce((sum, score) => sum + score, 0);
    
    // Check if player exists, create if not
    let playerResult = await pool.query(
      'SELECT * FROM players WHERE name = $1',
      [playerName]
    );
    
    let player;
    if (playerResult.rows.length === 0) {
      // Create new player
      const newPlayerResult = await pool.query(
        'INSERT INTO players (name, current_rating, total_sessions, is_provisional) VALUES ($1, $2, 0, true) RETURNING *',
        [playerName, currentARMRating || 10.0]
      );
      player = newPlayerResult.rows[0];
    } else {
      player = playerResult.rows[0];
    }
    
    // Simple ARM rating calculation
    const oldRating = player.current_rating;
    const expectedScore = 50 + (oldRating - 10) * 2; // Simple expectation formula
    const actualScore = sessionTotal;
    const kFactor = player.is_provisional ? 32 : 16;
    const ratingChange = (kFactor * (actualScore - expectedScore)) / 100;
    const newRating = Math.max(0, oldRating + ratingChange);
    
    // Insert session
    await pool.query(
      `INSERT INTO sessions (player_name, venue_name, city_name, score_1, score_2, score_3, score_4, score_5, 
       session_total, arm_rating_before, arm_rating_after, arm_delta, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [playerName, venueName, cityName, scores[0], scores[1], scores[2], scores[3], scores[4], 
       sessionTotal, oldRating, newRating, ratingChange, notes]
    );
    
    // Update player
    await pool.query(
      'UPDATE players SET current_rating = $1, total_sessions = total_sessions + 1, is_provisional = $2 WHERE name = $3',
      [newRating, player.total_sessions >= 9 ? false : player.is_provisional, playerName]
    );
    
    res.json({
      success: true,
      message: 'Session submitted successfully',
      armRating: newRating,
      armDelta: ratingChange
    });
  } catch (error) {
    console.error('Error submitting session:', error);
    res.status(500).json({ error: 'Failed to submit session' });
  }
});

// Get leaderboard
app.get('/api/leaderboard/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { filter, limit = 50 } = req.query;
    
    let query = 'SELECT name as "playerName", current_rating as "currentRating", total_sessions as "totalSessions", ROW_NUMBER() OVER (ORDER BY current_rating DESC) as rank FROM players';
    let params = [];
    
    if (type === 'state' && filter) {
      // Filter by state/city from recent sessions
      query = `SELECT DISTINCT p.name as "playerName", p.current_rating as "currentRating", p.total_sessions as "totalSessions",
               ROW_NUMBER() OVER (ORDER BY p.current_rating DESC) as rank 
               FROM players p 
               JOIN sessions s ON p.name = s.player_name 
               WHERE s.city_name ILIKE $1`;
      params = [`%${filter}%`];
    } else if (type === 'venue' && filter) {
      // Filter by venue
      query = `SELECT DISTINCT p.name as "playerName", p.current_rating as "currentRating", p.total_sessions as "totalSessions",
               ROW_NUMBER() OVER (ORDER BY p.current_rating DESC) as rank 
               FROM players p 
               JOIN sessions s ON p.name = s.player_name 
               WHERE s.venue_name ILIKE $1`;
      params = [`%${filter}%`];
    }
    
    query += ` ORDER BY "currentRating" DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});