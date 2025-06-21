#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function moveBuildFiles() {
  const sourceDir = path.join(rootDir, 'dist', 'public');
  const targetDir = path.join(rootDir, 'dist');
  
  // Check if the source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.log('No dist/public directory found, build may have already been moved or failed');
    return;
  }
  
  // Read all files in the source directory
  const files = fs.readdirSync(sourceDir);
  
  // Move each file from dist/public to dist
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // If it's a directory, move it recursively
    if (fs.statSync(sourcePath).isDirectory()) {
      // Copy directory recursively
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      console.log(`Moved directory: ${file}`);
    } else {
      // Move file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Moved file: ${file}`);
    }
  }
  
  // Remove the now-empty public directory
  fs.rmSync(sourceDir, { recursive: true, force: true });
  console.log('Removed dist/public directory');
  
  console.log('Build files successfully moved to dist/ for deployment');
}

// Run the script
moveBuildFiles().catch(console.error);