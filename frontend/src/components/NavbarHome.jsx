import React from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";

export default function NavbarHome() {
  const location = useLocation();

  // Helper to determine transparency based on Scroll or Page (Simplified for now)
  // In a real implementation we might use a scroll hook

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-6 transition-all duration-300">

      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <span className="text-white font-bold text-xs">AL</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">
          AutoML <span className="text-cyan-400 font-light">Laboratory</span>
        </span>
      </Link>

      {/* Nav Link & Actions */}
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Link to="/learn-more" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Learn More
          </Link>
        </nav>

        <Link to="/login">
          <button className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm font-semibold transition-all hover:scale-105 hover:border-white/40 shadow-lg">
            Sign In
          </button>
        </Link>
      </div>
    </header>
  );
}
