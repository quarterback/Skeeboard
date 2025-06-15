import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateRating(scores: number[]): number {
  const validScores = scores.filter(score => score > 0);
  if (validScores.length < 3) return 0;
  
  const sorted = [...validScores].sort((a, b) => b - a);
  const middleThree = sorted.slice(1, 4);
  return Math.round(middleThree.reduce((sum, score) => sum + score, 0) / 3);
}

export function formatRating(rating: number): string {
  return rating.toString().padStart(3, '0');
}

export function getRatingColor(rating: number): string {
  if (rating >= 800) return 'text-yellow-400'; // Gold
  if (rating >= 600) return 'text-green-400'; // Neon green
  if (rating >= 400) return 'text-cyan-400'; // Neon cyan
  return 'text-white';
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400 border-yellow-400'; // Gold
  if (rank === 2) return 'text-gray-300 border-gray-300'; // Silver
  if (rank === 3) return 'text-orange-400 border-orange-400'; // Bronze
  return 'text-white border-cyan-400';
}

export function playRetroSound(type: 'submit' | 'navigation' | 'tab_switch' | 'error' | 'success') {
  // Placeholder for Web Audio API implementation
  console.log(`🔊 Playing ${type} sound`);
}
