import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Reports() {
    const [config, setConfig] = useState({
        modelPerformance: true,
        featureImportance: true,
        confusionMatrix: false,
        hyperparameters: true,
        systemLogs: false
    });

    const toggle = (key) => setConfig({ ...config, [key]: !config[key] });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documentation & Reports</h1>
                <div className="space-x-2">
                    <Button variant="secondary">Print</Button>
                    <Button>Export PDF</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

                {/* Configuration Panel */}
                <div className="lg:col-span-1">
                    <Card title="Report Configuration" className="h-full">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select sections to include in the generated report.</p>

                            <div className="space-y-3">
                                {Object.keys(config).map((key) => (
                                    <label key={key} className="flex items-center space-x-3 p-3 rounded-md border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={config[key]}
                                            onChange={() => toggle(key)}
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Export Settings</h4>
                                <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-darkpanel dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    <option>High Quality (Print)</option>
                                    <option>Standard (Screen)</option>
                                    <option>Draft (Grayscale)</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Live Preview */}
                <div className="lg:col-span-2">
                    <Card title="Live Preview" className="h-full flex flex-col" noPadding>
                        <div className="flex-1 bg-gray-100 dark:bg-black/20 p-8 overflow-y-auto">
                            <div className="bg-white text-black shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[20mm]">
                                <div className="border-b-2 border-black pb-4 mb-8">
                                    <h1 className="text-3xl font-bold">AutoML Project Report</h1>
                                    <p className="text-gray-600 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                                </div>

                                <div className="space-y-8">
                                    {config.modelPerformance && (
                                        <section className="border-l-4 border-blue-600 pl-4 animate-fadeIn">
                                            <h2 className="text-xl font-bold mb-2">1. Model Performance</h2>
                                            <p className="text-sm text-gray-600">
                                                The best performing model XGBoost achieved an accuracy of 96.4% on the test set.
                                                Cross-validation results show stable performance across 5 folds.
                                            </p>
                                            <div className="h-32 bg-gray-50 mt-4 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                                [Performance Chart Placeholder]
                                            </div>
                                        </section>
                                    )}

                                    {config.featureImportance && (
                                        <section className="border-l-4 border-green-600 pl-4 animate-fadeIn">
                                            <h2 className="text-xl font-bold mb-2">2. Feature Importance</h2>
                                            <p className="text-sm text-gray-600">
                                                Top predictors for the target variable include "Total Spend", "Last Login", and "Category".
                                            </p>
                                        </section>
                                    )}

                                    {config.confusionMatrix && (
                                        <section className="border-l-4 border-purple-600 pl-4 animate-fadeIn">
                                            <h2 className="text-xl font-bold mb-2">3. Confusion Matrix</h2>
                                            <p className="text-sm text-gray-600">
                                                Detailed breakdown of True Positives and False Negatives.
                                            </p>
                                        </section>
                                    )}

                                    {config.hyperparameters && (
                                        <section className="border-l-4 border-orange-600 pl-4 animate-fadeIn">
                                            <h2 className="text-xl font-bold mb-2">4. Hyperparameters</h2>
                                            <div className="bg-gray-50 p-3 rounded text-xs font-mono mt-2">
                                                learning_rate: 0.01<br />
                                                max_depth: 6<br />
                                                n_estimators: 1000
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
