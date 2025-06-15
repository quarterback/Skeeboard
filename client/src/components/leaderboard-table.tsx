import { useQuery } from "@tanstack/react-query";
import { Trophy, Crown, Medal } from "lucide-react";
import { getRankColor } from "@/lib/utils";
import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardTableProps {
  type: "global" | "state" | "venue";
  filter?: string | number;
  limit?: number;
}

export default function LeaderboardTable({ type, filter, limit = 50 }: LeaderboardTableProps) {
  const getEndpoint = () => {
    switch (type) {
      case "global":
        return "/api/leaderboard/global";
      case "state":
        return `/api/leaderboard/state/${filter}`;
      case "venue":
        return `/api/leaderboard/venue/${filter}`;
    }
  };

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: [getEndpoint(), limit],
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={16} />;
    if (rank === 2) return <Medal className="text-gray-300" size={16} />;
    if (rank === 3) return <Medal className="text-orange-400" size={16} />;
    return <Crown className="text-cyan-400" size={16} />;
  };

  if (isLoading) {
    return (
      <div className="space-y-3 max-w-md mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="leaderboard-entry p-4 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-4 bg-gray-600 rounded"></div>
                <div>
                  <div className="w-24 h-4 bg-gray-600 rounded mb-1"></div>
                  <div className="w-20 h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-6 bg-gray-600 rounded mb-1"></div>
                <div className="w-16 h-3 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="text-gray-500 text-4xl mx-auto mb-4" />
        <p className="text-gray-400 text-sm">NO SCORES YET</p>
        <p className="text-gray-500 text-xs mt-1">BE THE FIRST TO SUBMIT!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-md mx-auto">
      {entries.map((entry) => (
        <div
          key={`${entry.playerName}-${entry.venueName}`}
          className={`leaderboard-entry p-4 rounded-lg flex items-center justify-between ${
            entry.rank <= 3 ? "animate-pulse-neon" : ""
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`text-sm font-bold w-8 flex items-center gap-1 ${getRankColor(entry.rank)}`}>
              {getRankIcon(entry.rank)}
              #{entry.rank}
            </div>
            <div>
              <div className="text-sm text-white font-bold">{entry.playerName}</div>
              <div className="text-xs text-gray-400">
                {entry.venueName} • {entry.cityName}, {entry.state}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg neon-text ${getRankColor(entry.rank).split(' ')[0]}`}>
              {entry.rating}
            </div>
            <div className="text-xs text-gray-400">
              {entry.sessions} session{entry.sessions !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
