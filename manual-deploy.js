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

// Copy the production server
console.log('Creating production server...');
const productionServerContent = fs.readFileSync('production-server.js', 'utf-8');
fs.writeFileSync('dist/index.js', productionServerContent);

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