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
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={toggleAccessibilityMode}
        variant="outline"
        size="sm"
        className="accessibility-toggle bg-slate-800/90 border-2 hover:bg-slate-700/90 text-white"
        title={isAccessibilityMode ? "Disable high contrast mode" : "Enable high contrast mode"}
      >
        {isAccessibilityMode ? (
          <>
            <EyeOff className="w-4 h-4 mr-2" />
            HIGH CONTRAST
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-2" />
            ACCESSIBILITY
          </>
        )}
      </Button>
    </div>
  );
}