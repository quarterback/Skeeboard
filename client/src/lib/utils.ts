import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ARM Rating System Utils
export function calculateSessionTotal(scores: number[]): number {
  return scores.reduce((sum, score) => sum + score, 0);
}

export function expectedScoreForRating(armRating: number): number {
  return (armRating - 7) * 25 + 150;
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

// Legacy function for backwards compatibility
export function calculateRating(scores: number[]): number {
  return calculateSessionTotal(scores);
}

export function formatRating(rating: number): string {
  return rating.toString();
}

export function getRatingColor(rating: number): string {
  return getARMRatingColor(rating / 100); // Convert session total to approximate ARM range
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
