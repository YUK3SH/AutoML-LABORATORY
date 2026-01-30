import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const rawProjects = MockData.getProjects();
        // Hydrate with dynamic stats
        const hydrated = rawProjects.map(p => {
            const stats = MockData.getProjectStats(p.id);
            return {
                ...p,
                count: stats.count,
                bestAccuracy: stats.bestAccuracy
            };
        });
        setProjects(hydrated);
    }, []);

    const hasProjects = projects.length > 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with CTA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your datasets and model experiments.</p>
                </div>
                {hasProjects && (
                    <button
                        onClick={() => navigate('/run-experiment')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                    >
                        <Icon name="plus" size={20} />
                        <span className="font-semibold">New Project</span>
                    </button>
                )}
            </div>

            {/* Content */}
            {!hasProjects ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-darkpanel rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 animate-slide-up">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Icon name="folder" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No projects yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
                        Start your first AutoML journey by creating a new project and uploading a dataset.
                    </p>
                    <button
                        onClick={() => navigate('/run-experiment')}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl shadow-xl hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1"
                    >
                        <Icon name="plus" size={20} />
                        <span className="font-bold">Create First Project</span>
                    </button>
                </div>
            ) : (
                /* Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add New Card (First Item) */}
                    <div
                        onClick={() => navigate('/run-experiment')}
                        className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all group animate-fade-in-up md:min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors mb-4">
                            <Icon name="plus" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Create New Project</h3>
                    </div>

                    {projects.map((project, index) => (
                        <div key={project.id} style={{ animationDelay: `${index * 50}ms` }}>
                            <ProjectCard
                                project={project}
                                onClick={() => navigate(`/experiments/${project.id}`)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
