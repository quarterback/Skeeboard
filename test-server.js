import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'github-deployment-package')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'github-deployment-package', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ARM Calculator test server running at http://localhost:${PORT}`);
  console.log('This shows the updated version with session count field');
});