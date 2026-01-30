import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

export default function Experiments() {
    const navigate = useNavigate();
    const { projectId } = useParams();

    // State
    const [experiments, setExperiments] = useState([]);
    const [projectName, setProjectName] = useState(null);
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    useEffect(() => {
        // Fetch all experiments
        const allExperiments = MockData.getExperiments();

        if (projectId) {
            // Filter by Project
            const projectExperiments = allExperiments.filter(e => e.projectId === projectId || e.project === projectId);
            setExperiments(projectExperiments);

            // Get Project Name
            const projects = MockData.getProjects();
            const currentProject = projects.find(p => p.id === projectId);
            setProjectName(currentProject ? currentProject.name : "Unknown Project");

            // Clear selection when switching views (User Requirement)
            setSelected([]);
        } else {
            // Global View
            setExperiments(allExperiments);
            setProjectName(null);
            setSelected([]);
        }
    }, [projectId]);

    const handleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Derived State
    const filtered = experiments.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.model && e.model.toLowerCase().includes(search.toLowerCase()))
    );

    const sorted = [...filtered].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested metrics if sorting by metric
        if (['accuracy', 'precision', 'recall', 'f1'].includes(sortConfig.key)) {
            aVal = parseFloat(a.metrics?.[sortConfig.key] || 0);
            bVal = parseFloat(b.metrics?.[sortConfig.key] || 0);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const hasExperiments = experiments.length > 0;

    // Helper for table headers
    const SortableHeader = ({ label, sortKey, align = "left" }) => (
        <th
            scope="col"
            className={`px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-cyan-600 transition-colors text-${align}`}
            onClick={() => handleSort(sortKey)}
        >
            <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
                {label}
                {sortConfig.key === sortKey && (
                    <Icon name={sortConfig.direction === 'asc' ? 'chevronUp' : 'chevron'} size={12} />
                )}
            </div>
        </th>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        {projectId && (
                            <button onClick={() => navigate('/projects')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                                <Icon name="chevron" className="rotate-180" size={24} />
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {projectId ? projectName : 'Global Experiments'}
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 ml-1">
                        {projectId
                            ? 'Isolated view for this project.'
                            : 'All experiments across all projects.'}
                    </p>
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
                                placeholder="Search models..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-darkpanel text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {selected.length >= 2 && (
                            <button
                                onClick={() => navigate('/compare', { state: { experimentIds: selected } })}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-darkpanel border border-cyan-500 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all animate-scale-in font-medium shadow-sm"
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
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-darkpanel rounded-2xl border border-gray-200 dark:border-gray-800 animate-slide-up shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Icon name="beaker" size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No experiments found {projectId ? 'in this project' : ''}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
                        Start a new training run to see results here.
                    </p>
                    <button
                        onClick={() => navigate('/run-experiment')}
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all"
                    >
                        <Icon name="play" size={18} fill="currentColor" />
                        <span className="font-medium">Run Experiment</span>
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-darkpanel rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-slide-up">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 w-10">
                                        <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" disabled />
                                    </th>
                                    <SortableHeader label="Experiment" sortKey="name" />
                                    {!projectId && <SortableHeader label="Project" sortKey="project" />}
                                    <SortableHeader label="Engine" sortKey="model" />
                                    <SortableHeader label="Accuracy" sortKey="accuracy" />
                                    <SortableHeader label="F1 Score" sortKey="f1" />
                                    <SortableHeader label="Precision" sortKey="precision" />
                                    <SortableHeader label="Status" sortKey="status" />
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {sorted.map((exp, idx) => (
                                    <tr
                                        key={exp.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group cursor-default"
                                        style={{ animationDelay: `${idx * 30}ms` }}
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
                                            <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {exp.name}
                                            </span>
                                            <span className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString()}</span>
                                        </td>

                                        {!projectId && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {exp.project}
                                            </td>
                                        )}

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                                                {exp.model}
                                            </span>
                                        </td>

                                        {/* Metrics Columns */}
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-gray-900 dark:text-white">
                                            {exp.metrics?.accuracy ? (parseFloat(exp.metrics.accuracy) * 100).toFixed(1) + '%' : '--'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600 dark:text-gray-300">
                                            {exp.metrics?.f1 ? parseFloat(exp.metrics.f1).toFixed(3) : '--'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600 dark:text-gray-300">
                                            {exp.metrics?.precision ? parseFloat(exp.metrics.precision).toFixed(3) : '--'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge status={exp.status} />
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => navigate('/results', { state: { experimentId: exp.id } })}
                                                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors"
                                            >
                                                View Report
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
