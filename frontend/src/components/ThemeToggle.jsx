import React from "react";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
        isDark
          ? "bg-slate-900/80 text-amber-300 hover:bg-slate-850 hover:text-amber-200 border border-slate-800 shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 shadow-xs"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <SunIcon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-amber-400" />
        ) : (
          <MoonIcon className="w-4 h-4 transition-transform duration-300 -rotate-12 scale-100 text-indigo-600" />
        )}
      </div>
      {showLabel && (
        <span className="hidden sm:inline-block">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
