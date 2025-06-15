import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Crown, Send, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { playRetroSound } from "@/lib/utils";

const applicationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required").max(255),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(10),
  venueList: z.string().min(10, "Please list at least a few venues with details"),
  experience: z.string().min(10, "Please describe your skeeball experience"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function SkeecaptainApplication() {
  const { toast } = useToast();

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      city: "",
      state: "",
      venueList: "",
      experience: "",
    },
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      const response = await apiRequest("POST", "/api/skeecaptain/apply", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "👑 APPLICATION SUBMITTED!",
        description: "We'll review your application and get back to you soon!",
      });
      playRetroSound("success");
      form.reset();
    },
    onError: () => {
      toast({
        title: "❌ SUBMISSION FAILED",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
      playRetroSound("error");
    },
  });

  const onSubmit = (data: ApplicationForm) => {
    submitApplicationMutation.mutate(data);
  };

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      {/* Hero Section */}
      <section className="text-center py-8 animate-slide-up">
        <Crown className="text-yellow-400 text-4xl mb-4 mx-auto animate-pulse" />
        <h2 className="text-2xl mb-4 neon-text text-yellow-400">BECOME A SKEECAPTAIN</h2>
        <p className="text-sm text-gray-300 max-w-lg mx-auto leading-relaxed mb-6">
          Help expand Skeeboard to your region! Skeecaptains verify venues, moderate scores, 
          and build the local skeeball community.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-800/50 border border-cyan-400 rounded-lg p-6 max-w-lg mx-auto">
        <h3 className="text-cyan-400 mb-4 neon-text text-center">SKEECAPTAIN BENEFITS</h3>
        <ul className="text-xs text-gray-300 space-y-2">
          <li className="flex items-center gap-2">
            <MapPin size={12} className="text-green-400" />
            Add and verify venues in your city
          </li>
          <li className="flex items-center gap-2">
            <Crown size={12} className="text-yellow-400" />
            Special Skeecaptain badge and recognition
          </li>
          <li className="flex items-center gap-2">
            <Crown size={12} className="text-orange-500" />
            Help moderate suspicious scores
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={12} className="text-cyan-400" />
            Build the local skeeball community
          </li>
        </ul>
      </section>

      {/* Application Form */}
      <section className="bg-slate-800/50 border-2 border-yellow-400 rounded-lg p-6 max-w-lg mx-auto">
        <h3 className="text-center text-yellow-400 mb-6 neon-text">APPLICATION FORM</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-300">FULL NAME</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="retro-input font-mono text-sm"
                        placeholder="YOUR NAME"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-300">EMAIL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="retro-input font-mono text-sm"
                        placeholder="YOUR@EMAIL.COM"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-300">CITY</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="retro-input font-mono text-sm"
                        placeholder="YOUR CITY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-300">STATE</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="retro-input font-mono text-sm"
                        placeholder="STATE CODE"
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venueList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-gray-300">SKEEBALL VENUES IN YOUR AREA</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="retro-input font-mono text-sm h-24 resize-none"
                      placeholder="List venues with skeeball machines in your city. Include names, addresses, and any notes about machine conditions..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-gray-300">SKEEBALL EXPERIENCE</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="retro-input font-mono text-sm h-24 resize-none"
                      placeholder="Tell us about your skeeball experience, involvement in local arcade communities, and why you'd be a good Skeecaptain..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="retro-button w-full py-4 font-mono text-sm rounded hover:animate-glow"
              disabled={submitApplicationMutation.isPending}
            >
              <Send className="mr-2" size={16} />
              {submitApplicationMutation.isPending ? "SUBMITTING..." : "SUBMIT APPLICATION"}
            </Button>
          </form>
        </Form>
      </section>

      {/* Requirements */}
      <section className="max-w-lg mx-auto">
        <h3 className="text-center text-orange-500 mb-4 neon-text">REQUIREMENTS</h3>
        <div className="grid grid-cols-1 gap-3 text-xs text-gray-300">
          <div className="bg-slate-800/30 border border-gray-600 rounded p-3">
            <div className="text-cyan-400 font-bold mb-1">LIVE IN THE AREA</div>
            <div>Must be a local resident who can visit venues regularly</div>
          </div>
          <div className="bg-slate-800/30 border border-gray-600 rounded p-3">
            <div className="text-green-400 font-bold mb-1">KNOW THE VENUES</div>
            <div>Familiar with local arcade scene and skeeball locations</div>
          </div>
          <div className="bg-slate-800/30 border border-gray-600 rounded p-3">
            <div className="text-yellow-400 font-bold mb-1">WEEKLY COMMITMENT</div>
            <div>Check in weekly to verify scores and moderate submissions</div>
          </div>
        </div>
      </section>
    </main>
  );
}
