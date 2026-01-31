import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';

const Section = ({ title, children, className = "" }) => (
    <div className={`py-20 px-6 ${className}`}>
        <div className="max-w-4xl mx-auto">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>}
            {children}
        </div>
    </div>
);

const LearnMore = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-white font-sans">
            {/* Simple Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <Icon name="arrowLeft" size={20} className="text-gray-400 hover:text-white" />
                        Back to Home
                    </Link>
                    <Link to="/login" className="px-4 py-2 bg-cyan-600 rounded-lg font-medium hover:bg-cyan-500 transition-colors">
                        Ask Jarvis
                    </Link>
                </div>
            </div>

            {/* 1. What is AutoML Laboratory */}
            <div className="pt-32 pb-20 px-6 text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    What is AutoML Laboratory?
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    AutoML Laboratory is an enterprise-grade platform designed to democratize access to state-of-the-art machine learning.
                    We act as a force multiplier for data teams, automating the tedious aspects of model selection and training.
                </p>
            </div>

            {/* 2. Current AutoML Landscape */}
            <Section title="The Current Landscape" className="bg-gray-900/50">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-lg text-gray-300 leading-relaxed mb-6">
                            Today's data science workflows are broken. Teams spend 80% of their time on data plumbing, hyperparameter tuning, and infrastructure management.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-red-400">
                                <Icon name="x" size={20} /> Slow, manual iterations
                            </li>
                            <li className="flex items-center gap-3 text-red-400">
                                <Icon name="x" size={20} /> Black-box models
                            </li>
                            <li className="flex items-center gap-3 text-red-400">
                                <Icon name="x" size={20} /> Disconnected tools
                            </li>
                        </ul>
                    </div>
                    <div className="p-8 bg-black rounded-2xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500">
                        {/* Background Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>

                        <div className="relative z-10 h-40 flex items-end justify-around pb-4">
                            {/* Bar 1: Traditional */}
                            <div className="flex flex-col items-center gap-2 w-1/3 group/bar1">
                                <div className="text-xs text-gray-500 font-mono">Manual</div>
                                <div className="w-full bg-gray-800 rounded-t-lg relative overflow-hidden" style={{ height: '40%' }}>
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-900 to-gray-700 opacity-50"></div>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Effort: High</div>
                            </div>

                            {/* Bar 2: AutoML */}
                            <div className="flex flex-col items-center gap-2 w-1/3 group/bar2">
                                <div className="text-xs text-cyan-400 font-bold font-mono">AutoML Lab</div>
                                <div className="w-full bg-cyan-900/30 rounded-t-lg relative overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.2)]" style={{ height: '90%' }}>
                                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-cyan-600 to-cyan-400 animate-pulse-slow"></div>
                                </div>
                                <div className="text-xs text-cyan-400 mt-1 font-bold">Performance: Max</div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute top-4 right-4 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] text-cyan-400 font-mono">
                            10x Efficiency
                        </div>
                    </div>
                </div>
            </Section>

            {/* 3. Our Approach (Difference) */}
            <Section title="What Makes Us Different">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Icon name="zap" className="text-cyan-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-3">Jarvis-First</h3>
                        <p className="text-gray-400">We don't just give you a dashboard. We give you an intelligent assistant that understands your data goals.</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Icon name="layers" className="text-cyan-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-3">Project Isolation</h3>
                        <p className="text-gray-400">Complete separation of concerns. Your experiments never bleed into other projects.</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Icon name="checkCircle" className="text-cyan-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-3">Authority Metrics</h3>
                        <p className="text-gray-400">Confusion matrices and leaderboards that are scientifically rigorous, not just pretty.</p>
                    </div>
                </div>
            </Section>

            {/* 4. Supported Tools */}
            <Section title="Supported Engines" className="bg-gray-900/50">
                <div className="flex flex-wrap justify-center gap-8 opacity-70">
                    <div className="text-2xl font-bold text-gray-500">H2O.ai</div>
                    <div className="text-2xl font-bold text-gray-500">AutoGluon</div>
                    <div className="text-2xl font-bold text-gray-500">XGBoost</div>
                    <div className="text-2xl font-bold text-gray-500">LightGBM</div>
                    <div className="text-2xl font-bold text-gray-500">PyTorch</div>
                </div>
            </Section>

            {/* 5. Technical Capabilities */}
            <Section title="Technical Capabilities">
                <div className="bg-gradient-to-r from-gray-900 to-black p-8 rounded-2xl border border-white/10">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Data Processing</h4>
                            <p className="text-gray-400 text-sm">Automatic imputation, encoding, and scaling.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Model Training</h4>
                            <p className="text-gray-400 text-sm">Ensemble stacking, cross-validation, and early stopping.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Explainability</h4>
                            <p className="text-gray-400 text-sm">SHAP values, feature importance, and partial dependence plots.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">Deployment</h4>
                            <p className="text-gray-400 text-sm">One-click export to REST API or Docker container.</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 6. Roadmap */}
            <Section title="Future Roadmap" className="bg-gray-900/50">
                <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="flex gap-4">
                        <div className="w-24 font-bold text-cyan-400">Q2 2026</div>
                        <div>Time Series Forecasting Engine</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-24 font-bold text-cyan-400">Q3 2026</div>
                        <div>Deep Learning Vision Module</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-24 font-bold text-cyan-400">Q4 2026</div>
                        <div>Collaborative Team Spaces</div>
                    </div>
                </div>
            </Section>

            {/* 7. About Us */}
            <Section title="About Us">
                <p className="text-center text-gray-400 max-w-2xl mx-auto">
                    We are a team of passionate engineers and data scientists dedicated to removing the barrier to entry for high-performance AI.
                </p>
            </Section>

            {/* 8. Contact */}
            <Section title="Contact" className="bg-cyan-900/10">
                <div className="text-center">
                    <p className="text-gray-300 mb-6">Ready to transform your workflow?</p>
                    <a href="mailto:contact@automllab.com" className="text-cyan-400 hover:text-cyan-300 font-bold text-lg">contact@automllab.com</a>
                </div>
            </Section>

            {/* Footer */}
            <div className="border-t border-white/10 py-12 text-center text-gray-600 text-sm">
                <p>&copy; 2026 AutoML Laboratory. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LearnMore;
