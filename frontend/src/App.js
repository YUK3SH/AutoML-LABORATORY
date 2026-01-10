import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import NavbarHome from "./components/NavbarHome";

import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import H2OPage from "./pages/H2OPage";
import ResultsPage from "./pages/ResultsPage";
import Instruction from "./pages/Instruction";
import SystemLogs from "./pages/SystemLogs";
import BenchmarkPage from "./pages/BenchmarkPage";

function AppShell({ lastResult, setLastResult }) {
  const location = useLocation();
  const [theme, setTheme] = useState("dark");

  const isHome = location.pathname === "/";

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div className="flex flex-col h-screen">
      {isHome ? (
        <NavbarHome />
      ) : (
        <Topbar theme={theme} toggleTheme={toggleTheme} />
      )}

      <div className="flex flex-1 overflow-hidden">
        {!isHome && <Sidebar />}

        <main
          className={`flex-1 overflow-y-auto ${
            isHome ? "" : "p-6 bg-gray-100 dark:bg-gray-900"
          }`}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />

            {/* 🔥 SELECT & RUN */}
            <Route
              path="/h2o"
              element={<H2OPage setLastResult={setLastResult} />}
            />

            {/* 🔥 RESULTS PAGE */}
            <Route
              path="/results"
              element={<ResultsPage data={lastResult} />}
            />

            <Route path="/benchmark" element={<BenchmarkPage />} />
            <Route path="/instruction" element={<Instruction />} />
            <Route path="/system-logs" element={<SystemLogs />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [lastResult, setLastResult] = useState(null);

  return (
    <Router>
      <AppShell
        lastResult={lastResult}
        setLastResult={setLastResult}
      />
    </Router>
  );
}
