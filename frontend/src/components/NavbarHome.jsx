import React from "react";

export default function NavbarHome() {
  return (
    <header className="backdrop-blur-md bg-white/40 dark:bg-black/40 border-b border-white/20 dark:border-white/10
                       fixed top-0 left-0 w-full px-10 py-4 flex items-center justify-between z-[50]">

      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200 tracking-wide">
          AutoML Platform
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300 font-medium">
        <button className="hover:text-blue-600 transition">Contact</button>
        <button className="px-4 py-1.5 rounded-lg border dark:border-gray-600 hover:bg-gray-200/40 
                           dark:hover:bg-gray-700 transition">
          Log in
        </button>
        <button className="px-5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">
          Sign up
        </button>
      </div>
    </header>
  );
}
