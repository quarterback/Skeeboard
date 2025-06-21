import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints (simplified for deployment)
app.get('/api/players/:name', (req, res) => {
  // Return mock data for now - user can add real API later
  res.json({
    playerName: req.params.name,
    currentRating: 15.2,
    totalSessions: 5,
    isProvisional: false,
    recentSessions: []
  });
});

app.post('/api/sessions', (req, res) => {
  // Mock session submission
  res.json({ 
    success: true, 
    message: 'Session submitted successfully',
    armRating: 15.5,
    armDelta: 0.3
  });
});

app.get('/api/leaderboard/:type', (req, res) => {
  // Mock leaderboard data
  res.json([
    { rank: 1, playerName: 'Player1', currentRating: 18.5, totalSessions: 25 },
    { rank: 2, playerName: 'Player2', currentRating: 17.8, totalSessions: 20 },
    { rank: 3, playerName: 'Player3', currentRating: 16.9, totalSessions: 18 }
  ]);
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