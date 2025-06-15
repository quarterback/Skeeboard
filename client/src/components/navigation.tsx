import { Link, useLocation } from "wouter";
import { Trophy, Crown, User, Target } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "SUBMIT", icon: Target },
    { path: "/leaderboards", label: "RANKS", icon: Trophy },
    { path: "/skeecaptain", label: "CAPTAINS", icon: Crown },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur border-b-2 border-cyan-400">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Target className="text-orange-500 text-xl animate-pulse" />
            <h1 className="text-lg neon-text text-cyan-400">SKEEBOARD</h1>
          </Link>
          <nav className="flex space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <button
                  className={`text-xs px-3 py-2 border transition-all duration-200 flex items-center gap-1 ${
                    location === path
                      ? "bg-cyan-400 text-slate-900 border-cyan-400"
                      : "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
