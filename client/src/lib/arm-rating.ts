// ARM (Alley Roller Metric) Rating System
// Rating scale: 7.0 - 25.0 with decimal precision

export interface ARMProfile {
  playerName: string;
  currentRating: number;
  recentSessions: SessionData[];
  totalSessions: number;
  isProvisional: boolean;
  hotStreak: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface SessionData {
  scores: number[];
  sessionTotal: number;
  venueName: string;
  armRating?: number;
  armDelta?: number;
  submittedAt: Date;
}

export function expectedScoreForRating(armRating: number): number {
  // Maps an ARM rating (7.0–25.0) to an expected 5-game session score (150–700)
  return ((armRating - 7.0) / 18.0) * 550 + 150;
}

export function confidenceScale(sessionCount: number): number {
  // Returns a volatility multiplier based on the number of sessions played
  // More sessions = more confidence = lower rating swing
  // Returns a value between 1.0 (low confidence) and 0.1 (high confidence)
  return Math.max(0.1, 1.0 / (1 + 0.1 * sessionCount));
}

export function calculateARMUpdate(currentRating: number, sessionScore: number, sessionCount: number = 0): number {
  // Calculates the new ARM rating after a session
  // Includes expected score benchmarking, bidirectional updates,
  // and volatility scaling based on session count
  const expected = expectedScoreForRating(currentRating);
  const performanceDelta = (sessionScore - expected) / 100;

  // Scale gain/loss by session-based confidence
  const volatility = confidenceScale(sessionCount);
  const ratingChange = performanceDelta * volatility;

  // Apply and clamp new rating
  const newRating = currentRating + ratingChange;
  return Math.round(Math.min(Math.max(newRating, 7.0), 25.0) * 10) / 10;
}

export function getInitialARMRating(firstThreeSessions: number[]): number {
  // Calculate provisional rating based on first 3 sessions
  const avgScore = firstThreeSessions.reduce((sum, score) => sum + score, 0) / firstThreeSessions.length;
  const baseRating = 7 + ((avgScore - 150) / 25);
  return Math.max(7.0, Math.min(25.0, Math.round(baseRating * 10) / 10));
}

export function calculateHotStreak(recentSessions: SessionData[]): number {
  if (recentSessions.length < 2) return 0;
  
  let streak = 0;
  const sortedSessions = [...recentSessions].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  
  for (let i = 0; i < sortedSessions.length - 1; i++) {
    const current = sortedSessions[i];
    const previous = sortedSessions[i + 1];
    
    if (current.armRating && previous.armRating && current.armRating > previous.armRating) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function calculateTrend(recentSessions: SessionData[]): 'up' | 'down' | 'stable' {
  if (recentSessions.length < 3) return 'stable';
  
  const ratings = recentSessions
    .filter(s => s.armRating)
    .map(s => s.armRating!)
    .slice(-5); // Last 5 sessions
  
  if (ratings.length < 3) return 'stable';
  
  const first = ratings[0];
  const last = ratings[ratings.length - 1];
  const diff = last - first;
  
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'stable';
}

export function formatARMRating(rating: number): string {
  return rating.toFixed(1);
}

export function getARMRatingColor(rating: number): string {
  if (rating >= 20.0) return 'text-purple-400'; // Elite
  if (rating >= 17.0) return 'text-yellow-400'; // Master
  if (rating >= 14.0) return 'text-orange-400'; // Expert
  if (rating >= 11.0) return 'text-green-400'; // Advanced
  if (rating >= 9.0) return 'text-cyan-400'; // Intermediate
  return 'text-gray-300'; // Beginner
}

export function getARMRatingTitle(rating: number): string {
  if (rating >= 20.0) return 'ELITE ROLLER';
  if (rating >= 17.0) return 'MASTER ROLLER';
  if (rating >= 14.0) return 'EXPERT ROLLER';
  if (rating >= 11.0) return 'ADVANCED ROLLER';
  if (rating >= 9.0) return 'INTERMEDIATE ROLLER';
  return 'BEGINNER ROLLER';
}

export function generateTourCard(profile: ARMProfile): {
  playerName: string;
  rating: string;
  title: string;
  sessions: number;
  trend: string;
  hotStreak: number;
  venues: number;
} {
  const uniqueVenues = new Set(profile.recentSessions.map(s => s.venueName));
  
  return {
    playerName: profile.playerName,
    rating: formatARMRating(profile.currentRating),
    title: getARMRatingTitle(profile.currentRating),
    sessions: profile.totalSessions,
    trend: profile.trendDirection.toUpperCase(),
    hotStreak: profile.hotStreak,
    venues: uniqueVenues.size,
  };
}

export function getKFactor(totalSessions: number): number {
  // Reduce K-factor as player plays more sessions for stability
  if (totalSessions < 10) return 0.20; // Higher volatility for new players
  if (totalSessions < 25) return 0.15; // Default K-factor
  if (totalSessions < 50) return 0.10; // More stable for experienced players
  return 0.08; // Very stable for veterans
}

export function updateARMProfile(
  currentProfile: ARMProfile | null, 
  newSession: SessionData
): ARMProfile {
  const sessionTotal = newSession.scores.reduce((sum, score) => sum + score, 0);
  
  if (!currentProfile) {
    // New player - start provisional
    return {
      playerName: newSession.venueName, // This should be playerName
      currentRating: 10.0, // Start at middle rating
      recentSessions: [{ ...newSession, sessionTotal }],
      totalSessions: 1,
      isProvisional: true,
      hotStreak: 0,
      trendDirection: 'stable',
    };
  }
  
  const recentSessions = [...currentProfile.recentSessions, { ...newSession, sessionTotal }]
    .slice(-10); // Keep only last 10 sessions
  
  let newRating = currentProfile.currentRating;
  let isProvisional = currentProfile.isProvisional;
  
  if (currentProfile.totalSessions >= 3 && isProvisional) {
    // Calculate initial rating from first 3 sessions
    const firstThree = recentSessions.slice(0, 3).map(s => s.sessionTotal);
    newRating = getInitialARMRating(firstThree);
    isProvisional = false;
  } else if (!isProvisional) {
    // Update rating using ARM formula
    const kFactor = getKFactor(currentProfile.totalSessions);
    newRating = calculateARMUpdate(currentProfile.currentRating, sessionTotal, kFactor);
  }
  
  const updatedProfile: ARMProfile = {
    ...currentProfile,
    currentRating: newRating,
    recentSessions,
    totalSessions: currentProfile.totalSessions + 1,
    isProvisional,
    hotStreak: 0,
    trendDirection: 'stable',
  };
  
  // Calculate hot streak and trend
  updatedProfile.hotStreak = calculateHotStreak(recentSessions);
  updatedProfile.trendDirection = calculateTrend(recentSessions);
  
  return updatedProfile;
}