import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Load from localStorage OR default to light
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
      html.style.backgroundColor = "#0f0f0f"; // optional
    } else {
      html.classList.remove("dark");
      html.style.backgroundColor = "#ffffff"; // optional
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
