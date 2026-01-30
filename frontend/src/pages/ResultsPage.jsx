import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);

  useEffect(() => {
    const expId = location.state?.experimentId;
    if (!expId) {
      navigate('/experiments');
      return;
    }
    const allExps = MockData.getExperiments();
    const found = allExps.find(e => e.id === expId);
    if (found) {
      // Ensure leaderboard is sorted by accuracy
      if (found.leaderboard) {
        found.leaderboard.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
      }
      setExperiment(found);
    }
  }, [location, navigate]);

  if (!experiment) return null;

  // --- Strict Graph Colors ---
  const PRIMARY_COLOR = 'rgba(6, 182, 212, 1)'; // Cyan-500
  const PRIMARY_BG = 'rgba(6, 182, 212, 0.2)';
  const SECONDARY_COLOR = 'rgba(99, 102, 241, 1)'; // Indigo-500

  // --- Chart 1: Performance Metrics ---
  const metricsData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [{
      label: 'Model Score',
      data: [
        experiment.metrics?.accuracy,
        experiment.metrics?.precision,
        experiment.metrics?.recall,
        experiment.metrics?.f1
      ],
      backgroundColor: [PRIMARY_COLOR, SECONDARY_COLOR, '#10b981', '#f59e0b'],
      borderRadius: 6,
      barThickness: 50,
    }],
  };

  const metricOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'core Performance Metrics', font: { size: 13, weight: 'bold' }, color: '#6b7280', padding: 20 },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1.0,
        title: { display: true, text: 'Score (0-1)', font: { size: 11, weight: 'bold' } }
      },
      x: { grid: { display: false } }
    }
  };

  // --- Chart 2: Loss Curve ---
  const lossData = {
    labels: experiment.loss_curve?.map(p => `Ep ${p.epoch}`) || [],
    datasets: [
      {
        label: 'Training Loss',
        data: experiment.loss_curve?.map(p => p.loss) || [],
        borderColor: PRIMARY_COLOR,
        backgroundColor: PRIMARY_BG,
        tension: 0.3,
        fill: true,
        pointRadius: 3
      },
      {
        label: 'Validation Loss',
        data: experiment.loss_curve?.map(p => p.val_loss) || [],
        borderColor: '#f97316', // Orange
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 0
      }
    ],
  };

  const lossOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 11 } } },
      title: { display: true, text: 'Training & Validation Loss', font: { size: 13, weight: 'bold' }, color: '#6b7280', padding: 20 }
    },
    scales: {
      y: { title: { display: true, text: 'Loss Value', font: { size: 11, weight: 'bold' } } },
      x: { grid: { display: false }, title: { display: true, text: 'Training Epochs', font: { size: 11, weight: 'bold' } } }
    }
  };

  // --- Helper: Confusion Matrix ---
  // Use mocked matrix from data or generate a robust fallback
  const cm = experiment.confusion_matrix || [
    [Math.floor(500 * experiment.metrics.accuracy), 500 - Math.floor(500 * experiment.metrics.accuracy)], // TN, FP
    [500 - Math.floor(500 * experiment.metrics.accuracy), Math.floor(500 * experiment.metrics.accuracy)]  // FN, TP (Crude approx)
  ];

  const totalSamples = cm.flat().reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/experiments')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <Icon name="chevron" className="rotate-180" size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              {experiment.name}
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${experiment.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {experiment.status}
              </span>
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Icon name="cpu" size={12} /> {experiment.model}
              </span>
              <span>•</span>
              <span>Project ID: {experiment.projectId || 'Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8 text-right">
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{(experiment.metrics?.accuracy * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-1">Train Time</p>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-200 font-mono">{experiment.metrics?.training_time_sec}s</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* 1. Confusion Matrix (Analytical Focus) */}
        <div className="bg-white dark:bg-darkpanel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon name="grid" size={18} className="text-cyan-500" /> Confusion Matrix
            </h3>
            <span className="text-xs text-gray-400">Total Samples: {totalSamples}</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
              {/* Vertical Label */}
              <div className="row-span-3 flex items-center justify-center">
                <span className="-rotate-90 text-xs font-bold text-gray-400 uppercase tracking-widest">True Label</span>
              </div>

              {/* Top Labels */}
              <div className="col-start-2 text-center text-xs font-bold text-gray-500">Predicted 0</div>
              <div className="col-start-3 text-center text-xs font-bold text-gray-500">Predicted 1</div>

              {/* Row 1 */}
              <div className="flex items-center justify-end pr-2 text-xs font-bold text-gray-500">Actual 0</div>
              <div className="bg-cyan-50 dark:bg-cyan-900/10 p-6 rounded-lg border border-cyan-100 dark:border-cyan-900/30 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{cm[0][0]}</span>
                <span className="text-[10px] text-cyan-600/70 font-bold uppercase">TN</span>
              </div>
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-xl font-bold text-red-900 dark:text-red-100">{cm[0][1]}</span>
                <span className="text-[10px] text-red-600/70 font-bold uppercase">FP</span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-end pr-2 text-xs font-bold text-gray-500">Actual 1</div>
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-lg border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-xl font-bold text-red-900 dark:text-red-100">{cm[1][0]}</span>
                <span className="text-[10px] text-red-600/70 font-bold uppercase">FN</span>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/10 p-6 rounded-lg border border-cyan-100 dark:border-cyan-900/30 flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{cm[1][1]}</span>
                <span className="text-[10px] text-cyan-600/70 font-bold uppercase">TP</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Charts Column */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-darkpanel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-[280px]">
            <Bar data={metricsData} options={metricOptions} />
          </div>
          <div className="bg-white dark:bg-darkpanel p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-[280px]">
            <Line data={lossData} options={lossOptions} />
          </div>
        </div>
      </div>

      {/* 3. Detailed Leaderboard */}
      <div className="bg-white dark:bg-darkpanel rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon name="award" className="text-yellow-500" size={20} /> Model Leaderboard
          </h3>
          <span className="text-xs text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">Sorted by Accuracy</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 w-16 text-center">Rank</th>
                <th className="px-6 py-4">Model Name</th>
                <th className="px-6 py-4 font-bold text-cyan-600">Accuracy</th>
                <th className="px-6 py-4">Precision</th>
                <th className="px-6 py-4">Recall</th>
                <th className="px-6 py-4">F1 Score</th>
                <th className="px-6 py-4 text-right">Train Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(experiment.leaderboard || []).map((model, idx) => (
                <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${idx === 0 ? 'bg-cyan-50/30' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    {idx === 0 ? <span className="text-lg">🥇</span> :
                      idx === 1 ? <span className="text-lg">🥈</span> :
                        idx === 2 ? <span className="text-lg">🥉</span> :
                          <span className="text-gray-400 font-mono">#{idx + 1}</span>}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {model.model_id}
                    {idx === 0 && <span className="ml-2 text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-bold">BEST</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-lg">
                    {(parseFloat(model.accuracy) * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(parseFloat(model.precision || 0) * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(parseFloat(model.recall || 0) * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{(parseFloat(model.f1 || 0) * 100).toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right font-mono text-gray-500 dark:text-gray-400">{model.training_time_sec || model.latency_ms + ' ms'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
