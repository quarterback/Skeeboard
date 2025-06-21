import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3030;

// Serve the completed app from github-deploy directory
app.use(express.static(path.join(__dirname, 'github-deploy')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'github-deploy', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ARM Calculator preview running at http://localhost:${PORT}`);
  console.log('This is your complete working app ready for deployment!');
});