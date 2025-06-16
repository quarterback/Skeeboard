import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculateSessionTotal, formatRating, getRatingColor, playRetroSound } from "@/lib/utils";

const sessionSchema = z.object({
  playerName: z.string().min(1, "Player name is required").max(100),
  venueName: z.string().min(1, "Venue name is required").max(200),
  cityName: z.string().min(1, "City is required").max(100),
  currentARMRating: z.number().min(7.0).max(25.0).optional(),
  scores: z.array(
    z.number()
      .min(0, "Score must be at least 0")
      .max(900, "Score cannot exceed 900")
      .refine((val) => val % 10 === 0, "Score must be in increments of 10")
  ).length(5),
  notes: z.string().max(500).optional(),
});

type SessionForm = z.infer<typeof sessionSchema>;

export default function ScoreSubmissionForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedState, setSelectedState] = useState<string>("");


  const form = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      playerName: "",
      venueName: "",
      scores: [0, 0, 0, 0, 0],
      notes: "",
    },
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["/api/venues", selectedState],
    enabled: !!selectedState && selectedState !== "OTHER",
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionForm) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🎯 SESSION SUBMITTED!",
        description: "Your scores have been recorded. Keep rolling!",
      });
      playRetroSound("success");
      form.reset();
      setPhotoFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
    },
    onError: () => {
      toast({
        title: "❌ SUBMISSION FAILED",
        description: "Please check your scores and try again.",
        variant: "destructive",
      });
      playRetroSound("error");
    },
  });

  const scores = form.watch("scores");
  const sessionTotal = calculateSessionTotal(scores);

  const onSubmit = (data: SessionForm) => {
    // Store player name for future sessions
    localStorage.setItem("lastPlayerName", data.playerName);
    
    createSessionMutation.mutate(data);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      playRetroSound("submit");
    }
  };

  return (
    <section className="bg-slate-800/50 border-2 border-cyan-400 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-center text-cyan-400 mb-6 neon-text">SUBMIT SESSION</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="playerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-gray-300">PLAYER NAME</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="retro-input font-mono text-sm"
                    placeholder="ENTER NAME"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="venueName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-gray-300">VENUE NAME</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="retro-input font-mono text-sm"
                    placeholder="ENTER VENUE NAME"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-gray-400 mt-1">ENTER THE ARCADE OR BAR NAME</div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-gray-300">CITY</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="retro-input font-mono text-sm"
                    placeholder="ENTER CITY NAME"
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-gray-400 mt-1">WHICH CITY IS THIS VENUE LOCATED IN</div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentARMRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-gray-300">CURRENT ARM RATING (OPTIONAL)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="decimal"
                    className="retro-input font-mono text-sm"
                    placeholder="10.0"
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      if (value === '') {
                        field.onChange(undefined);
                        return;
                      }
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 7.0 && numValue <= 25.0) {
                        field.onChange(numValue);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-gray-400 mt-1">ENTER IF YOU ALREADY HAVE AN ARM RATING (7.0-25.0)</div>
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="text-xs text-gray-300 mb-3 block">5 GAME SCORES</FormLabel>
            <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-cyan-400 mb-1 font-mono">G{index + 1}</div>
                  <FormField
                    control={form.control}
                    name={`scores.${index}`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="retro-input text-center font-mono text-sm h-12 w-full focus:ring-2 focus:ring-cyan-400"
                            placeholder="0"
                            value={field.value || ""}
                            onChange={(e) => {
                              let value = e.target.value.replace(/[^0-9]/g, '');
                              if (value === '') {
                                field.onChange(0);
                                return;
                              }
                              let numValue = parseInt(value);
                              
                              // Allow any input during typing, validate on blur
                              if (numValue <= 900) {
                                field.onChange(numValue);
                              }
                            }}
                            onBlur={(e) => {
                              let value = parseInt(e.target.value) || 0;
                              // Round to nearest 10 and cap at 900
                              value = Math.min(Math.round(value / 10) * 10, 900);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">ENTER SCORES 0-900 IN INCREMENTS OF 10</div>
          </div>

          <div className="bg-slate-900/80 border border-cyan-400 p-3 rounded text-center">
            <div className="text-xs text-gray-300 mb-1">YOUR ARM RATING WILL BE CALCULATED</div>
            <div className="text-lg text-cyan-400 font-mono">
              AFTER SUBMISSION
            </div>
            <div className="text-xs text-gray-400 mt-1">BASED ON YOUR GAME SCORES</div>
          </div>



          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-gray-300">NOTES (OPTIONAL)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="retro-input font-mono text-sm h-20 resize-none"
                    placeholder="MACHINE NOTES, TOURNAMENT INFO, ETC..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="retro-button w-full py-4 font-mono text-sm rounded hover:animate-glow"
            disabled={createSessionMutation.isPending}
          >
            <Upload className="mr-2" size={16} />
            {createSessionMutation.isPending ? "SUBMITTING..." : "SUBMIT SESSION"}
          </Button>
        </form>
      </Form>
    </section>
  );
}
