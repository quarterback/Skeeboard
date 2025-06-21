#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simulate the problematic structure that causes deployment failure
console.log('Creating simulated build structure to demonstrate the fix...');

// Create the problematic structure
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

// Clean up any existing dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

// Create the problematic structure (dist/public/index.html)
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'index.html'), '<!DOCTYPE html><html><head><title>Test</title></head><body>Hello World</body></html>');
fs.writeFileSync(path.join(publicDir, 'style.css'), 'body { color: blue; }');
fs.writeFileSync(path.join(distDir, 'index.js'), 'console.log("Server bundle");');

console.log('✅ Created problematic structure:');
console.log('  dist/public/index.html');
console.log('  dist/public/style.css');
console.log('  dist/index.js');

// Now demonstrate the fix
console.log('\n🔧 Applying deployment fix...');

// Move files from dist/public to dist (the fix)
const files = fs.readdirSync(publicDir);
for (const file of files) {
  const sourcePath = path.join(publicDir, file);
  const targetPath = path.join(distDir, file);
  fs.copyFileSync(sourcePath, targetPath);
  console.log(`  Moved: ${file}`);
}

// Remove the empty public directory
fs.rmSync(publicDir, { recursive: true });
console.log('  Cleaned up: dist/public/');

console.log('\n✅ Fixed structure:');
const finalFiles = fs.readdirSync(distDir);
finalFiles.forEach(file => {
  console.log(`  dist/${file}`);
});

console.log('\n🎉 Deployment structure is now correct!');
console.log('   - index.html is in the root of dist/');
console.log('   - Static assets are alongside index.html');
console.log('   - Server bundle remains in dist/');

// Clean up
fs.rmSync(distDir, { recursive: true });
console.log('\n🧹 Cleaned up demo files');