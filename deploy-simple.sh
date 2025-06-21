#!/bin/bash

echo "Building for deployment..."

# Clean any existing build
rm -rf dist

# Use the original vite config but build directly to dist root
echo "Building client with correct output directory..."
npx vite build --outDir dist --emptyOutDir

# Build server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Deployment build complete!"
echo "Files in dist:"
ls -la dist/

echo ""
echo "✅ Ready for deployment - all files are in dist/ root"