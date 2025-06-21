# GitHub Deployment Guide

## Step 1: Upload to GitHub

1. Create a new repository on GitHub
2. Copy all your project files to the repository
3. Push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Alley Roller Mastery Calculator"
git branch -M main
git remote add origin https://github.com/yourusername/alley-roller-calculator.git
git push -u origin main
```

## Step 2: Choose Your Deployment Platform

### Option A: Vercel (Recommended - Free)
1. Visit [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Import your repository
5. Configure build settings:
   - **Build Command**: `node simple-deploy.js`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Netlify (Alternative - Free)
1. Visit [netlify.com](https://netlify.com)
2. Sign up with your GitHub account
3. Click "New site from Git"
4. Choose your repository
5. Configure:
   - **Build Command**: `node simple-deploy.js`
   - **Publish Directory**: `dist`

### Option C: Railway (Full Stack - Free tier)
1. Visit [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project from GitHub repo
4. Railway will auto-detect and deploy
5. Add environment variables in Railway dashboard

### Option D: Render (Full Stack - Free tier)
1. Visit [render.com](https://render.com)
2. Connect your GitHub account
3. Create new "Web Service"
4. Configure:
   - **Build Command**: `npm install && node simple-deploy.js`
   - **Start Command**: `node dist/index.js`

## Step 3: Environment Variables (if using database)

For full database functionality, add these environment variables in your deployment platform:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
PORT=10000
```

## Step 4: Custom Domain (Optional)

Most platforms allow you to add a custom domain:
- Vercel: Project Settings → Domains
- Netlify: Site Settings → Domain Management
- Railway: Project Settings → Domains
- Render: Dashboard → Settings → Custom Domains

## Quick Deploy Version

If you want to deploy immediately without a database, your app is ready to go! The `simple-deploy.js` script creates a self-contained version that works anywhere.

## Live Demo

Once deployed, your app will be live at:
- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`
- Railway: `https://your-project.railway.app`
- Render: `https://your-project.onrender.com`

Your Alley Roller Mastery Calculator will be accessible to anyone on the web!