import React from 'react';
import Badge from './Badge';
import Icon from './Icons';

/**
 * ProjectCard - Professional data science project summary
 */
export default function ProjectCard({ project, onClick }) {
    // Determine status color logic
    const hasBestModel = project.bestAccuracy && project.bestAccuracy !== 'N/A';

    return (
        <div
            onClick={onClick}
            className="group relative bg-white dark:bg-darkpanel border border-gray-200 dark:border-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:shadow-cyan-900/5 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
        >
            {/* Top decorative line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 group-hover:text-cyan-600 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 transition-colors">
                        <Icon name="folder" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {project.domain || "General"}
                        </p>
                    </div>
                </div>
                <Badge status={project.status} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-gray-100 dark:border-gray-800/50">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Experiments</p>
                    <p className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                        <Icon name="beaker" size={14} className="text-gray-400" />
                        {project.count}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Best Accuracy</p>
                    <p className={`font-mono font-bold flex items-center gap-1.5 ${hasBestModel ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        {hasBestModel ? (
                            <>
                                <Icon name="trendingUp" size={14} />
                                {project.bestAccuracy}
                            </>
                        ) : (
                            <span className="text-sm">--</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Created {new Date(project.created || Date.now()).toLocaleDateString()}</span>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium opacity-0 group-hover:opacity-100">
                    Open Project <Icon name="chevronRight" size={12} />
                </span>
            </div>
        </div>
    );
}
