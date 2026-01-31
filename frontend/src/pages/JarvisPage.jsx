import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icons';

const SuggestionButton = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center space-x-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-cyan-500/50 transition-all duration-300 group text-left w-full sm:w-auto"
    >
        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
            <Icon name={icon} size={20} className="text-gray-400 group-hover:text-cyan-400" />
        </div>
        <span className="text-gray-300 font-medium group-hover:text-white">{label}</span>
    </button>
);

const JarvisPage = () => {
    const navigate = useNavigate();

    // User Identity
    const user = JSON.parse(localStorage.getItem('automl_user') || '{"name": "User"}');
    const firstName = user.name ? user.name.split(' ')[0] : 'User';

    // Chat State
    const [messages, setMessages] = useState([]); // Empty initially to show Hero
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const hasStarted = messages.length > 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (hasStarted) scrollToBottom();
    }, [messages, hasStarted, isTyping]);

    // --- API & Logic ---
    const handleSend = async (textOverride = null) => {
        const text = textOverride || inputValue;
        if (!text.trim()) return;

        // 1. Add User Message
        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // 2. Prepare Payload (Real AI Prep)
            const payload = {
                message: text,
                conversationHistory: messages,
                userContext: user
            };

            console.log("[POST] /api/jarvis", payload);

            // 3. Mock Response (Replace with fetch in future)
            await new Promise(r => setTimeout(r, 1200));

            let responseText = "I'm analyzing your request. Could you provide context?";
            const lowerInput = text.toLowerCase();

            if (lowerInput.includes("accuracy") || lowerInput.includes("performance")) {
                responseText = "Your top model (XGBoost) achieved **96.4% AUC**, which is 1.2% higher than the baseline.";
            } else if (lowerInput.includes("help") || lowerInput.includes("create")) {
                responseText = "To create a new experiment, go to the **Projects** page, upload your dataset, and click 'Run Experiment'.";
            } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
                responseText = `Hello ${firstName}. Ready to optimize some models today?`;
            }

            // 4. Add Assistant Message
            const jarvisMsg = { id: Date.now() + 1, sender: 'jarvis', text: responseText };
            setMessages(prev => [...prev, jarvisMsg]);

        } catch (error) {
            console.error("Jarvis API Error:", error);
            setMessages(prev => [...prev, { id: Date.now(), sender: 'jarvis', text: "I'm having trouble connecting to the neural core. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    // --- Renders ---

    // 1. HERO STATE (Empty Chat)
    if (!hasStarted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[85vh] text-center max-w-4xl mx-auto px-4 animate-fade-in">
                {/* Hero Greeting */}
                <div className="mb-12">
                    <div className="inline-flex mb-6 p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                        <Icon name="sparkles" size={32} className="text-cyan-400" />
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Hi {firstName}, <span className="text-gray-500">what can we build?</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        I'm ready to help you analyze data, train models, or explore your results.
                    </p>
                </div>

                {/* Main Input - Hero Style */}
                <div className="w-full max-w-2xl mb-12 relative z-20">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-lg"></div>
                        <div className="relative flex items-center bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 transition-transform transform group-hover:scale-[1.01]">
                            <div className="pl-4 pr-2">
                                <Icon name="search" size={24} className="text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask me anything about your experiments..."
                                className="w-full bg-transparent border-none text-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-0 px-4 py-3 outline-none"
                                autoFocus
                            />
                            <button onClick={() => handleSend()} className="p-3 bg-gray-100 dark:bg-gray-900 hover:bg-cyan-600 rounded-xl text-gray-400 hover:text-white transition-all">
                                <Icon name="arrowRight" size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                    <SuggestionButton icon="plus" label="Create project" onClick={() => navigate('/projects?new=true')} />
                    <SuggestionButton icon="chartBar" label="Analyze dataset" onClick={() => navigate('/run-experiment')} />
                    <SuggestionButton icon="gitWithArrow" label="Compare models" onClick={() => navigate('/compare')} />
                </div>
            </div>
        );
    }

    // 2. CHAT INTERFACE (Active)
    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto w-full animate-fade-in">
            {/* Header (Simplified) */}
            <div className="flex items-center justify-between mb-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Icon name="sparkles" size={16} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Jarvis <span className="text-gray-500 font-normal">Active Session</span></h2>
                </div>
                <button onClick={() => setMessages([])} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear Chat</button>
            </div>

            {/* Chat Window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 rounded-2xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800/50 backdrop-blur-sm shadow-inner relative custom-scrollbar">

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        <div className={`
                            max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 text-base leading-relaxed shadow-sm
                            ${msg.sender === 'user'
                                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-cyan-500/10'
                                : 'bg-white dark:bg-darkpanel text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50 rounded-bl-sm'
                            }
                        `}>
                            {msg.sender === 'jarvis' && (
                                <div className="mb-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                                    <Icon name="sparkles" size={12} /> JARVIS
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white dark:bg-darkpanel border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-cyan-500 mr-2">THINKING</span>
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="mt-4 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur-md pointer-events-none"></div>
                <div className="relative flex items-center bg-white dark:bg-darkpanel border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 px-4 py-3 outline-none"
                        autoFocus
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isTyping}
                        className={`p-3 rounded-xl transition-all ${!inputValue.trim() || isTyping ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg hover:shadow-cyan-500/25'}`}
                    >
                        <Icon name="arrowRight" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JarvisPage;
