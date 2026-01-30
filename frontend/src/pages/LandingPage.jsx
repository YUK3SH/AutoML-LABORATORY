import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import NavbarHome from '../components/NavbarHome';

const LandingPage = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden relative font-sans selection:bg-cyan-500 selection:text-white">
            <NavbarHome />

            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className={`absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05] pointer-events-none`} ></div>

            {/* Content Container */}
            <div className={`relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center transition-all duration-1000 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                {/* Logo / Badge */}
                <div className="mb-8 p-3 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-md shadow-xl animate-pulse-slow">
                    <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase px-2">AutoML Laboratory v2.0</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 [text-shadow:0_0_30px_rgba(255,255,255,0.1)]">
                    Machine Learning.<br />
                    <span className="text-cyan-500">Simplified.</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
                    Accelerate your research with automated model selection, hyperparameter tuning, and intelligent insights.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <Link to="/login" className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
                        <span>Get Started</span>
                        <Icon name="chevronRight" size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/about" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold rounded-xl border border-slate-700 transition-all hover:border-gray-500 flex items-center justify-center">
                        Learn More
                    </Link>
                </div>

                {/* Feature Cards Preview */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
                    <FeatureCard
                        icon="search"
                        title="Auto Discovery"
                        desc="Automatically identifies the best algorithms for your dataset."
                        delay="delay-100"
                    />
                    <FeatureCard
                        icon="beaker"
                        title="Instant Experiments"
                        desc="Run concurrent trials with varying parameters in seconds."
                        delay="delay-200"
                    />
                    <FeatureCard
                        icon="messageSquare"
                        title="Smart Assistant"
                        desc="Ask Jarvis to interpret results and suggest optimizations."
                        delay="delay-300"
                    />
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
    <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 group animate-fade-in-up ${delay}`}>
        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
            <Icon name={icon} className="text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
