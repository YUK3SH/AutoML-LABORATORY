import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icons";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  // Mock User Data
  const [user] = useState(JSON.parse(localStorage.getItem('automl_user') || '{"name":"User","email":"user@example.com"}'));

  const handleLogout = () => {
    localStorage.removeItem('automl_token');
    localStorage.removeItem('automl_user');
    navigate('/login');
  };

  const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard", icon: "home" },
    { label: "Projects", path: "/projects", icon: "folder" },
    { label: "Experiments", path: "/experiments", icon: "beaker" },
    { label: "Reports", path: "/reports", icon: "book" },
    { label: "Jarvis", path: "/chat", icon: "messageSquare" },
  ];

  const NavItem = ({ to, label, icon }) => {
    // Exact match for root, startsWith for others to handle sub-routes if any
    const active = location.pathname.startsWith(to);

    return (
      <Link
        to={to}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200 ${active
            ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 dark:text-cyan-400 shadow-sm border border-cyan-100 dark:border-cyan-900/30"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
      >
        <span className={`transition-colors duration-200 ${active ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`}>
          <Icon name={icon} size={18} />
        </span>
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-darkpanel border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300 relative z-10 font-sans">
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 mt-2">
          Platform
        </p>

        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} to={item.path} label={item.label} icon={item.icon} />
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-200 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
        >
          <Icon name="logout" size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
