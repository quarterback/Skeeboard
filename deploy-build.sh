#!/bin/bash

echo "Building for deployment..."

# Clean any existing build
rm -rf dist

# Run the client build only (faster)
echo "Building client..."
cd client && npx vite build --outDir ../dist && cd ..

# Build server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Deployment build complete!"
echo "Files in dist:"
ls -la dist/

echo ""
echo "✅ Ready for deployment - index.html is in root of dist/"