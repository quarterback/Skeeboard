import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SimpleForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    playerName: "",
    venueName: "",
    cityName: "",
    scores: [0, 0, 0, 0, 0],
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
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

  const calculateARMRating = (scores: number[]) => {
    const total = scores.reduce((sum, score) => sum + score, 0);
    const baseRating = 10.0;
    const expectedTotal = 1800; // Expected total for average player (360 per game)
    const performance = (total - expectedTotal) / 400;
    return Math.max(7.0, Math.min(25.0, baseRating + performance));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.playerName || !formData.venueName || !formData.cityName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate ARM rating
      const armRating = calculateARMRating(formData.scores);
      const sessionTotal = formData.scores.reduce((sum, score) => sum + score, 0);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "ARM RATING CALCULATED",
        description: `Rating: ${armRating.toFixed(1)} | Total: ${sessionTotal}`,
      });

      // Reset form
      setFormData({
        playerName: "",
        venueName: "",
        cityName: "",
        scores: [0, 0, 0, 0, 0],
        notes: ""
      });

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionTotal = formData.scores.reduce((sum, score) => sum + score, 0);

  return (
    <section className="bg-slate-800/50 border-2 border-cyan-400 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-center text-cyan-400 mb-6 neon-text">SUBMIT SESSION</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-300 block mb-2">PLAYER NAME</label>
          <Input
            value={formData.playerName}
            onChange={(e) => handleInputChange("playerName", e.target.value)}
            className="retro-input font-mono text-sm"
            placeholder="ENTER NAME"
            required
          />
        </div>

        <div>
          <label className="text-xs text-gray-300 block mb-2">VENUE NAME</label>
          <Input
            value={formData.venueName}
            onChange={(e) => handleInputChange("venueName", e.target.value)}
            className="retro-input font-mono text-sm"
            placeholder="ENTER VENUE NAME"
            required
          />
          <div className="text-xs text-gray-400 mt-1">ENTER THE ARCADE OR BAR NAME</div>
        </div>

        <div>
          <label className="text-xs text-gray-300 block mb-2">CITY</label>
          <Input
            value={formData.cityName}
            onChange={(e) => handleInputChange("cityName", e.target.value)}
            className="retro-input font-mono text-sm"
            placeholder="ENTER CITY NAME"
            required
          />
          <div className="text-xs text-gray-400 mt-1">WHICH CITY IS THIS VENUE LOCATED IN</div>
        </div>

        <div>
          <label className="text-xs text-gray-300 mb-3 block">5 FRAME SCORES</label>
          <div className="grid grid-cols-5 gap-3">
            {formData.scores.map((score, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-cyan-400 mb-1 font-mono">F{index + 1}</div>
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
          <div className="text-xs text-gray-400 mt-2 text-center">ENTER SCORES 0-900 IN INCREMENTS OF 10</div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-400 p-3 rounded text-center">
          <div className="text-xs text-gray-300 mb-1">SESSION TOTAL</div>
          <div className="text-lg text-cyan-400 font-mono">
            {sessionTotal}
          </div>
          <div className="text-xs text-gray-400 mt-1">OUT OF 4500 POINTS</div>
        </div>

        <div>
          <label className="text-xs text-gray-300 block mb-2">NOTES (OPTIONAL)</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="retro-input font-mono text-sm h-20 resize-none"
            placeholder="MACHINE NOTES, TOURNAMENT INFO, ETC..."
          />
        </div>

        <Button
          type="submit"
          className="retro-button w-full py-4 font-mono text-sm rounded hover:animate-glow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "CALCULATING..." : "CALCULATE ARM RATING"}
        </Button>
      </form>
    </section>
  );
}