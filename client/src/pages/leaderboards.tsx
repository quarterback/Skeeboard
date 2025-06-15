import { useState } from "react";
import { Button } from "@/components/ui/button";
import LeaderboardTable from "@/components/leaderboard-table";
import { playRetroSound } from "@/lib/utils";

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState<"global" | "state" | "venue">("global");
  const [selectedState, setSelectedState] = useState("OR");

  const handleTabChange = (tab: "global" | "state" | "venue") => {
    setActiveTab(tab);
    playRetroSound("tab_switch");
  };

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <section className="text-center">
        <h2 className="text-2xl mb-6 neon-text text-cyan-400">LEADERBOARDS</h2>
        
        {/* Leaderboard Tabs */}
        <div className="flex justify-center space-x-2 mb-6">
          <Button
            onClick={() => handleTabChange("global")}
            className={`px-4 py-2 text-xs border rounded ${
              activeTab === "global"
                ? "bg-cyan-400 text-slate-900 border-cyan-400"
                : "border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-slate-900"
            }`}
          >
            GLOBAL
          </Button>
          <Button
            onClick={() => handleTabChange("state")}
            className={`px-4 py-2 text-xs border rounded ${
              activeTab === "state"
                ? "bg-cyan-400 text-slate-900 border-cyan-400"
                : "border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-slate-900"
            }`}
          >
            STATE
          </Button>
          <Button
            onClick={() => handleTabChange("venue")}
            className={`px-4 py-2 text-xs border rounded ${
              activeTab === "venue"
                ? "bg-cyan-400 text-slate-900 border-cyan-400"
                : "border-cyan-400 text-cyan-400 bg-transparent hover:bg-cyan-400 hover:text-slate-900"
            }`}
          >
            VENUES
          </Button>
        </div>

        {/* State Selector for State/Venue tabs */}
        {(activeTab === "state" || activeTab === "venue") && (
          <div className="flex justify-center space-x-2 mb-6">
            {["OR", "WA", "CA"].map((state) => (
              <Button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`px-3 py-1 text-xs border rounded ${
                  selectedState === state
                    ? "bg-orange-500 text-slate-900 border-orange-500"
                    : "border-orange-500 text-orange-500 bg-transparent hover:bg-orange-500 hover:text-slate-900"
                }`}
              >
                {state === "OR" ? "OREGON" : state === "WA" ? "WASHINGTON" : "CALIFORNIA"}
              </Button>
            ))}
          </div>
        )}
      </section>

      {/* Leaderboard Content */}
      <section>
        {activeTab === "global" && <LeaderboardTable type="global" />}
        {activeTab === "state" && <LeaderboardTable type="state" filter={selectedState} />}
        {activeTab === "venue" && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">VENUE LEADERBOARDS</p>
            <p className="text-gray-500 text-xs">Select a specific venue from the submission form to view its leaderboard</p>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        <div className="bg-slate-800/50 border border-cyan-400 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-300 mb-1">TOTAL PLAYERS</div>
          <div className="text-lg text-cyan-400 neon-text">247</div>
        </div>
        <div className="bg-slate-800/50 border border-green-400 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-300 mb-1">SESSIONS</div>
          <div className="text-lg text-green-400 neon-text">1,432</div>
        </div>
        <div className="bg-slate-800/50 border border-yellow-400 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-300 mb-1">TOP SCORE</div>
          <div className="text-lg text-yellow-400 neon-text">984</div>
        </div>
      </section>
    </main>
  );
}
