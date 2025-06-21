# ARM Rating Calculator

A retro-styled skeeball rating calculator that computes ARM (Alley Roller Mastery) ratings based on 5-game sessions.

## Features

- Calculate ARM ratings from 7.0 (beginner) to 25.0+ (elite)
- Retro pixel art design with animated effects
- Real-time session total calculation
- Player name persistence via localStorage
- Responsive design for mobile and desktop
- No database required - runs entirely in the browser

## Live Demo

Deploy this to any static hosting service for instant access.

## Deployment Options

### GitHub Pages
1. Upload this repository to GitHub
2. Go to Settings → Pages
3. Select "Deploy from main branch"
4. Your app will be live at `username.github.io/repository-name`

### Vercel
1. Connect your GitHub repository to Vercel
2. Deploy automatically with zero configuration
3. Get a custom domain like `arm-calculator.vercel.app`

### Netlify
1. Drag and drop the files to Netlify
2. Or connect your GitHub repository
3. Instant deployment with custom domain options

## How ARM Rating Works

The ARM rating system evaluates skeeball performance based on 5-game sessions:

- **Scoring**: Each game scored 0-900 points (increments of 10)
- **Session Total**: Maximum 4500 points across 5 games
- **Rating Range**: 7.0 (beginner) to 25.0+ (elite)
- **Calculation**: Performance compared to expected score for current rating

### Rating Levels
- **7.0-9.9**: Beginner Player
- **10.0-11.9**: Developing Player  
- **12.0-14.9**: Intermediate Player
- **15.0-17.9**: Advanced Player
- **18.0-19.9**: Expert Player
- **20.0+**: Elite Player

## Technical Details

- Pure HTML, CSS, and JavaScript
- No build process required
- Works offline after initial load
- Progressive Web App capabilities
- Cross-browser compatible

## License

MIT License - Feel free to use and modify
