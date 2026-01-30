import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
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
    const kpis = [
        { label: "Total Projects", value: "12", change: "+2 this week" },
        { label: "Active Experiments", value: "5", change: "Running now" },
        { label: "Avg. Accuracy", value: "94.2%", change: "+1.2% vs. baseline" },
        { label: "Compute Hours", value: "342h", change: "Within budget" },
    ];

    const recentExperiments = [
        { id: 1, name: "Customer Churn V2", status: "Running", accuracy: "..." },
        { id: 2, name: "Price Opt - XGBoost", status: "Completed", accuracy: "96.4%" },
        { id: 3, name: "Inventory Forecast", status: "Failed", accuracy: "0%" },
        { id: 4, name: "Credit Risk Model", status: "Completed", accuracy: "91.8%" },
    ];

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Model Accuracy Trend',
                data: [82, 85, 89, 92, 93, 94.5],
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                min: 80,
                max: 100,
                grid: {
                    color: 'rgba(200, 200, 200, 0.1)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: Just now</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</div>
                        <div className="mt-1 flex items-baseline justify-between md:block lg:flex">
                            <div className="flex items-baseline text-2xl font-semibold text-gray-900 dark:text-white">
                                {kpi.value}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {kpi.change}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                    <Card title="Performance Trend (Accuracy)">
                        <div className="h-72 w-full">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </Card>
                </div>

                {/* Recent Experiments */}
                <div>
                    <Card title="Recent Experiments" noPadding>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {recentExperiments.map((exp) => (
                                <div key={exp.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{exp.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{exp.accuracy === "..." ? "Training..." : `Acc: ${exp.accuracy}`}</p>
                                    </div>
                                    <Badge status={exp.status} />
                                </div>
                            ))}
                        </div>
                        {/* Footer link */}
                        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 rounded-b-lg">
                            <a href="/experiments" className="text-xs font-medium text-blue-600 hover:text-blue-500">View all experiments &rarr;</a>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
