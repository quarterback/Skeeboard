# Alley Roller Mastery Calculator

A retro pixel art alleyroller rating calculator that enables players to benchmark their ARM (Alley Roller Mastery) rating against global competitors.

## Features

- Submit bowling session scores (5 frames)
- Calculate ARM ratings with real-time feedback
- Player profiles with rating history
- Global and venue-specific leaderboards
- Retro pixel art design with accessibility features

## Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel/Netlify ready

## Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd alley-roller-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your DATABASE_URL and other environment variables
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Deployment

### Quick Deploy (Standalone)
For a simple deployment without database:
```bash
node simple-deploy.js
```
This creates a self-contained app in `dist/` that works anywhere.

### Full Stack Deploy
1. Build the project:
```bash
npm run build
```

2. Deploy to your preferred platform:
- **Vercel**: Connect your GitHub repo
- **Netlify**: Connect your GitHub repo  
- **Railway**: Connect your GitHub repo
- **Render**: Connect your GitHub repo

## Environment Variables

```
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=5000
```

## Project Structure

```
├── client/           # React frontend
├── server/           # Express backend  
├── shared/           # Shared types and schemas
├── dist/             # Build output
└── scripts/          # Deployment scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License