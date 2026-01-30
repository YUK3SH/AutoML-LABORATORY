import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icons';

export default function Chat() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'jarvis', text: "Hello. I am Jarvis, your AutoML assistant. Ask me about your experiment results, model performance, or how to improve your accuracy." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock Intelligent Response Logic
        setTimeout(() => {
            let responseText = "I'm analyzing your request. Could you provide context?";
            const lowerInput = input.toLowerCase();

            if (lowerInput.includes("accuracy") || lowerInput.includes("performance")) {
                responseText = "Your top model (XGBoost) achieved **96.4% AUC**, which is 1.2% higher than the baseline. This was primarily due to optimized depth parameters and feature interaction scaling.";
            } else if (lowerInput.includes("won") || lowerInput.includes("win") || lowerInput.includes("best")) {
                responseText = "The **XGBoost** model won because it effectively captured non-linear relationships in the 'customer_age' and 'transaction_volume' features, unlike the linear models.";
            } else if (lowerInput.includes("failed") || lowerInput.includes("error")) {
                responseText = "Experiment **Exp-2024-005** failed due to an Out of Memory (OOM) error. I recommend increasing the memory limit to 16GB or reducing the batch size for the Deep Learning component.";
            } else if (lowerInput.includes("help") || lowerInput.includes("create")) {
                responseText = "To create a new experiment, go to the **Projects** page, upload your dataset, and click 'Run Experiment'. I can guide you through the parameter selection if you wish.";
            } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
                responseText = "Greetings again. Ready to optimize some models?";
            }

            const jarvisMsg = { id: Date.now() + 1, sender: 'jarvis', text: responseText };
            setMessages(prev => [...prev, jarvisMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Icon name="messageSquare" size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Jarvis Assistant</h1>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <span className="block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online & Ready
                        </p>
                    </div>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl" noPadding>
                {/* Chat Window */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-black/20">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`
                                max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm
                                ${msg.sender === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-sm'
                                    : 'bg-white dark:bg-darkpanel text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                                }
                            `}>
                                {msg.sender === 'jarvis' && (
                                    <div className="mb-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">JARVIS</div>
                                )}
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-darkpanel border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                                <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mr-2">JARVIS</div>
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

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-darkpanel border-t border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSend} className="relative flex items-center gap-3">
                        <div className="absolute left-4 text-gray-400">
                            <Icon name="search" size={18} />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Jarvis anything..."
                            className="flex-1 block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 px-4 py-3 pl-11 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className={`p-3 rounded-xl transition-all ${!input.trim() || isTyping ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg hover:shadow-cyan-500/25'}`}
                        >
                            <Icon name="chevronRight" size={20} />
                        </button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
