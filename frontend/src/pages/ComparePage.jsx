import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

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
        const selected = all.filter(e => ids.includes(e.id));
        setExperiments(selected);
    }, [location, navigate]);

    if (experiments.length === 0) return null;

    // Helpers
    const getBestValue = (metricKey) => {
        const values = experiments.map(e => parseFloat(e.metrics?.[metricKey] || 0));
        const lowerIsBetter = ['training_time_sec', 'cpu_peak', 'ram_peak'].includes(metricKey);
        return lowerIsBetter ? Math.min(...values) : Math.max(...values);
    };

    const isBest = (val, metricKey) => {
        const best = getBestValue(metricKey);
        return parseFloat(val) === best;
    };

    const getBestToolName = (metricKey) => {
        const bestVal = getBestValue(metricKey);
        const bestExp = experiments.find(e => parseFloat(e.metrics?.[metricKey] || 0) === bestVal);
        return bestExp ? bestExp.model : 'N/A';
    };

    const renderDelta = (val, metricKey, index) => {
        if (index === 0) return null;
        const baseline = parseFloat(experiments[0].metrics?.[metricKey] || 0);
        const current = parseFloat(val);
        const diff = current - baseline;

        if (Math.abs(diff) < 0.0001) return null;

        const lowerIsBetter = ['training_time_sec', 'cpu_peak', 'ram_peak'].includes(metricKey);
        let isImproved = diff > 0;
        if (lowerIsBetter) isImproved = diff < 0;

        return (
            <span className={`ml-2 text-[10px] font-bold flex items-center gap-0.5 ${isImproved ? 'text-green-500' : 'text-red-500'}`}>
                {isImproved ? <Icon name="arrowUp" size={10} className={lowerIsBetter ? 'rotate-180' : ''} /> : <Icon name="arrowDown" size={10} className={lowerIsBetter ? 'rotate-180' : ''} />}
            </span>
        );
    };

    const metricsMap = [
        { key: 'accuracy', label: 'Accuracy' },
        { key: 'precision', label: 'Precision' },
        { key: 'recall', label: 'Recall' },
        { key: 'f1', label: 'F1 Score' },
        { key: 'training_time_sec', label: 'Train Time (s)' },
        { key: 'cpu_peak', label: 'CPU Peak (%)' },
        { key: 'ram_peak', label: 'RAM Peak (GB)' },
    ];

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-12 space-y-6">
            {/* Top Header Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-gray-300">
                <div className="flex justify-between items-start">
                    <div>
                        <p><span className="font-bold text-gray-400">Dataset:</span> <span className="text-white ml-2">{experiments[0]?.dataset || 'Iris.csv'}</span></p>
                        <p className="mt-1"><span className="font-bold text-gray-400">Base Tool:</span> <span className="text-white ml-2 lowercase">{experiments[0]?.model}</span></p>
                    </div>
                    <button onClick={() => navigate('/experiments')} className="text-gray-500 hover:text-white transition-colors">
                        <Icon name="x" size={24} />
                    </button>
                </div>
            </div>

            {/* Placeholders Row */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 h-32 flex items-center justify-center text-gray-500 text-sm">
                    Metric Trade-offs (Radar – later)
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 h-32 flex items-center justify-center text-gray-500 text-sm">
                    Relative Loss Curves (later)
                </div>
            </div>

            {/* Detailed Metrics Comparison */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="font-bold text-gray-200">Detailed Metrics Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="px-6 py-4 text-left font-bold">Tool</th>
                                <th className="px-6 py-4 text-left font-bold">Best Model</th>
                                {metricsMap.map(m => (
                                    <th key={m.key} className="px-6 py-4 text-left font-bold">{m.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-300">
                            {experiments.map((exp, idx) => (
                                <tr key={exp.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 lowercase text-cyan-400 font-medium">{exp.model}</td>
                                    <td className="px-6 py-4 text-gray-400">{exp.name}</td>
                                    {metricsMap.map(m => {
                                        const val = exp.metrics?.[m.key] || 0;
                                        const best = isBest(val, m.key);
                                        return (
                                            <td key={m.key} className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className={best ? 'text-green-400 font-bold' : ''}>{val}</span>
                                                    {renderDelta(val, m.key, idx)}
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

            {/* Best Metrics Outcome */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="font-bold text-gray-200">Best Metrics Outcome</h3>
                </div>
                <div>
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800">
                                <th className="px-6 py-4 text-left font-bold w-1/2">Metric</th>
                                <th className="px-6 py-4 text-left font-bold w-1/2">Best Tool</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-gray-300">
                            {metricsMap.map(m => (
                                <tr key={m.key} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-400">{m.label}</td>
                                    <td className="px-6 py-4 lowercase text-gray-300">{getBestToolName(m.key)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
