import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';

const LandingPage = () => {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setVisible(true);
        // Handle hash navigation if coming from external link
        if (window.location.hash) {
            const id = window.location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const Section = ({ id, title, children, className = "" }) => (
        <section id={id} className={`py-24 px-6 ${className}`}>
            <div className="max-w-6xl mx-auto">
                {title && <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center tracking-tight">{title}</h2>}
                {children}
            </div>
        </section>
    );

    const checkAuthAndJarvis = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('automl_token');
        if (token) {
            navigate('/jarvis');
        } else {
            navigate('/login'); // Redirect to login, which then redirects to Jarvis
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500 selection:text-white font-sans overflow-x-hidden">

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                            AL
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                            AutoML <span className="font-bold text-cyan-500">LAB</span>
                        </span>
                    </button>

                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollTo('pricing')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</button>
                        <button onClick={() => scrollTo('about')} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About Us</button>
                        <Link to="/login" className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 text-sm font-bold transition-all hover:scale-105 active:scale-95">
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className={`relative pt-40 pb-20 px-6 text-center min-h-[90vh] flex flex-col items-center justify-center transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        v2.0 Now Available
                    </div>

                    <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
                        Machine Learning.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Simplified.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Accelerate your research with automated model selection, hyperparameter tuning, and intelligent insights.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center w-full md:w-auto">
                        <button
                            onClick={() => scrollTo('features')}
                            className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl border border-gray-800 transition-all hover:border-gray-600 min-w-[180px]"
                        >
                            Learn More
                        </button>
                        <button
                            onClick={checkAuthAndJarvis}
                            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)] transition-all transform hover:-translate-y-1 min-w-[180px] flex items-center justify-center gap-2 group"
                        >
                            <span>Ask Jarvis</span>
                            <Icon name="arrowRight" size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Preview */}
            <Section id="features" className="bg-gray-900/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon="search"
                        title="Auto Discovery"
                        desc="Automatically identifies the best algorithms for your dataset. No manual trial and error."
                    />
                    <FeatureCard
                        icon="beaker"
                        title="Instant Experiments"
                        desc="Run concurrent trials with varying parameters in seconds. Scale effortlessly."
                    />
                    <FeatureCard
                        icon="messageSquare"
                        title="Smart Assistant"
                        desc="Ask Jarvis to interpret results and suggest optimizations. Your AI co-pilot."
                    />
                </div>
            </Section>

            {/* Landscape Visualization */}
            <Section id="landscape" title="The Current Landscape">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-xl text-gray-300 leading-relaxed mb-8">
                            Today's data science workflows are broken. Teams spend <span className="text-white font-bold">80% of their time</span> on plumbing, tuning, and infrastructure management.
                        </p>
                        <ul className="space-y-6">
                            <li className="flex items-center gap-4 text-red-300/80">
                                <div className="p-2 rounded-lg bg-red-900/20"><Icon name="x" size={20} /></div>
                                <span className="text-lg">Slow, manual iterations</span>
                            </li>
                            <li className="flex items-center gap-4 text-red-300/80">
                                <div className="p-2 rounded-lg bg-red-900/20"><Icon name="x" size={20} /></div>
                                <span className="text-lg">Black-box models</span>
                            </li>
                            <li className="flex items-center gap-4 text-red-300/80">
                                <div className="p-2 rounded-lg bg-red-900/20"><Icon name="x" size={20} /></div>
                                <span className="text-lg">Disconnected tools</span>
                            </li>
                        </ul>
                    </div>

                    {/* CSS Visualization */}
                    <div className="p-8 bg-black rounded-3xl border border-gray-800 relative overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500 shadow-2xl">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.5)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30"></div>

                        <div className="relative z-10 h-64 flex items-end justify-around pb-4">
                            {/* Bar 1 */}
                            <div className="flex flex-col items-center gap-3 w-1/3 group/bar1">
                                <div className="text-sm text-gray-500 font-mono mb-2">Manual</div>
                                <div className="w-full max-w-[80px] bg-gray-800 rounded-t-xl relative overflow-hidden border-t border-gray-700" style={{ height: '30%' }}></div>
                                <div className="text-xs text-red-400 font-bold mt-1">Inefficient</div>
                            </div>

                            {/* Bar 2 */}
                            <div className="flex flex-col items-center gap-3 w-1/3 group/bar2">
                                <div className="text-sm text-cyan-400 font-bold font-mono mb-2">AutoML LAB</div>
                                <div className="w-full max-w-[80px] bg-cyan-900/20 rounded-t-xl relative overflow-hidden border-t border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)]" style={{ height: '90%' }}>
                                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-cyan-600/20 to-cyan-400/10 animate-pulse"></div>
                                </div>
                                <div className="text-xs text-cyan-400 font-bold mt-1">10x Speed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Why AutoML LAB */}
            <Section id="why" title="Why AutoML LAB?" className="bg-gradient-to-b from-gray-900 to-black border-y border-white/5">
                <div className="grid md:grid-cols-3 gap-8">
                    <BenefitCard
                        icon="zap"
                        title="Jarvis-First"
                        desc="We don't just give you a dashboard. We give you an intelligent assistant that understands your data goals."
                    />
                    <BenefitCard
                        icon="layers"
                        title="Project Isolation"
                        desc="Complete separation of concerns. Your experiments never bleed into other projects."
                    />
                    <BenefitCard
                        icon="checkCircle"
                        title="Authority Metrics"
                        desc="Confusion matrices and leaderboards that are scientifically rigorous, not just pretty."
                    />
                </div>
            </Section>

            {/* Supported Tools */}
            <Section id="tools" title="Supported Engines">
                <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
                    <span className="text-3xl md:text-4xl font-bold">H2O.ai</span>
                    <span className="text-3xl md:text-4xl font-bold">AutoGluon</span>
                    <span className="text-3xl md:text-4xl font-bold">XGBoost</span>
                    <span className="text-3xl md:text-4xl font-bold">LightGBM</span>
                    <span className="text-3xl md:text-4xl font-bold">PyTorch</span>
                </div>
            </Section>

            {/* Architecture */}
            <Section id="architecture" title="Technical Capabilities" className="bg-gray-900/30">
                <div className="bg-black/50 p-10 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="grid md:grid-cols-2 gap-10">
                        <TechItem title="Data Processing" desc="Automatic imputation, encoding, and scaling." />
                        <TechItem title="Model Training" desc="Ensemble stacking, cross-validation, and early stopping." />
                        <TechItem title="Explainability" desc="SHAP values, feature importance, and partial dependence plots." />
                        <TechItem title="Deployment" desc="One-click export to REST API or Docker container." />
                    </div>
                </div>
            </Section>

            {/* Pricing Placeholder */}
            <Section id="pricing" title="Simple Pricing">
                <div className="flex justify-center">
                    <div className="p-8 border border-white/10 rounded-2xl bg-white/5 max-w-sm text-center">
                        <h3 className="text-xl font-bold mb-4">Enterprise</h3>
                        <div className="text-4xl font-bold mb-6">Custom</div>
                        <ul className="text-gray-400 space-y-3 mb-8 text-left">
                            <li>• Unlimited Projects</li>
                            <li>• Dedicated Compute</li>
                            <li>• Jarvis Pro</li>
                        </ul>
                        <button className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">Contact Sales</button>
                    </div>
                </div>
            </Section>

            {/* Roadmap */}
            <Section id="roadmap" title="Roadmap" wrapperClassName="bg-black">
                <div className="max-w-3xl mx-auto space-y-8 relative pl-8 border-l border-gray-800">
                    <RoadmapItem q="Q2 2026" title="Time Series Forecasting" />
                    <RoadmapItem q="Q3 2026" title="Deep Learning Vision Module" />
                    <RoadmapItem q="Q4 2026" title="Collaborative Team Spaces" />
                </div>
            </Section>

            {/* About & Contact */}
            <Section id="about" title="About Us" className="text-center">
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-16">
                    We are a team of passionate engineers and data scientists dedicated to removing the barrier to entry for high-performance AI.
                </p>

                <div id="contact" className="p-12 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
                    <h3 className="text-2xl font-bold mb-4">Ready to build?</h3>
                    <p className="text-gray-400 mb-8">Transform your workflow today.</p>
                    <a href="mailto:contact@automllab.com" className="text-cyan-400 hover:text-cyan-300 font-bold text-2xl hover:underline">contact@automllab.com</a>
                </div>
            </Section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 text-center text-gray-600 text-sm">
                <p>&copy; 2026 AutoML LAB. All rights reserved.</p>
            </footer>
        </div>
    );
};

// --- Subcomponents ---

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
            <Icon name={icon} size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

const BenefitCard = ({ icon, title, desc }) => (
    <div className="p-6">
        <Icon name={icon} className="text-cyan-500 mb-4" size={32} />
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
);

const TechItem = ({ title, desc }) => (
    <div>
        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
            {title}
        </h4>
        <p className="text-gray-400 text-sm pl-4">{desc}</p>
    </div>
);

const RoadmapItem = ({ q, title }) => (
    <div className="relative">
        <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-black border-4 border-gray-800"></div>
        <div className="text-cyan-500 font-bold font-mono text-sm mb-1">{q}</div>
        <div className="text-xl font-bold">{title}</div>
    </div>
);

export default LandingPage;
