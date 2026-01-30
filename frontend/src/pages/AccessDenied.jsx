import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';

export default function AccessDenied() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-xl shadow-red-500/10">
                <Icon name="x" size={48} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Access Restricted</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                You need to be signed in to view this page. Please log in to access your projects and experiments.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    Back to Home
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg hover:shadow-red-500/25 transition-all transform hover:-translate-y-0.5"
                >
                    Sign In Now
                </button>
            </div>
        </div>
    );
}
