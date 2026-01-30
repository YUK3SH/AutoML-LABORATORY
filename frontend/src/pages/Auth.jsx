import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SocialButton from '../components/SocialButton';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icons';

const AuthContainer = ({ title, subtitle, children }) => (
    <div className="min-h-screen flex bg-black">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-900/20 z-10"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-20"></div>
            {/* Abstract Shapes */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-30 m-auto text-center px-12">
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl">
                    <Icon name="beaker" size={48} className="text-cyan-400" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Accelerate Your Research</h2>
                <p className="text-gray-300 text-lg">Join thousands of data scientists building superior models with AutoML Lab.</p>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
            {/* Mobile Background enhancements */}
            <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-gray-900 to-black z-0"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block mb-8 lg:hidden">
                        <span className="text-2xl font-bold text-white tracking-tight">
                            AutoML <span className="text-cyan-400 font-light">Laboratory</span>
                        </span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-gray-400">{subtitle}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <SocialButton provider="google" onClick={() => { }} />
                    <div className="grid grid-cols-2 gap-4">
                        <SocialButton provider="github" onClick={() => { }} />
                        <SocialButton provider="linkedin" onClick={() => { }} />
                    </div>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-black text-gray-500 uppercase tracking-widest text-xs">Or continue with</span>
                    </div>
                </div>

                {children}

            </div>
        </div>
    </div>
);

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Mock Auth
        setTimeout(() => {
            if (email && password) {
                localStorage.setItem('automl_token', 'mock-token-123');
                localStorage.setItem('automl_user', JSON.stringify({ email, name: email.split('@')[0] }));
                setLoading(false);
                navigate('/dashboard');
            } else {
                setLoading(false);
            }
        }, 800);
    };

    return (
        <AuthContainer title="Welcome back" subtitle="Sign in to your account">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className="bg-gray-900 border-gray-800 text-white focus:border-cyan-500" labelClassName="text-gray-400" />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-gray-900 border-gray-800 text-white focus:border-cyan-500" labelClassName="text-gray-400" />

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-800 bg-gray-900 text-cyan-500 focus:ring-cyan-500" />
                        <span className="ml-2 text-sm text-gray-400">Remember me</span>
                    </label>
                    <a href="#" className="text-sm font-medium text-cyan-500 hover:text-cyan-400">Forgot password?</a>
                </div>

                <Button type="submit" fullWidth disabled={loading} className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all">
                    {loading ? "Signing in..." : "Sign In"}
                </Button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account? <Link to="/signup" className="font-semibold text-cyan-500 hover:text-cyan-400">Sign up</Link>
            </p>
        </AuthContainer>
    );
}

export function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            localStorage.setItem('automl_token', 'mock-token-123');
            localStorage.setItem('automl_user', JSON.stringify({ email, name: email.split('@')[0] }));
            setLoading(false);
            navigate('/dashboard');
        }, 800);
    };

    return (
        <AuthContainer title="Create an account" subtitle="Start your 14-day free trial">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="First Name" placeholder="John" className="bg-gray-900 border-gray-800 text-white focus:border-cyan-500" labelClassName="text-gray-400" />
                    <Input label="Last Name" placeholder="Doe" className="bg-gray-900 border-gray-800 text-white focus:border-cyan-500" labelClassName="text-gray-400" />
                </div>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className="bg-gray-900 border-gray-800 text-white focus:border-cyan-500" labelClassName="text-gray-400" />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-gray-900 border-gray-800 text-white focus:border-cyan-500" labelClassName="text-gray-400" />

                <Button type="submit" fullWidth disabled={loading} className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all">
                    {loading ? "Creating account..." : "Create Account"}
                </Button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="font-semibold text-cyan-500 hover:text-cyan-400">Sign in</Link>
            </p>
        </AuthContainer>
    );
}
