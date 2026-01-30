import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../components/Icons';
import MockData from '../utils/MockData';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalExperiments: 0,
        bestAccuracy: '0%',
        recentActivity: 'None'
    });

    // Performance Trend Data (Mock)
    const [trendData, setTrendData] = useState({ labels: [], values: [] });

    useEffect(() => {
        const projects = MockData.getProjects();
        const experiments = MockData.getExperiments();

        // 1. Workspace Summary Stats
        const accuracies = experiments
            .map(e => parseFloat(e.metrics?.accuracy || 0))
            .filter(a => a > 0);

        const globalBest = accuracies.length > 0 ? Math.max(...accuracies) : 0;

        // Find most recent activity (experiment or project update)
        // For simplicity, using last created experiment
        const lastExp = experiments[0]; // Assuming mock returns sorted or we just take first for now
        const activity = lastExp ? `Running ${lastExp.model}` : 'System Idle';

        setStats({
            totalProjects: projects.length,
            totalExperiments: experiments.length,
            bestAccuracy: (globalBest * 100).toFixed(1) + '%',
            recentActivity: activity
        });

        // 2. Performance Trend (Mocking a global timeline)
        // Group best accuracy by month or just a mock trend
        setTrendData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [0.78, 0.81, 0.83, 0.85, 0.89, globalBest > 0.9 ? globalBest : 0.92]
        });

    }, []);

    const summaryCards = [
        { label: "Total Projects", value: stats.totalProjects, icon: "folder", color: "blue" },
        { label: "Total Experiments", value: stats.totalExperiments, icon: "beaker", color: "purple" },
        { label: "Global Best Accuracy", value: stats.bestAccuracy, icon: "award", color: "green" },
        { label: "Recent Activity", value: stats.recentActivity, icon: "activity", color: "orange", isText: true },
    ];

    // Chart Configuration
    const chartData = {
        labels: trendData.labels,
        datasets: [
            {
                label: 'Global Accuracy Trend',
                data: trendData.values,
                borderColor: 'rgb(6, 182, 212)', // Cyan-500
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                padding: 10,
                cornerRadius: 6,
                callbacks: {
                    label: (context) => ` Accuracy: ${(context.raw * 100).toFixed(1)}%`
                }
            }
        },
        scales: {
            y: {
                min: 0.7,
                max: 1.0,
                grid: { color: 'rgba(200, 200, 200, 0.08)' },
                ticks: {
                    callback: (value) => (value * 100).toFixed(0) + '%',
                    color: '#9ca3af',
                    font: { size: 11 }
                },
                title: {
                    display: true,
                    text: 'Accuracy (%)',
                    color: '#9ca3af',
                    font: { size: 10, weight: 'bold' }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af', font: { size: 11 } },
                title: {
                    display: true,
                    text: 'Timeline',
                    color: '#9ca3af',
                    font: { size: 10, weight: 'bold' }
                }
            },
        },
        interaction: { mode: 'index', intersect: false }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">High-level insights into your AutoML workspace.</p>
            </div>

            {/* Section 1: Workspace Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-darkpanel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400`}>
                                <Icon name={card.icon} size={24} />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                            <h3 className={`text-2xl font-bold text-gray-900 dark:text-white tracking-tight ${card.isText ? 'text-sm truncate mt-1' : ''}`}>
                                {card.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 2: Performance Snapshot */}
                <div className="lg:col-span-2 bg-white dark:bg-darkpanel rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon name="trendingUp" size={20} className="text-cyan-500" />
                            Global Model Accuracy Trend
                        </h3>
                    </div>
                    <div className="h-[320px] w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* Section 3: Quick Actions */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-cyan-900 to-slate-900 rounded-2xl p-6 shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Start New Project</h3>
                        <p className="text-cyan-100/80 text-sm mb-6">Launch a new AutoML experiment from your dataset.</p>
                        <button
                            onClick={() => navigate('/run-experiment')}
                            className="w-full bg-white text-cyan-900 font-bold py-3 rounded-xl hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Icon name="plus" size={18} /> Create Project
                        </button>
                    </div>

                    <div className="bg-white dark:bg-darkpanel rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex-1 flex flex-col justify-center gap-4">
                        <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Quick Navigation</h3>

                        <button
                            onClick={() => navigate('/experiments')}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-2 rounded-lg">
                                    <Icon name="list" size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">View Experiments</p>
                                    <p className="text-xs text-gray-500">Check running jobs</p>
                                </div>
                            </div>
                            <Icon name="chevron" className="rotate-180 text-gray-400 group-hover:text-cyan-500" size={16} />
                        </button>

                        <button
                            onClick={() => navigate('/compare')}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 p-2 rounded-lg">
                                    <Icon name="gitBranch" size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">Compare Models</p>
                                    <p className="text-xs text-gray-500">Analyze performance</p>
                                </div>
                            </div>
                            <Icon name="chevron" className="rotate-180 text-gray-400 group-hover:text-cyan-500" size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
