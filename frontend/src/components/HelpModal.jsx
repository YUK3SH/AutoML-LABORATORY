import React, { useState } from 'react';
import Icon from './Icons';
import Button from './Button';

const HelpModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('projects');

    if (!isOpen) return null;

    const tabs = [
        { id: 'projects', label: 'Projects', icon: 'folder' },
        { id: 'experiments', label: 'Experiments', icon: 'beaker' },
        { id: 'automl', label: 'AutoML Flow', icon: 'play' },
    ];

    const content = {
        projects: (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold dark:text-white">Creating Projects</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Projects are the top-level containers for your machine learning tasks. Each project can contain multiple experiments and datasets.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Quick Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-200">
                        <li>Navigate to the <strong>Projects</strong> page.</li>
                        <li>Click <strong>New Project</strong>.</li>
                        <li>Upload your dataset (CSV, JSON, Parquet).</li>
                        <li>Define your target variable.</li>
                    </ol>
                </div>
            </div>
        ),
        experiments: (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold dark:text-white">Running Experiments</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Experiments allow you to test different algorithms and hyperparameters on your project data.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                        <Icon name="play" size={16} className="mt-1 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">Select a project and click "Run Experiment".</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Icon name="settings" size={16} className="mt-1 text-orange-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">Configure basic settings like run time and metric (AUC, RMSE).</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <Icon name="messageSquare" size={16} className="mt-1 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">Use <strong>Jarvis</strong> to interpret the results automatically.</span>
                    </li>
                </ul>
            </div>
        ),
        automl: (
            <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold dark:text-white">How AutoML Works</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Our H2O-powered backend automatically trains and tunes models.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                        <h5 className="font-semibold text-sm mb-1 dark:text-gray-200">1. Data Prep</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automatic imputation, encoding, and scaling.</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                        <h5 className="font-semibold text-sm mb-1 dark:text-gray-200">2. Model Selection</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">XGBoost, GBM, GLM, Deep Learning, and Stacked Ensembles.</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                        <h5 className="font-semibold text-sm mb-1 dark:text-gray-200">3. Tuning</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Random grid search and Bayesian optimization.</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                        <h5 className="font-semibold text-sm mb-1 dark:text-gray-200">4. Explanation</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Shapley values and Variable Importance plots.</p>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-darkpanel w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-slide-up transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Icon name="help" size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Help & Documentation</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <Icon name="x" size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row min-h-[400px]">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-48 bg-gray-50 dark:bg-darkbg border-r border-gray-200 dark:border-gray-700 p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Icon name={tab.icon} size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 bg-white dark:bg-darkpanel">
                        {content[activeTab]}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-800/50">
                    <Button onClick={onClose} variant="secondary">Close Guide</Button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
