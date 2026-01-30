import React, { useState } from 'react';
import Icon from './Icons';
import Button from './Button';

const SettingsModal = ({ isOpen, onClose, theme, setTheme }) => {
    const [activeTab, setActiveTab] = useState('general');

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'automl', label: 'AutoML Prefs', icon: 'beaker' },
        { id: 'compute', label: 'Compute', icon: 'play' },
        { id: 'account', label: 'Account', icon: 'user' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {['light', 'dark', 'system'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setTheme(mode)}
                                        className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${theme === mode
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <span className="capitalize font-semibold">{mode}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">UI Preferences</h3>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">Reduced Motion</div>
                                    <div className="text-xs text-gray-500">Disable animations for faster performance</div>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'automl':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Defaults</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Metric</label>
                                    <select className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-darkbg text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5">
                                        <option>AUC (Area Under Curve)</option>
                                        <option>RMSE (Root Mean Squared Error)</option>
                                        <option>LogLoss</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Algorithm Selection</label>
                                    <div className="space-y-2">
                                        {['XGBoost', 'GBM', 'Deep Learning', 'GLM'].map(algo => (
                                            <label key={algo} className="flex items-center space-x-2">
                                                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{algo}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'compute':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Resource Allocation</h3>
                            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 mb-4">
                                <div className="flex items-start gap-3">
                                    <Icon name="play" className="text-orange-500 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-orange-800 dark:text-orange-300 text-sm">Simulation Mode</h4>
                                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                            These settings affect the simulation of the AutoML process in this demo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Training Speed vs. Accuracy</label>
                                    <input type="range" min="1" max="5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Fastest (Lower Accuracy)</span>
                                        <span>Balanced</span>
                                        <span>Most Accurate (Slow)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'account':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold font-mono">
                                U
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Demo User</h3>
                                <p className="text-gray-500 dark:text-gray-400">user@example.com</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                                    Pro Plan
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Danger Zone</h4>
                            <Button variant="danger" fullWidth>Delete Account</Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-darkpanel w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-56 bg-gray-50 dark:bg-darkbg border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h2>
                    </div>
                    <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Icon name={tab.icon} size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50">
                        <Button onClick={onClose} variant="secondary">Done</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
