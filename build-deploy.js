#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
  console.log('Building for deployment...');
  
  // Clean dist
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  
  // Build using the deployment config that outputs to dist/ directly
  console.log('Building frontend...');
  execSync('npx vite build --config vite.deployment.config.ts', { stdio: 'inherit' });
  
  // Build server
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  console.log('\nBuild complete! Files in dist:');
  const files = fs.readdirSync('dist');
  files.forEach(file => console.log(`  ${file}`));
  
  // Verify index.html is in root
  if (fs.existsSync('dist/index.html')) {
    console.log('\n✅ SUCCESS: index.html is in dist/ root - ready for deployment!');
  } else {
    console.log('\n❌ ERROR: index.html not found in dist/ root');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}