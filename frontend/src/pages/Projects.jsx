import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Icon from '../components/Icons';
import MockData from '../utils/MockData';

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(MockData.getProjects());
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
                        className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all group animate-fade-in-up md:min-h-[240px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors mb-4">
                            <Icon name="plus" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Create New Project</h3>
                    </div>

                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            onClick={() => navigate('/experiments')}
                            className="cursor-pointer group animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <Card className="h-full hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                                        <Icon name="folder" size={24} />
                                    </div>
                                    <Badge status={project.status || "Active"} />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 bg-gray-100 dark:bg-gray-800/50 inline-block px-2 py-1 rounded">
                                    {project.type}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                                    <span className="flex items-center gap-1">
                                        <Icon name="beaker" size={12} />
                                        {project.count} experiments
                                    </span>
                                    <span>{project.updated}</span>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
