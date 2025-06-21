#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('Creating complete GitHub deployment package...');

// Create github-deploy directory
if (fs.existsSync('github-deploy')) {
  fs.rmSync('github-deploy', { recursive: true });
}
fs.mkdirSync('github-deploy');

// Copy the working index.html from dist
fs.copyFileSync('dist/index.html', 'github-deploy/index.html');

// Create README for GitHub
const readmeContent = `# Alley Roller Mastery Calculator

A retro pixel art bowling calculator that computes ARM (Alley Roller Mastery) ratings.

## Features

- Calculate ARM ratings based on 5-frame bowling sessions
- Retro pixel art design with glowing animations
- Form validation and error handling
- Local storage for player preferences
- Responsive design for all devices
- Sound effects and visual feedback

## Live Demo

Visit the deployed application at: [Your Vercel/Netlify URL]

## Local Development

1. Clone this repository
2. Open \`index.html\` in your browser
3. No build process required - it's a complete static app

## Deployment

This app can be deployed to any static hosting service:

- **Vercel**: Connect GitHub repo, deploy automatically
- **Netlify**: Drag and drop the files or connect GitHub
- **GitHub Pages**: Enable in repository settings
- **Any static host**: Upload the \`index.html\` file

## Tech Stack

- Pure HTML, CSS, and JavaScript
- No frameworks or build tools required
- Progressive Web App capabilities
- Local storage for data persistence

## License

MIT License - feel free to use and modify
`;

fs.writeFileSync('github-deploy/README.md', readmeContent);

// Create package.json for potential Vercel deployment
const packageJson = {
  "name": "alley-roller-calculator",
  "version": "1.0.0",
  "description": "Retro bowling ARM rating calculator",
  "main": "index.html",
  "scripts": {
    "start": "serve .",
    "build": "echo 'No build needed - static HTML app'"
  },
  "dependencies": {},
  "devDependencies": {},
  "keywords": ["bowling", "calculator", "retro", "games"],
  "author": "ARM Calculator",
  "license": "MIT"
};

fs.writeFileSync('github-deploy/package.json', JSON.stringify(packageJson, null, 2));

// Create .gitignore
const gitignore = `node_modules/
.DS_Store
*.log
.env
dist/
temp/
`;

fs.writeFileSync('github-deploy/.gitignore', gitignore);

// Create vercel.json for easy Vercel deployment
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
};

fs.writeFileSync('github-deploy/vercel.json', JSON.stringify(vercelConfig, null, 2));

console.log('✅ GitHub deployment package ready!');
console.log('\nFiles created in github-deploy/:');
fs.readdirSync('github-deploy').forEach(file => {
  console.log(`  ✓ ${file}`);
});

console.log('\n🚀 DEPLOYMENT INSTRUCTIONS:');
console.log('1. Copy all files from github-deploy/ to your GitHub repository');
console.log('2. Push to GitHub');
console.log('3. Deploy on any platform:');
console.log('   • Vercel: Import GitHub repo → Deploy');
console.log('   • Netlify: Connect GitHub → Deploy');
console.log('   • GitHub Pages: Settings → Pages → Deploy from main branch');
console.log('\n🎯 Your app will be live and fully functional!');