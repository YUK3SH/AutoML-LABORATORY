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
    if (found) setExperiment(found);
  }, [location, navigate]);

  if (!experiment) return null;

  // Charts
  const metricsData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [{
      label: 'Score',
      data: [
        experiment.metrics?.accuracy,
        experiment.metrics?.precision,
        experiment.metrics?.recall,
        experiment.metrics?.f1
      ],
      backgroundColor: 'rgba(6, 182, 212, 0.8)',
      borderRadius: 4,
      barThickness: 40,
    }],
  };

  const lossData = {
    labels: experiment.loss_curve?.map(p => `Ep ${p.epoch}`) || [],
    datasets: [
      {
        label: 'Train',
        data: experiment.loss_curve?.map(p => p.loss) || [],
        borderColor: '#3B82F6',
        tension: 0.3,
        pointRadius: 0
      },
      {
        label: 'Val',
        data: experiment.loss_curve?.map(p => p.val_loss) || [],
        borderColor: '#F97316',
        tension: 0.3,
        pointRadius: 0,
        borderDash: [5, 5]
      }
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/experiments')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <Icon name="chevron" className="rotate-180" size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{experiment.name}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{experiment.model}</span>
              <span>•</span>
              <span>{experiment.project}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider">Accuracy</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{(experiment.metrics?.accuracy * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider">Time</p>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-200">{experiment.metrics?.training_time_sec}s</p>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visuals Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance */}
          <div className="bg-white dark:bg-darkpanel p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-sm flex items-center gap-2">
              <Icon name="activity" size={16} /> Model Metrics
            </h3>
            <div className="h-64 w-full">
              <Bar data={metricsData} options={commonOptions} />
            </div>
          </div>
          {/* Loss */}
          <div className="bg-white dark:bg-darkpanel p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-sm flex items-center gap-2">
              <Icon name="clock" size={16} /> Learning Curve
            </h3>
            <div className="h-64 w-full">
              <Line data={lossData} options={commonOptions} />
            </div>
          </div>
        </div>

        {/* Leaderboard Column */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-darkpanel rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-6">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Top Models</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {experiment.leaderboard?.map((model, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
                  <div>
                    <p className={`text-sm font-medium ${i === 0 ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {model.model_id.replace(experiment.model, 'Model')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{model.latency_ms}ms inference</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-bold ${i === 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white'}`}>
                      {(model.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
