import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { playRetroSound } from "@/lib/utils";

const calculatorSchema = z.object({
  currentARMRating: z.number().min(7.0).max(25.0).optional(),
  scores: z.array(
    z.number()
      .min(0, "Score must be at least 0")
      .max(900, "Score cannot exceed 900")
      .refine((val) => val % 10 === 0, "Score must be in increments of 10")
  ).length(5),
});

type CalculatorForm = z.infer<typeof calculatorSchema>;

export default function ARMCalculator() {
  const { toast } = useToast();

  const form = useForm<CalculatorForm>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      currentARMRating: undefined,
      scores: [0, 0, 0, 0, 0],
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculatorForm) => {
      const response = await apiRequest("POST", "/api/calculate-arm", data);
      return response.json();
    },
    onSuccess: (data) => {
      const { armRating, armDelta } = data;
      const deltaStr = armDelta > 0 ? `+${armDelta.toFixed(1)}` : armDelta.toFixed(1);
      toast({
        title: "ARM RATING CALCULATED",
        description: `New rating: ${armRating.toFixed(1)} (${deltaStr})`,
      });
      playRetroSound("success");
    },
    onError: () => {
      toast({
        title: "CALCULATION FAILED",
        description: "Please check your scores and try again.",
        variant: "destructive",
      });
      playRetroSound("error");
    },
  });

  const onSubmit = (data: CalculatorForm) => {
    calculateMutation.mutate(data);
  };

  const handleScoreBlur = (index: number, value: string) => {
    const numValue = parseInt(value) || 0;
    const roundedValue = Math.round(numValue / 10) * 10;
    const clampedValue = Math.max(0, Math.min(900, roundedValue));
    
    const newScores = [...form.getValues().scores];
    newScores[index] = clampedValue;
    form.setValue("scores", newScores);
  };

  const sessionTotal = form.watch("scores").reduce((sum, score) => sum + score, 0);

  return (
    <section className="bg-slate-800/50 border-2 border-cyan-400 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-center text-cyan-400 mb-6 neon-text">ARM CALCULATOR</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Current ARM Rating */}
          <FormField
            control={form.control}
            name="currentARMRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cyan-400 text-xs">CURRENT ARM RATING (7.0-25.0)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min="7.0"
                    max="25.0"
                    placeholder="10.0 (default for new players)"
                    className="retro-input"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Score Inputs */}
          <div className="space-y-4">
            <FormLabel className="text-cyan-400 text-xs block">5-GAME SCORES (0-900)</FormLabel>
            <div className="grid grid-cols-1 gap-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`scores.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="900"
                          placeholder={`Game ${index + 1} score`}
                          className="retro-input text-center"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          onBlur={(e) => handleScoreBlur(index, e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Session Total Display */}
          <div className="bg-slate-700/50 border border-orange-500 rounded p-4 text-center">
            <div className="text-xs text-gray-300 mb-1">SESSION TOTAL</div>
            <div className="text-2xl text-orange-500 neon-text">{sessionTotal}</div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="retro-button w-full py-3"
            disabled={calculateMutation.isPending}
          >
            <Calculator className="mr-2" size={16} />
            {calculateMutation.isPending ? "CALCULATING..." : "CALCULATE ARM RATING"}
          </Button>

        </form>
      </Form>
    </section>
  );
}