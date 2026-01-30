import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

export default function Experiments() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [experiments, setExperiments] = useState([]);

    useEffect(() => {
        setExperiments(MockData.getExperiments());
    }, []);

    const handleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const filtered = experiments.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.project && e.project.toLowerCase().includes(search.toLowerCase()))
    );

    const hasExperiments = experiments.length > 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Experiments</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor training progress and compare models.</p>
                </div>

                {/* Search & Actions */}
                {hasExperiments && (
                    <div className="flex gap-3 w-full md:w-auto items-center">
                        <div className="relative flex-1 md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Icon name="search" size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search experiments..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-darkpanel text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {selected.length >= 2 && (
                            <button
                                onClick={() => navigate('/compare', { state: { experimentIds: selected } })}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-darkpanel border border-cyan-500 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all animate-scale-in font-medium shadow-sm"
                            >
                                <Icon name="beaker" size={16} />
                                <span>Compare ({selected.length})</span>
                            </button>
                        )}

                        {selected.length < 2 && (
                            <button
                                onClick={() => navigate('/run-experiment')}
                                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
                            >
                                <Icon name="play" size={18} fill="currentColor" />
                                <span className="font-semibold">Run Experiment</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table or Empty State */}
            {!hasExperiments ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-darkpanel rounded-2xl border border-gray-200 dark:border-gray-800 animate-slide-up shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Icon name="beaker" size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No experiments run yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
                        Experiments are created when you run AutoML on a dataset.
                    </p>
                    <button
                        onClick={() => navigate('/run-experiment')}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                        <Icon name="play" size={18} fill="currentColor" />
                        <span className="font-medium">Run Your First Experiment</span>
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-darkpanel rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-up">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                                        <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" disabled />
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experiment Name</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accuracy</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filtered.map((exp, idx) => (
                                    <tr
                                        key={exp.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-default"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4 cursor-pointer"
                                                checked={selected.includes(exp.id)}
                                                onChange={() => handleSelect(exp.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{exp.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {exp.project}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                {exp.model}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            {exp.metrics?.accuracy ? (parseFloat(exp.metrics.accuracy) * 100).toFixed(1) + '%' : exp.accuracy}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {exp.duration}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={exp.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => navigate('/results', { state: { experimentId: exp.id } })}
                                                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
