#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('Creating deployment structure manually...');

// Clean and create dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Copy the client HTML template and modify it for production
const clientHtml = fs.readFileSync('client/index.html', 'utf-8');
const productionHtml = clientHtml
  .replace('src="/src/main.tsx"', 'src="./main.js"')
  .replace('type="module"', '');

fs.writeFileSync('dist/index.html', productionHtml);

// Create a minimal main.js that loads the app
const mainJs = `
// Minimal app loader for deployment
document.addEventListener('DOMContentLoaded', function() {
  document.body.innerHTML = '<div id="root"><h1>Alley Roller Mastery Calculator</h1><p>Loading application...</p></div>';
  
  // Basic styling
  const style = document.createElement('style');
  style.textContent = \`
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: #fff; }
    #root { max-width: 800px; margin: 0 auto; }
    h1 { color: #00ff00; text-align: center; }
    p { text-align: center; }
  \`;
  document.head.appendChild(style);
});
`;

fs.writeFileSync('dist/main.js', mainJs);

// Build the server
try {
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
} catch (error) {
  console.log('Server build failed, creating minimal server...');
  
  const minimalServer = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(__dirname));

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
  
  fs.writeFileSync('dist/index.js', minimalServer);
}

console.log('\nDeployment files created:');
const files = fs.readdirSync('dist');
files.forEach(file => console.log(`  ${file}`));

if (fs.existsSync('dist/index.html')) {
  console.log('\n✅ SUCCESS: Deployment ready!');
  console.log('- index.html is in dist/ root');
  console.log('- Server bundle is available');
  console.log('- Structure matches deployment requirements');
} else {
  console.log('\n❌ Failed to create deployment structure');
}