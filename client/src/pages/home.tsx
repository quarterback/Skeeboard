import { Calculator } from "lucide-react";
import ARMCalculator from "@/components/arm-calculator";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8 animate-slide-up">
        <h2 className="text-2xl mb-4 neon-text text-orange-500">ARM RATING CALCULATOR</h2>
        <h3 className="text-lg mb-2 text-cyan-400">FOR ALLEYROLLERS</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Calculate your ARM (Alley Roller Metric) rating based on your 5-game skeeball sessions. No scores are stored - this is purely a rating calculator!
        </p>
      </section>

      {/* ARM Calculator */}
      <ARMCalculator />

      {/* Info Section */}
      <section className="bg-slate-800/50 border-2 border-cyan-400 rounded-lg p-6 text-center max-w-md mx-auto">
        <Calculator className="text-cyan-400 text-3xl mb-4 mx-auto" />
        <h3 className="text-cyan-400 mb-3 neon-text">HOW ARM RATING WORKS</h3>
        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          ARM ratings range from 7.0 to 25.0. Enter your current rating (or start at 10.0) and your 5 game scores to see your updated rating. Higher session totals increase your rating!
        </p>
      </section>
    </main>
  );
}
