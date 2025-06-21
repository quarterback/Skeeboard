import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ARMCalculator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    currentARMRating: "",
    sessionCount: "",
    scores: [0, 0, 0, 0, 0]
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{
    newRating: number;
    delta: number;
    isProvisional: boolean;
    sessionTotal: number;
    ratingDisplay: string;
  } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScoreChange = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.min(900, Math.max(0, Math.round(numValue / 10) * 10));
    const newScores = [...formData.scores];
    newScores[index] = clampedValue;
    setFormData(prev => ({
      ...prev,
      scores: newScores
    }));
  };

  const calculateARMRating = (currentRating: number, sessionCount: number, sessionTotal: number) => {
    const expectedScore = currentRating * 180;
    const performance = (sessionTotal - expectedScore) / 200;
    const kFactor = sessionCount < 5 ? 0.8 : 0.4;
    const newRating = Math.max(7.0, Math.min(25.0, currentRating + (performance * kFactor)));
    const delta = newRating - currentRating;
    return { newRating, delta, isProvisional: sessionCount < 5 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentRating = parseFloat(formData.currentARMRating) || 10.0;
    const sessionCount = parseInt(formData.sessionCount) || 0;
    const sessionTotal = formData.scores.reduce((sum, score) => sum + score, 0);

    if (currentRating < 7.0 || currentRating > 25.0) {
      toast({
        title: "Invalid Rating",
        description: "ARM rating must be between 7.0 and 25.0",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const calculation = calculateARMRating(currentRating, sessionCount, sessionTotal);
      const deltaStr = calculation.delta > 0 ? `+${calculation.delta.toFixed(1)}` : calculation.delta.toFixed(1);
      const ratingDisplay = calculation.isProvisional ? `${calculation.newRating.toFixed(1)}p` : calculation.newRating.toFixed(1);
      
      setResult({
        newRating: calculation.newRating,
        delta: calculation.delta,
        isProvisional: calculation.isProvisional,
        sessionTotal,
        ratingDisplay
      });
      
      toast({
        title: "ARM RATING CALCULATED",
        description: `New rating: ${ratingDisplay} (${deltaStr})`,
      });
      
    } catch (error) {
      toast({
        title: "Calculation Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const sessionTotal = formData.scores.reduce((sum, score) => sum + score, 0);

  return (
    <section className="bg-slate-800/50 border-2 border-cyan-400 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-center text-cyan-400 mb-6 neon-text">ARM CALCULATOR</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 block mb-2">CURRENT ARM RATING (7.0-25.0)</label>
          <Input
            value={formData.currentARMRating}
            onChange={(e) => handleInputChange("currentARMRating", e.target.value)}
            className="retro-input font-mono text-sm"
            placeholder="10.0"
            type="number"
            step="0.1"
            min="7.0"
            max="25.0"
          />
          <div className="text-xs text-gray-400 mt-1">ENTER YOUR CURRENT RATING OR START WITH 10.0</div>
        </div>

        <div>
          <label className="text-xs text-gray-300 block mb-2">SESSION COUNT</label>
          <Input
            value={formData.sessionCount}
            onChange={(e) => handleInputChange("sessionCount", e.target.value)}
            className="retro-input font-mono text-sm"
            placeholder="0"
            type="number"
            min="0"
            max="1000"
          />
          <div className="text-xs text-gray-400 mt-1">HOW MANY SESSIONS HAVE YOU PLAYED?</div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-3 block">5 GAME SCORES (0-900 EACH)</label>
          <div className="grid grid-cols-5 gap-3">
            {formData.scores.map((score, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-cyan-400 mb-1 font-mono">G{index + 1}</div>
                <Input
                  type="number"
                  min="0"
                  max="900"
                  step="10"
                  value={score}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  className="retro-input text-center font-mono text-sm h-12 w-full focus:ring-2 focus:ring-cyan-400"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2 text-center">SCORES MUST BE IN INCREMENTS OF 10</div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-400 p-3 rounded text-center">
          <div className="text-xs text-gray-300 mb-1">SESSION TOTAL</div>
          <div className="text-lg text-cyan-400 font-mono">
            {sessionTotal}
          </div>
          <div className="text-xs text-gray-400 mt-1">OUT OF 4500 POINTS</div>
        </div>

        {result && (
          <div className="bg-green-900/20 border border-green-400 p-4 rounded">
            <div className="text-center">
              <div className="text-xs text-gray-300 mb-1">NEW ARM RATING</div>
              <div className="text-2xl text-green-400 font-mono mb-2">
                {result.ratingDisplay}
              </div>
              <div className="text-xs text-gray-400">
                {result.delta > 0 ? "+" : ""}{result.delta.toFixed(1)} from previous rating
              </div>
              {result.isProvisional && (
                <div className="text-xs text-yellow-400 mt-2">
                  PROVISIONAL RATING (FEWER THAN 5 SESSIONS)
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="retro-button w-full py-4 font-mono text-sm rounded hover:animate-glow"
          disabled={isCalculating}
        >
          {isCalculating ? "CALCULATING..." : "CALCULATE ARM RATING"}
        </Button>
      </form>
    </section>
  );
}