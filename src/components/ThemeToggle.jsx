import { useEffect, useState } from "react";
import "../styles/theme-toggle.css";

export default function ThemeToggle() {
  const [light, setLight] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "light";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (light) {
      cls.add("theme-light");
      cls.remove("theme-dark");
      localStorage.setItem("theme", "light");
    } else {
      cls.remove("theme-light");
      cls.add("theme-dark");
      localStorage.setItem("theme", "dark");
    }
  }, [light]);

  return (
    <button className="theme-toggle" onClick={() => setLight((s) => !s)} aria-label="Toggle theme">
      {light ? "🌤️" : "🌙"}
    </button>
  );
}
