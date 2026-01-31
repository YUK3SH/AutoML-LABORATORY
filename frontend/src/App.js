import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import SettingsModal from "./components/SettingsModal";

// New Pages
import { LoginPage, SignupPage } from "./pages/Auth";
import JarvisPage from "./pages/JarvisPage";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Experiments from "./pages/Experiments";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";
import LandingPage from "./pages/LandingPage";
import RunExperiment from "./pages/RunExperiment";
import ResultsPage from "./pages/ResultsPage";
import ComparePage from "./pages/ComparePage";

// Legacy Pages
import UploadPage from "./pages/UploadPage";
import H2OPage from "./pages/H2OPage";
import Instruction from "./pages/Instruction";
import SystemLogs from "./pages/SystemLogs";
import BenchmarkPage from "./pages/BenchmarkPage";

// Hook for Auth Status
const useAuth = () => {
  const token = localStorage.getItem("automl_token");
  return !!token;
};

// Wrapper for Public Routes (redirect to Jarvis if logged in)
const PublicRoute = ({ children }) => {
  const isAuth = useAuth();
  if (isAuth) {
    return <Navigate to="/jarvis" replace />;
  }
  return children;
};

// Wrapper for Protected Routes (redirect to Login if not logged in)
const ProtectedRoute = ({ children }) => {
  const isAuth = useAuth();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppShell() {
  const [theme, setTheme] = useState("light");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (mode) => {
    document.documentElement.classList.remove('dark', 'light');
    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-darkbg text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Topbar
        theme={theme}
        openSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={handleThemeChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black main-content-area">
          <Routes>
            {/* Core Workflow */}
            <Route path="/jarvis" element={<JarvisPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />

            {/* Project Isolation & Experiment Routes */}
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/experiments/:projectId" element={<Experiments />} />

            <Route path="/reports" element={<Reports />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/run-experiment" element={<RunExperiment />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/compare" element={<ComparePage />} />

            {/* Legacy Routes (Preserved but isolated) */}
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/h2o" element={<H2OPage />} />
            <Route path="/benchmark" element={<BenchmarkPage />} />
            <Route path="/instruction" element={<Instruction />} />
            <Route path="/system-logs" element={<SystemLogs />} />

            {/* Fallback for protected routes */}
            <Route path="*" element={<Navigate to="/jarvis" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Safe from Auth) */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        {/* LearnMore, About, Pricing now sections in LandingPage */}

        {/* Auth Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected App Shell for everything else */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

