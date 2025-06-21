import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessibilityToggle() {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem("accessibilityMode");
    if (saved === "true") {
      setIsAccessibilityMode(true);
      document.documentElement.classList.add("accessibility-mode");
    }
  }, []);

  const toggleAccessibilityMode = () => {
    const newMode = !isAccessibilityMode;
    setIsAccessibilityMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("accessibility-mode");
    } else {
      document.documentElement.classList.remove("accessibility-mode");
    }
    
    localStorage.setItem("accessibilityMode", newMode.toString());
  };

  return (
    <Button
      onClick={toggleAccessibilityMode}
      variant="outline"
      size="sm"
      className="accessibility-toggle bg-slate-800/90 border border-cyan-400 hover:bg-slate-700/90 text-cyan-400 text-xs px-2 py-1"
      title={isAccessibilityMode ? "Disable high contrast mode" : "Enable high contrast mode"}
    >
      {isAccessibilityMode ? (
        <EyeOff className="w-3 h-3" />
      ) : (
        <Eye className="w-3 h-3" />
      )}
    </Button>
  );
}