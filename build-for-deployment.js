#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building application for deployment...');

try {
  // Run the original build command
  console.log('Running vite build...');
  execSync('vite build', { stdio: 'inherit' });
  
  console.log('Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Move files from dist/public to dist for deployment
  const sourceDir = path.join(__dirname, 'dist', 'public');
  const targetDir = path.join(__dirname, 'dist');
  
  if (fs.existsSync(sourceDir)) {
    console.log('Moving static files to deployment structure...');
    
    // Read all files in the source directory
    const files = fs.readdirSync(sourceDir);
    
    // Move each file from dist/public to dist
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Skip if target already exists to avoid conflicts
      if (fs.existsSync(targetPath)) {
        console.log(`Skipping ${file} - already exists in target`);
        continue;
      }
      
      // If it's a directory, move it recursively
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.cpSync(sourcePath, targetPath, { recursive: true });
        console.log(`Moved directory: ${file}`);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Moved file: ${file}`);
      }
    }
    
    // Remove the now-empty public directory
    fs.rmSync(sourceDir, { recursive: true, force: true });
    console.log('Cleaned up dist/public directory');
  }
  
  console.log('✅ Build completed successfully for deployment!');
  console.log('Files are now in the correct structure:');
  console.log('- Static files (including index.html) are in dist/');
  console.log('- Server files are in dist/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}