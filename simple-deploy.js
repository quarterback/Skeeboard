#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Creating simplified deployment...');

// Clean and create dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Create minimal HTML with embedded app
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alley Roller Mastery Calculator</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Courier New', monospace; 
            background: #0a0a0a; 
            color: #00ff00; 
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { 
            text-align: center; 
            font-size: 2.5rem; 
            margin-bottom: 2rem;
            text-shadow: 0 0 10px #00ff00;
        }
        .form-group { margin-bottom: 1.5rem; }
        label { 
            display: block; 
            margin-bottom: 0.5rem; 
            color: #00cccc;
            font-weight: bold;
        }
        input, textarea, button { 
            width: 100%; 
            padding: 12px; 
            background: #1a1a1a; 
            border: 2px solid #333; 
            color: #00ff00; 
            font-family: inherit;
            border-radius: 4px;
        }
        input:focus, textarea:focus { 
            border-color: #00ff00; 
            outline: none; 
            box-shadow: 0 0 5px #00ff00;
        }
        button { 
            background: #003300; 
            border-color: #00ff00; 
            cursor: pointer; 
            font-weight: bold;
            transition: all 0.3s;
        }
        button:hover { 
            background: #00ff00; 
            color: #000; 
        }
        .scores { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .result { 
            margin-top: 2rem; 
            padding: 1rem; 
            background: #1a1a1a; 
            border: 2px solid #00ff00;
            border-radius: 4px;
        }
        .retro-border {
            border: 2px solid #00ff00;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎳 ALLEY ROLLER MASTERY 🎳</h1>
        
        <div class="retro-border">
            <h2>Submit Your Session</h2>
            <form id="sessionForm">
                <div class="form-group">
                    <label for="playerName">Player Name:</label>
                    <input type="text" id="playerName" required>
                </div>
                
                <div class="form-group">
                    <label for="venueName">Venue Name:</label>
                    <input type="text" id="venueName" required>
                </div>
                
                <div class="form-group">
                    <label for="cityName">City:</label>
                    <input type="text" id="cityName" required>
                </div>
                
                <div class="form-group">
                    <label>Scores (5 frames):</label>
                    <div class="scores">
                        <input type="number" id="score1" placeholder="Frame 1" min="0" max="30" required>
                        <input type="number" id="score2" placeholder="Frame 2" min="0" max="30" required>
                        <input type="number" id="score3" placeholder="Frame 3" min="0" max="30" required>
                        <input type="number" id="score4" placeholder="Frame 4" min="0" max="30" required>
                        <input type="number" id="score5" placeholder="Frame 5" min="0" max="30" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="notes">Notes (optional):</label>
                    <textarea id="notes" rows="3"></textarea>
                </div>
                
                <button type="submit">CALCULATE ARM RATING</button>
            </form>
        </div>
        
        <div id="result" class="result" style="display: none;">
            <h3>ARM Rating Calculated!</h3>
            <p id="resultText"></p>
        </div>
    </div>

    <script>
        document.getElementById('sessionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const scores = [
                parseInt(document.getElementById('score1').value),
                parseInt(document.getElementById('score2').value),
                parseInt(document.getElementById('score3').value),
                parseInt(document.getElementById('score4').value),
                parseInt(document.getElementById('score5').value)
            ];
            
            const total = scores.reduce((sum, score) => sum + score, 0);
            const average = total / 5;
            
            // Simple ARM rating calculation
            const baseRating = 10.0;
            const performance = (total - 50) / 10; // Deviation from expected 50
            const newRating = Math.max(0, baseRating + performance);
            
            const playerName = document.getElementById('playerName').value;
            const venue = document.getElementById('venueName').value;
            
            document.getElementById('resultText').innerHTML = 
                \`<strong>\${playerName}</strong> at <strong>\${venue}</strong><br>
                Session Total: <strong>\${total}</strong><br>
                Average per Frame: <strong>\${average.toFixed(1)}</strong><br>
                Estimated ARM Rating: <strong>\${newRating.toFixed(2)}</strong>\`;
            
            document.getElementById('result').style.display = 'block';
            
            // Scroll to result
            document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
        });
    </script>
</body>
</html>`;

fs.writeFileSync('dist/index.html', html);

// Create minimal server for deployment
const server = `import express from 'express';
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
  console.log(\`Server running on port \${PORT}\`);
});`;

fs.writeFileSync('dist/index.js', server);

console.log('✅ Simplified deployment created!');
console.log('Files:', fs.readdirSync('dist'));
console.log('Ready to deploy with: node dist/index.js');