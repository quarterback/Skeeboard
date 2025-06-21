# Deployment Guide

## Issue Resolution

The deployment was failing because the build process creates static files in `dist/public/` but the deployment system expects them in the root `dist/` directory.

## Solution

I've created a custom build script that resolves this structure mismatch:

### For Manual Deployment

Run the custom build script:
```bash
node build-for-deployment.js
```

This script:
1. Runs `vite build` to create the frontend assets
2. Runs `esbuild` to bundle the server
3. Moves static files from `dist/public/` to `dist/` for proper deployment structure
4. Cleans up the temporary directory structure

### Build Output Structure

After running the deployment build script, your `dist/` directory will contain:
- `index.html` (root level for deployment)
- Static assets (CSS, JS files)
- `index.js` (server bundle)

## Deployment Steps

1. Run the deployment build:
   ```bash
   node build-for-deployment.js
   ```

2. Verify the build structure:
   ```bash
   ls dist/
   # Should show index.html and other static files at root level
   ```

3. Deploy using Replit's deployment system

## Environment Variables

Ensure these environment variables are set in your deployment:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`

## Troubleshooting

If deployment still fails:
1. Check that `index.html` exists in the root of `dist/`
2. Verify static assets are alongside `index.html`, not in a subdirectory
3. Ensure the server bundle (`index.js`) is in `dist/`