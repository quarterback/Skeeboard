#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building for Vercel deployment...');

try {
  // Clean any existing build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }

  // Build using the deployment config
  console.log('Building client...');
  execSync('npx vite build --config vite.deployment.config.ts', { stdio: 'inherit' });
  
  // Build server
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  
} catch (error) {
  console.error('Build failed, creating fallback deployment...');
  
  // Create fallback deployment
  execSync('node simple-deploy.js', { stdio: 'inherit' });
}