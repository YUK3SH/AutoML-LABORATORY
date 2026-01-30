import React, { useEffect } from 'react';
import NavbarHome from '../components/NavbarHome';
import Icon from '../components/Icons';

const LearnMore = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-white font-sans">
            <NavbarHome />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-900 to-black pointer-events-none"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                        The Future of Model Development
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Machine learning is evolving. The days of manual hyperparameter tuning and endless boilerplate code are over.
                        AutoML Lab automates the tedious parts of data science, letting you focus on the problem, not the plumbing.
                    </p>
                </div>
            </div>

            {/* Grid Content */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                            <Icon name="beaker" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold">The Challenge</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Traditional ML workflows are fragmented. Data scientists spend 80% of their time on data cleaning and model selection, leaving little room for actual innovation and domain expertise.
                        </p>
                    </div>
                    <div className="relative p-1 rounded-2xl bg-gradient-to-br from-purple-500/20 to-transparent">
                        <div className="bg-gray-900 rounded-xl p-8 border border-white/10">
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-center gap-3">
                                    <Icon name="x" className="text-red-400" size={20} />
                                    <span>Manual Algorithm Selection</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon name="x" className="text-red-400" size={20} />
                                    <span>Endless Grid Searches</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon name="x" className="text-red-400" size={20} />
                                    <span>Opaque Model Performance</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 relative p-1 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-transparent">
                        <div className="bg-gray-900 rounded-xl p-8 border border-white/10">
                            <ul className="space-y-4 text-gray-300">
                                <li className="flex items-center gap-3">
                                    <Icon name="play" className="text-cyan-400" size={20} />
                                    <span>Automated Pipeline Generation</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon name="play" className="text-cyan-400" size={20} />
                                    <span>Intelligent Bayesian Optimization</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Icon name="play" className="text-cyan-400" size={20} />
                                    <span>Full Explainability (XAI)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                            <Icon name="search" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold">The Solution</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            AutoML Lab uses state-of-the-art H2O.ai backend technology to run thousands of experiments in parallel. We intelligently prune the search space to find the optimal model for your specific dataset in minutes, not days.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 py-12 text-center text-gray-500">
                <p>&copy; 2024 AutoML Laboratory. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LearnMore;
