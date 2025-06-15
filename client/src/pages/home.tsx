import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp } from "lucide-react";
import ScoreSubmissionForm from "@/components/score-submission-form";
import LeaderboardTable from "@/components/leaderboard-table";
import type { PlayerStats } from "@shared/schema";

export default function Home() {
  // This would typically come from user context/authentication
  const playerName = localStorage.getItem("lastPlayerName") || "";
  
  const { data: playerStats } = useQuery<PlayerStats>({
    queryKey: ["/api/player", playerName],
    enabled: !!playerName,
  });

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8 animate-slide-up">
        <h2 className="text-2xl mb-4 neon-text text-orange-500">THE RANKING SYSTEM</h2>
        <h3 className="text-lg mb-2 text-cyan-400">FOR ALLEYROLLERS</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Submit your 5-game skeeball sessions, climb the leaderboards, and become the ultimate alleyroller champion!
        </p>
      </section>

      {/* Score Submission Form */}
      <ScoreSubmissionForm />

      {/* Quick Stats */}
      {playerStats && (
        <section className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-slate-800/50 border border-green-400 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-300 mb-1">YOUR SESSIONS</div>
            <div className="text-xl text-green-400 neon-text">{playerStats.totalSessions}</div>
          </div>
          <div className="bg-slate-800/50 border border-orange-500 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-300 mb-1">BEST RATING</div>
            <div className="text-xl text-orange-500 neon-text">{playerStats.bestRating}</div>
          </div>
        </section>
      )}

      {/* Preview Leaderboard */}
      <section className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg neon-text text-cyan-400 mb-4">TOP PLAYERS</h3>
        </div>
        <LeaderboardTable type="global" limit={5} />
        
        <div className="text-center">
          <button 
            className="retro-button px-6 py-3 text-xs rounded"
            onClick={() => window.location.href = "/leaderboards"}
          >
            <TrendingUp className="mr-2" size={12} />
            VIEW ALL RANKINGS
          </button>
        </div>
      </section>

      {/* Skeecaptain CTA */}
      <section className="bg-slate-800/50 border-2 border-orange-500 rounded-lg p-6 text-center max-w-md mx-auto">
        <Target className="text-orange-500 text-3xl mb-4 animate-pulse mx-auto" />
        <h3 className="text-cyan-400 mb-3 neon-text">BECOME A SKEECAPTAIN</h3>
        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Don't see your city? Apply to become a Skeecaptain and help expand the rankings to your region!
        </p>
        <button 
          className="retro-button px-6 py-3 text-xs rounded"
          onClick={() => window.location.href = "/skeecaptain"}
        >
          <Target className="mr-2" size={12} />
          APPLY NOW
        </button>
      </section>
    </main>
  );
}
