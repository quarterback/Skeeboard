#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Creating GitHub-ready deployment package...');

// Clean and create dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Create a complete working HTML file with embedded app
const completeApp = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alley Roller Mastery Calculator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Courier New', monospace; 
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); 
            color: #00ff00; 
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { 
            text-align: center; 
            font-size: 3rem; 
            margin-bottom: 2rem;
            text-shadow: 0 0 20px #00ff00;
            animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
            from { text-shadow: 0 0 20px #00ff00; }
            to { text-shadow: 0 0 30px #00ff00, 0 0 40px #00aa00; }
        }
        .card {
            background: rgba(26, 26, 46, 0.8);
            border: 2px solid #00ff00;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        }
        .form-group { margin-bottom: 1.5rem; }
        label { 
            display: block; 
            margin-bottom: 0.5rem; 
            color: #00cccc;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9rem;
        }
        input, textarea, button { 
            width: 100%; 
            padding: 15px; 
            background: #0f0f0f; 
            border: 2px solid #333; 
            color: #00ff00; 
            font-family: inherit;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }
        input:focus, textarea:focus { 
            border-color: #00ff00; 
            outline: none; 
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }
        .scores { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
            gap: 15px; 
        }
        .score-input {
            text-align: center;
            font-weight: bold;
        }
        button { 
            background: linear-gradient(45deg, #003300, #006600); 
            border-color: #00ff00; 
            cursor: pointer; 
            font-weight: bold;
            text-transform: uppercase;
            font-size: 1.1rem;
            margin-top: 20px;
        }
        button:hover { 
            background: linear-gradient(45deg, #00ff00, #00cc00); 
            color: #000; 
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 0, 0.4);
        }
        .result { 
            margin-top: 2rem; 
            padding: 2rem; 
            background: linear-gradient(45deg, #1a1a2e, #16213e);
            border: 2px solid #00ff00;
            border-radius: 12px;
            animation: slideIn 0.5s ease-out;
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .rating-display {
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-shadow: 0 0 10px #00ff00;
        }
        .error { color: #ff4444; }
        .success { color: #00ff00; }
        .info { color: #00cccc; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-item {
            text-align: center;
            padding: 15px;
            background: rgba(0, 255, 0, 0.1);
            border-radius: 8px;
        }
        .pixel-border {
            position: relative;
            overflow: hidden;
        }
        .pixel-border::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                linear-gradient(90deg, #00ff00 50%, transparent 50%),
                linear-gradient(#00ff00 50%, transparent 50%);
            background-size: 4px 4px;
            opacity: 0.1;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎳 ALLEY ROLLER MASTERY 🎳</h1>
        
        <div class="card pixel-border">
            <h2 class="info">SUBMIT YOUR SESSION</h2>
            <form id="sessionForm">
                <div class="form-group">
                    <label for="playerName">Player Name:</label>
                    <input type="text" id="playerName" required placeholder="Enter your player name">
                </div>
                
                <div class="form-group">
                    <label for="venueName">Venue Name:</label>
                    <input type="text" id="venueName" required placeholder="Where did you play?">
                </div>
                
                <div class="form-group">
                    <label for="cityName">City:</label>
                    <input type="text" id="cityName" required placeholder="City location">
                </div>
                
                <div class="form-group">
                    <label>Frame Scores (0-30 each):</label>
                    <div class="scores">
                        <input type="number" id="score1" class="score-input" placeholder="Frame 1" min="0" max="30" required>
                        <input type="number" id="score2" class="score-input" placeholder="Frame 2" min="0" max="30" required>
                        <input type="number" id="score3" class="score-input" placeholder="Frame 3" min="0" max="30" required>
                        <input type="number" id="score4" class="score-input" placeholder="Frame 4" min="0" max="30" required>
                        <input type="number" id="score5" class="score-input" placeholder="Frame 5" min="0" max="30" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="notes">Session Notes (optional):</label>
                    <textarea id="notes" rows="3" placeholder="Any additional notes about your session..."></textarea>
                </div>
                
                <button type="submit">CALCULATE ARM RATING</button>
            </form>
        </div>
        
        <div id="result" class="result" style="display: none;">
            <h3 class="success">ARM RATING CALCULATED!</h3>
            <div id="resultContent"></div>
        </div>
        
        <div class="card pixel-border" style="margin-top: 40px;">
            <h3 class="info">ABOUT ARM RATING</h3>
            <p style="line-height: 1.6; color: #cccccc;">
                The Alley Roller Mastery (ARM) rating system evaluates player skill based on session performance. 
                Ratings typically range from 8.0 (beginner) to 20.0+ (expert). The system considers your total 
                score across 5 frames and adjusts your rating accordingly.
            </p>
        </div>
    </div>

    <script>
        document.getElementById('sessionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const playerName = document.getElementById('playerName').value;
            const venueName = document.getElementById('venueName').value;
            const cityName = document.getElementById('cityName').value;
            const scores = [
                parseInt(document.getElementById('score1').value) || 0,
                parseInt(document.getElementById('score2').value) || 0,
                parseInt(document.getElementById('score3').value) || 0,
                parseInt(document.getElementById('score4').value) || 0,
                parseInt(document.getElementById('score5').value) || 0
            ];
            const notes = document.getElementById('notes').value;
            
            // Validation
            if (!playerName || !venueName || !cityName) {
                alert('Please fill in all required fields.');
                return;
            }
            
            if (scores.some(score => score < 0 || score > 30)) {
                alert('Each frame score must be between 0 and 30.');
                return;
            }
            
            // Calculate results
            const total = scores.reduce((sum, score) => sum + score, 0);
            const average = total / 5;
            
            // ARM rating calculation (simplified)
            const baseRating = 10.0;
            const expectedTotal = 50; // Expected total for average player
            const performance = (total - expectedTotal) / 10;
            const newRating = Math.max(5.0, Math.min(25.0, baseRating + performance));
            
            // Determine rating quality
            let ratingQuality = 'Beginner';
            let ratingColor = '#ff6666';
            
            if (newRating >= 18) {
                ratingQuality = 'Expert';
                ratingColor = '#ff00ff';
            } else if (newRating >= 15) {
                ratingQuality = 'Advanced';
                ratingColor = '#00ffff';
            } else if (newRating >= 12) {
                ratingQuality = 'Intermediate';
                ratingColor = '#ffff00';
            } else if (newRating >= 10) {
                ratingQuality = 'Developing';
                ratingColor = '#00ff00';
            }
            
            // Display results
            document.getElementById('resultContent').innerHTML = \`
                <div class="rating-display" style="color: \${ratingColor};">
                    ARM RATING: \${newRating.toFixed(2)}
                </div>
                <div class="stats">
                    <div class="stat-item">
                        <div class="info">PLAYER</div>
                        <div><strong>\${playerName}</strong></div>
                    </div>
                    <div class="stat-item">
                        <div class="info">VENUE</div>
                        <div><strong>\${venueName}</strong></div>
                    </div>
                    <div class="stat-item">
                        <div class="info">LOCATION</div>
                        <div><strong>\${cityName}</strong></div>
                    </div>
                    <div class="stat-item">
                        <div class="info">SESSION TOTAL</div>
                        <div><strong>\${total}</strong></div>
                    </div>
                    <div class="stat-item">
                        <div class="info">AVERAGE PER FRAME</div>
                        <div><strong>\${average.toFixed(1)}</strong></div>
                    </div>
                    <div class="stat-item">
                        <div class="info">SKILL LEVEL</div>
                        <div style="color: \${ratingColor};"><strong>\${ratingQuality}</strong></div>
                    </div>
                </div>
                \${notes ? \`<div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;"><strong>Notes:</strong> \${notes}</div>\` : ''}
            \`;
            
            document.getElementById('result').style.display = 'block';
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
            
            // Play success sound (if audio context is available)
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                // Audio not supported, silent fail
            }
        });
        
        // Auto-save player name
        document.getElementById('playerName').addEventListener('blur', function() {
            if (this.value) {
                localStorage.setItem('armPlayerName', this.value);
            }
        });
        
        // Auto-load saved player name
        window.addEventListener('load', function() {
            const savedName = localStorage.getItem('armPlayerName');
            if (savedName) {
                document.getElementById('playerName').value = savedName;
            }
        });
    </script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', completeApp);

// Create Express server for the deployment
const serverCode = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Alley Roller Mastery Calculator running on port \${PORT}\`);
});`;

fs.writeFileSync('dist/index.js', serverCode);

// Create package.json for the deployment
const deployPackageJson = {
  "name": "alley-roller-calculator",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
};

fs.writeFileSync('dist/package.json', JSON.stringify(deployPackageJson, null, 2));

console.log('✅ GitHub-ready deployment package created!');
console.log('Files created in dist/:');
fs.readdirSync('dist').forEach(file => console.log(`  - ${file}`));
console.log('\\nTo test locally: cd dist && npm install && npm start');
console.log('\\nFor GitHub deployment: Copy contents of dist/ to your repository root');