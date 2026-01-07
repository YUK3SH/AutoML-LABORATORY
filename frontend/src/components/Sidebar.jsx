import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const NavItem = ({ to, label }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`block px-4 py-2 rounded-md mb-1 text-sm transition ${
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 h-screen bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 py-6 px-4">

      <div className="mb-6">
        <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
          Dataset
        </p>
        <NavItem to="/upload" label="Upload Dataset" />
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 mb-2">
          ML Tools
        </p>
        <NavItem to="/instruction" label="Instruction" />
        <NavItem to="/h2o" label="Select / Run" />
        <NavItem to="/results" label="Result" />
      </div>

    </aside>
  );
}

export default Sidebar;
