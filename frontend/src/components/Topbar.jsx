import React, { useState } from 'react';
import Icon from './Icons';
import HelpModal from './HelpModal';
import UserMenu from './UserMenu';

// A small functional component for icon buttons
const IconButton = ({ icon, onClick, badge, className }) => (
  <button
    onClick={onClick}
    className={`relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors ${className}`}
  >
    <Icon name={icon} size={20} />
    {badge && (
      <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-darkpanel bg-red-500" />
    )}
  </button>
);

const Topbar = ({ theme, openSettings }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-darkpanel border-b border-gray-200 dark:border-gray-800 h-16 px-6 flex items-center justify-between transition-colors duration-300 z-20">
        {/* Left: Brand / Breadcrumb placeholder */}
        <div
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <span className="text-white font-bold text-xs">AL</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            AutoML <span className="text-cyan-600 dark:text-cyan-400 font-bold">LAB</span>
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Help */}
          <IconButton
            icon="help"
            onClick={() => setIsHelpOpen(true)}
            className="text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          />

          {/* Notifications */}
          <IconButton icon="bell" badge onClick={() => { }} />

          {/* Settings */}
          <IconButton icon="settings" onClick={openSettings} />

          {/* User Menu Trigger (Auth & Identity Anchor) */}
          <div className="ml-2 pl-4 border-l border-gray-200 dark:border-gray-700">
            <UserMenu />
          </div>
        </div>
      </header>

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};

export default Topbar;
