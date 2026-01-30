import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import SettingsModal from "./components/SettingsModal";

// New Pages
import { LoginPage, SignupPage } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Experiments from "./pages/Experiments";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";
import LandingPage from "./pages/LandingPage";
import LearnMore from "./pages/LearnMore";
import RunExperiment from "./pages/RunExperiment";
import ResultsPage from "./pages/ResultsPage";
import ComparePage from "./pages/ComparePage";

// Legacy Pages
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import H2OPage from "./pages/H2OPage";
import Instruction from "./pages/Instruction";
import SystemLogs from "./pages/SystemLogs";
import BenchmarkPage from "./pages/BenchmarkPage";

import AccessDenied from "./pages/AccessDenied";

// Hook for Auth Status
const useAuth = () => {
  const token = localStorage.getItem("automl_token");
  return !!token;
};

// Wrapper for Public Routes (redirect to Dashboard if logged in)
const PublicRoute = ({ children }) => {
  const isAuth = useAuth();
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Wrapper for Protected Routes (redirect to Login if not logged in)
const ProtectedRoute = ({ children }) => {
  const isAuth = useAuth();
  if (!isAuth) {
    return <AccessDenied />;
  }
  return children;
};

function AppShell({ lastResult, setLastResult }) {
  const [theme, setTheme] = useState("light"); // Default to light per requirements
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();

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

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            {/* New Core Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/projects" element={<Projects />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/experiments/:projectId" element={<Experiments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/run-experiment" element={<RunExperiment />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/compare" element={<ComparePage />} />

            {/* Legacy Routes (Preserved) */}
            <Route path="/home-legacy" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/h2o" element={<H2OPage setLastResult={setLastResult} />} />
            {/* Legacy ResultsPage removed to favor new dynamic one */}
            <Route path="/benchmark" element={<BenchmarkPage />} />
            <Route path="/instruction" element={<Instruction />} />
            <Route path="/system-logs" element={<SystemLogs />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        {/* Protected App Shell */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell lastResult={lastResult} setLastResult={setLastResult} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

