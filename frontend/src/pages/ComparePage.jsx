import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ComparePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState([]);

    useEffect(() => {
        const ids = location.state?.experimentIds || [];
        if (ids.length === 0) {
            navigate('/experiments');
            return;
        }

        const all = MockData.getExperiments();
        // Preserve selection order to keep Baseline as first selected
        const selected = ids.map(id => all.find(e => e.id === id)).filter(Boolean);
        setExperiments(selected);
    }, [location, navigate]);

    if (experiments.length === 0) return null;

    // --- Logic Helpers ---

    const getMetricValue = (exp, key) => parseFloat(exp.metrics?.[key] || 0);

    const getBestValue = (metricKey) => {
        const values = experiments.map(e => getMetricValue(e, metricKey));
        const lowerIsBetter = ['training_time_sec', 'loss'].includes(metricKey);
        return lowerIsBetter ? Math.min(...values) : Math.max(...values);
    };

    const isBest = (val, metricKey) => {
        const best = getBestValue(metricKey);
        // Compare with small epsilon for floats
        return Math.abs(parseFloat(val) - best) < 0.0001;
    };

    // --- Mock Confusion Matrix Generator ---
    const getConfusionMatrix = (accuracy) => {
        // Deterministic mock based on accuracy and model name hash? simpler to use accuracy
        const total = 100;
        const correct = Math.round(total * accuracy);
        const wrong = total - correct;

        // Split correct into TP/TN (approx 50/50 split)
        const tp = Math.round(correct * 0.55);
        const tn = correct - tp;

        // Split wrong into FP/FN
        const fp = Math.round(wrong * 0.6);
        const fn = wrong - fp;

        return { tp, tn, fp, fn };
    };

    // --- Chart Data ---
    const chartData = {
        labels: experiments.map(e => e.model),
        datasets: [
            {
                label: 'Accuracy',
                data: experiments.map(e => parseFloat(e.metrics?.accuracy || 0)),
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
            {
                label: 'F1 Score',
                data: experiments.map(e => parseFloat(e.metrics?.f1 || 0)),
                backgroundColor: 'rgba(168, 85, 247, 0.7)', // Purple
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#9ca3af' } },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 1.0,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
            }
        }
    };

    const metricsMap = [
        { key: 'accuracy', label: 'Accuracy', isPercent: true },
        { key: 'precision', label: 'Precision', isPercent: true },
        { key: 'recall', label: 'Recall', isPercent: true },
        { key: 'f1', label: 'F1 Score', isPercent: true },
        { key: 'loss', label: 'Loss', isPercent: false },
        { key: 'training_time_sec', label: 'Train Time (s)', isPercent: false },
    ];

    return (
        <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 space-y-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                    <Icon name="chevron" className="rotate-180" size={16} />
                    <span>Back to Experiments</span>
                </button>
            </div>

            {/* 1. Benchmark Comparison Table (Dark Aesthetic) */}
            <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] shadow-2xl ring-1 ring-white/5">
                <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]">
                    <h2 className="text-lg font-bold text-[#58a6ff] flex items-center gap-2">
                        AutoML Benchmark Comparison
                    </h2>
                    <span className="text-xs font-mono text-gray-500">LIVE METRICS</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm font-mono border-collapse">
                        <thead>
                            <tr className="bg-[#161b22] text-[#8b949e]">
                                <th className="px-6 py-4 text-left border-r border-[#30363d] uppercase tracking-wider w-[180px]">Metric</th>
                                {experiments.map((exp, idx) => (
                                    <th key={exp.id} className="px-6 py-4 text-center border-r border-[#30363d] min-w-[160px]">
                                        <div className={`font-bold text-lg mb-1 ${idx === 0 ? 'text-[#58a6ff]' : 'text-white'}`}>
                                            {exp.model}
                                        </div>
                                        {idx === 0 && <span className="text-[10px] bg-[#1f6feb]/20 text-[#58a6ff] px-2 py-0.5 rounded border border-[#1f6feb]/50">BASELINE</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363d]">
                            {/* Model ID Row */}
                            <tr className="bg-[#0d1117] hover:bg-[#161b22] transition-colors">
                                <td className="px-6 py-4 text-[#8b949e] border-r border-[#30363d]">MODEL ID</td>
                                {experiments.map(exp => (
                                    <td key={exp.id} className="px-6 py-4 text-center text-[#8b949e] border-r border-[#30363d] text-xs">
                                        {String(exp.id).slice(-8)}
                                    </td>
                                ))}
                            </tr>

                            {metricsMap.map((m) => (
                                <tr key={m.key} className="bg-[#0d1117] hover:bg-[#161b22] transition-colors group">
                                    <td className="px-6 py-4 text-[#c9d1d9] border-r border-[#30363d] font-bold uppercase">
                                        {m.label}
                                    </td>
                                    {experiments.map((exp, idx) => {
                                        const val = getMetricValue(exp, m.key);
                                        const best = isBest(val, m.key);

                                        // Specific User Style: Green/Red Arrows + Text Color
                                        const baselineVal = getMetricValue(experiments[0], m.key);
                                        const diff = val - baselineVal;
                                        const lowerIsBetter = ['training_time_sec', 'loss'].includes(m.key);

                                        let isPositive = false;
                                        if (lowerIsBetter) isPositive = diff < 0;
                                        else isPositive = diff > 0;

                                        const isBaseline = idx === 0;
                                        const hasDiff = Math.abs(diff) > 0.0001;

                                        let cellTextColor = 'text-white';
                                        if (!isBaseline && hasDiff) {
                                            cellTextColor = isPositive ? 'text-[#3fb950]' : 'text-[#f85149]';
                                        }

                                        return (
                                            <td key={exp.id} className={`px-6 py-4 text-center border-r border-[#30363d] relative ${best ? 'bg-[#58a6ff]/5' : ''}`}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`text-base ${cellTextColor}`}>
                                                        {m.isPercent ? (val * 100).toFixed(2) + ' %' : val}
                                                    </span>
                                                    {!isBaseline && hasDiff && (
                                                        <span className={isPositive ? 'text-[#3fb950]' : 'text-[#f85149]'}>
                                                            {isPositive ? '▲' : '▼'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. Graphical & Confusion Matrix Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Performance Chart */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 shadow-xl">
                    <h3 className="text-[#c9d1d9] font-bold mb-6 flex items-center gap-2">
                        <Icon name="activity" className="text-[#58a6ff]" size={18} /> Metric Distribution
                    </h3>
                    <div className="h-[300px] w-full">
                        <Bar data={chartData} options={{
                            ...chartOptions,
                            scales: {
                                y: { ...chartOptions.scales.y, grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
                                x: { ...chartOptions.scales.x, ticks: { color: '#8b949e' } }
                            },
                            plugins: { legend: { display: true, labels: { color: '#c9d1d9' } } }
                        }} />
                    </div>
                </div>

                {/* Confusion Matrix Comparison */}
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-6 shadow-xl">
                    <h3 className="text-[#c9d1d9] font-bold mb-6 flex items-center gap-2">
                        <Icon name="grid" className="text-[#a371f7]" size={18} /> Confusion Matrix Snapshot (Top 2)
                    </h3>
                    <div className="grid grid-cols-2 gap-4 h-[300px]">
                        {experiments.slice(0, 2).map((exp, idx) => {
                            const cm = getConfusionMatrix(exp.metrics?.accuracy || 0.85);
                            return (
                                <div key={exp.id} className="flex flex-col h-full border border-[#30363d] rounded-lg p-2 bg-[#161b22]">
                                    <div className="text-center mb-2 text-xs font-bold text-[#8b949e] uppercase tracking-wider">
                                        {exp.model}
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-1">
                                        <div className="bg-[#1f6feb]/20 flex flex-col items-center justify-center rounded">
                                            <span className="text-[#58a6ff] font-bold">{cm.tp}</span>
                                            <span className="text-[8px] text-[#8b949e]">TP</span>
                                        </div>
                                        <div className="bg-[#f85149]/20 flex flex-col items-center justify-center rounded">
                                            <span className="text-[#f85149] font-bold">{cm.fp}</span>
                                            <span className="text-[8px] text-[#8b949e]">FP</span>
                                        </div>
                                        <div className="bg-[#f85149]/20 flex flex-col items-center justify-center rounded">
                                            <span className="text-[#f85149] font-bold">{cm.fn}</span>
                                            <span className="text-[8px] text-[#8b949e]">FN</span>
                                        </div>
                                        <div className="bg-[#1f6feb]/20 flex flex-col items-center justify-center rounded">
                                            <span className="text-[#58a6ff] font-bold">{cm.tn}</span>
                                            <span className="text-[8px] text-[#8b949e]">TN</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
