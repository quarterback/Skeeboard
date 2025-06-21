import { Calculator } from "lucide-react";
import SimpleForm from "@/components/simple-form";
import AccessibilityToggle from "@/components/accessibility-toggle";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8 animate-slide-up">
        <h2 className="text-2xl mb-4 neon-text text-orange-500">ARM RATING CALCULATOR</h2>
        <h3 className="text-lg mb-2 text-cyan-400">FOR ALLEYROLLERS</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Rate yourself against the best alley rollers in the world
        </p>
      </section>

      {/* ARM Calculator */}
      <SimpleForm />

      {/* Info Section */}
      <section className="bg-slate-800/50 border-2 border-cyan-400 rounded-lg p-6 max-w-2xl mx-auto info-section">
        <Calculator className="text-cyan-400 text-3xl mb-4 mx-auto" aria-hidden="true" />
        <h3 className="text-cyan-400 mb-4 neon-text text-center">HOW THE ALLEY ROLLER METRIC (ARM) WORKS</h3>
        <div className="text-xs text-gray-300 leading-relaxed space-y-3 text-left">
          <p>
            The Alley Roller Metric (ARM) is a performance-based rating system designed for 5-game skee sessions. ARM scores range from 7.0 (beginner) to 25.0 (elite), and adjust based on how well you score compared to what's expected at your current level.
          </p>
          <p>
            To calculate your updated rating, enter your current ARM (or start at 7.0), your total number of sessions played, and the combined score from your most recent 5 games (each game is scored 0–900, for a maximum session total of 4500).
          </p>
          <p>
            New players see bigger rating swings as the system learns their level. After 5 sessions, your rating stabilizes and becomes more resistant to single-session highs or lows. Players with fewer than 5 sessions receive a provisional rating (e.g., 12.3p).
          </p>
        </div>
        <div className="sr-only">
          This calculator uses the ARM (Alley Roller Metric) system to rate skeeball performance. Input your five individual game scores and current rating to calculate your new ARM rating.
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-slate-700 text-center">
        <div className="flex justify-center items-center gap-4">
          <span className="text-xs text-gray-400">Accessibility:</span>
          <AccessibilityToggle />
        </div>
      </footer>
    </main>
  );
}
