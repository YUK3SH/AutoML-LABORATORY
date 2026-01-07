import React from "react";

export default function Topbar({ theme, toggleTheme }) {
  return (
    <header
      className="w-full border-b px-6 py-3 flex items-center justify-between
                 bg-white dark:bg-[#0d1117]
                 border-gray-200 dark:border-gray-800"
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          AutoML Platform
        </span>
      </div>

      {/* Right: Theme + Auth */}
      <div className="flex items-center space-x-4">

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full
                     bg-gray-200 dark:bg-gray-700
                     hover:scale-105 transition"
        >
          {theme === "dark" ? (
            <span className="text-yellow-300 text-lg">☀️</span>
          ) : (
            <span className="text-gray-900 text-lg">🌙</span>
          )}
        </button>

        {/* Login */}
        <button
          className="text-sm px-3 py-1 rounded-lg border
                     border-gray-400 dark:border-gray-600
                     text-gray-800 dark:text-gray-200"
        >
          Log in
        </button>

        {/* Sign up */}
        <button
          className="text-sm px-4 py-1 rounded-lg bg-blue-600
                     text-white shadow-sm hover:bg-blue-700 transition"
        >
          Sign up
        </button>
      </div>
    </header>
  );
}
