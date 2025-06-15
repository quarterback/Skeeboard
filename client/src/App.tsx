import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import Leaderboards from "@/pages/leaderboards";
import SkeecaptainApplication from "@/pages/skeecaptain-application";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/leaderboards" component={Leaderboards} />
        <Route path="/skeecaptain" component={SkeecaptainApplication} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Footer */}
      <footer className="bg-slate-800/30 border-t border-cyan-400 mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <button className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">ABOUT</button>
            <button className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">RULES</button>
            <button className="text-xs text-gray-400 hover:text-cyan-400 transition-colors">CONTACT</button>
          </div>
          <div className="text-xs text-gray-500">
            SKEEBOARD &copy; 2024 | THE ULTIMATE SKEEBALL RANKING SYSTEM
          </div>
          <div className="text-xs text-gray-600 mt-2">
            ADD TO HOME SCREEN FOR BEST EXPERIENCE
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
