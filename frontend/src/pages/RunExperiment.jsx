import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MockData from '../utils/MockData';
import Icon from '../components/Icons';

export default function RunExperiment() {
    const navigate = useNavigate();

    // Step Management
    const [step, setStep] = useState(1);

    // Form Data
    const [expName, setExpName] = useState("");
    const [dataset, setDataset] = useState("");
    const [selectedTool, setSelectedTool] = useState(null);

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const logsEndRef = useRef(null);

    // --- Initialization ---
    useEffect(() => {
        // Load persist state
        const savedName = MockData.getDraftExperimentName();
        const savedDataset = MockData.getDraftProject();

        if (savedName) setExpName(savedName);
        if (savedDataset) setDataset(savedDataset);
    }, []);

    // Scroll logs to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // --- Persist Helpers ---
    const handleNameChange = (e) => {
        const val = e.target.value;
        setExpName(val);
        MockData.setDraftExperimentName(val);
    };

    const handleSelectDataset = () => {
        navigate('/upload');
    };

    // --- Execution Logic ---
    const addLog = (msg, type = "info") => {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [...prev, { time: timestamp, msg, type }]);
    };

    const startExecution = () => {
        setStep(3);
        setIsRunning(true);
        setProgress(0);
        setLogs([]);

        addLog("Initializing execution environment...", "system");

        const sequence = [
            { t: 1000, p: 5, msg: "Checking system resources [CPU/GPU]...", type: "system" },
            { t: 2000, p: 10, msg: `Loading dataset '${dataset}'...`, type: "info" },
            { t: 3000, p: 15, msg: "Dataset loaded successfully (Rows: 12,450, Cols: 24)", type: "success" },
            { t: 4000, p: 20, msg: "Analyzing feature schema...", type: "info" },
            { t: 6000, p: 30, msg: "Preprocessing: Handling missing values...", type: "info" },
            { t: 8000, p: 40, msg: "Preprocessing: Encoding categorical variables...", type: "info" },
            { t: 10000, p: 50, msg: `Initializing ${tools.find(t => t.id === selectedTool).name} engine...`, type: "system" },
            { t: 12000, p: 55, msg: "Starting training fold 1/5 [XGBoost]...", type: "info" },
            { t: 15000, p: 65, msg: "Fold 1 complete. Val Accuracy: 92.4%", type: "success" },
            { t: 17000, p: 70, msg: "Starting training fold 2/5 [LightGBM]...", type: "info" },
            { t: 20000, p: 80, msg: "Fold 2 complete. Val Accuracy: 94.1%", type: "success" },
            { t: 22000, p: 90, msg: "Ensembling final models...", type: "info" },
            { t: 24000, p: 100, msg: "Run completed successfully.", type: "success" }
        ];

        sequence.forEach(({ t, p, msg, type }) => {
            setTimeout(() => {
                setProgress(p);
                addLog(msg, type);
                if (p === 100) {
                    finishExperiment();
                }
            }, t);
        });
    };

    const finishExperiment = () => {
        setTimeout(() => {
            // Save final valid result
            MockData.addExperiment({
                name: expName,
                project: dataset,
                model: tools.find(t => t.id === selectedTool).name,
                accuracy: "94.1%",
                duration: "24s",
                status: "Completed"
            });

            MockData.clearDraft();
            setIsRunning(false);
            navigate('/experiments');
        }, 2000);
    };

    const tools = [
        { id: 'h2o', name: 'H2O AutoML', desc: 'Best for tabular data', recommended: true },
        { id: 'autogluon', name: 'AutoGluon', desc: 'High accuracy ensemble' },
        { id: 'tpot', name: 'TPOT', desc: 'Genetic programming' },
        { id: 'flaml', name: 'FLAML', desc: 'Lightweight & fast' },
    ];

    // --- Render Steps ---

    if (step === 3) {
        // EXECUTION CONSOLE
        return (
            <div className="max-w-5xl mx-auto h-[80vh] flex flex-col animate-fade-in relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Running Experiment: {expName}
                        </h2>
                        <p className="text-sm text-gray-500 font-mono">{tools.find(t => t.id === selectedTool)?.name} | {dataset}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Terminal Window */}
                <div className="flex-1 bg-black rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col font-mono text-sm relative">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <span className="ml-2 text-gray-400 text-xs">automl-console — node-1</span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-2 custom-scrollbar">
                        {logs.map((log, i) => (
                            <div key={i} className="animate-slide-up" style={{ animationDuration: '200ms' }}>
                                <span className="text-gray-500 mr-3">[{log.time}]</span>
                                {log.type === 'system' && <span className="text-purple-400 font-bold mr-2">SYS</span>}
                                {log.type === 'error' && <span className="text-red-500 font-bold mr-2">ERR</span>}
                                {log.type === 'success' && <span className="text-green-400 mr-2">✔</span>}
                                {log.type === 'info' && <span className="text-blue-400 mr-2">ℹ</span>}
                                <span className={
                                    log.type === 'error' ? 'text-red-300' :
                                        log.type === 'success' ? 'text-green-300' :
                                            log.type === 'system' ? 'text-purple-200' :
                                                'text-gray-300'
                                }>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                        {isRunning && (
                            <div className="animate-pulse text-cyan-500 mt-2">_</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate('/projects')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                    <Icon name="chevron" className="rotate-180" size={20} />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">New Experiment</h1>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-cyan-100 dark:bg-cyan-900/30 ring-2 ring-cyan-500' : 'bg-gray-100 dark:bg-gray-800'}`}>1</div>
                    <span className="font-medium">Setup</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-cyan-100 dark:bg-cyan-900/30 ring-2 ring-cyan-500' : 'bg-gray-100 dark:bg-gray-800'}`}>2</div>
                    <span className="font-medium">Engine</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-cyan-100 dark:bg-cyan-900/30 ring-2 ring-cyan-500' : 'bg-gray-100 dark:bg-gray-800'}`}>3</div>
                    <span className="font-medium">Run</span>
                </div>
            </div>

            {/* Wizard Content */}
            <div className="bg-white dark:bg-darkpanel p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[400px]">

                {/* STEP 1: SETUP */}
                {step === 1 && (
                    <div className="space-y-6 animate-slide-up">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Experiment Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={expName}
                                onChange={handleNameChange}
                                placeholder="e.g. Customer Churn V1"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Dataset <span className="text-red-500">*</span></label>
                            {dataset ? (
                                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-800/30 text-green-600 rounded-lg flex items-center justify-center">
                                            <Icon name="folder" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{dataset}</p>
                                            <p className="text-xs text-green-600 dark:text-green-400">Ready for training</p>
                                        </div>
                                    </div>
                                    <button onClick={handleSelectDataset} className="text-sm text-gray-500 underline hover:text-cyan-600">Change</button>
                                </div>
                            ) : (
                                <div
                                    onClick={handleSelectDataset}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-cyan-500 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:text-cyan-500 mb-2 transition-colors">
                                        <Icon name="plus" size={24} />
                                    </div>
                                    <p className="font-medium text-gray-600 dark:text-gray-300">Select or Upload Dataset</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: ENGINE */}
                {step === 2 && (
                    <div className="animate-slide-up">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Select AutoML Engine</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tools.map((tool) => (
                                <div
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={`
                                        relative p-6 rounded-xl border-2 cursor-pointer transition-all
                                        ${selectedTool === tool.id
                                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-blue-700 bg-white dark:bg-darkpanel'
                                        }
                                    `}
                                >
                                    {tool.recommended && (
                                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">REC</span>
                                    )}
                                    <h3 className="font-bold text-gray-900 dark:text-white">{tool.name}</h3>
                                    <p className="text-sm text-gray-500">{tool.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                {step > 1 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                        Back
                    </button>
                ) : <span></span>}

                {step === 1 && (
                    <button
                        onClick={() => setStep(2)}
                        disabled={!expName || !dataset} // Ensure name/dataset mandatory
                        className={`
                            px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center gap-2
                            ${!expName || !dataset
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transform hover:-translate-y-0.5'
                            }
                        `}
                    >
                        <span>Next Step</span>
                        <Icon name="chevronRight" size={18} />
                    </button>
                )}

                {step === 2 && (
                    <button
                        onClick={startExecution}
                        disabled={!selectedTool}
                        className={`
                            px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all flex items-center gap-2
                            ${!selectedTool
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-500 hover:shadow-green-500/25 transform hover:-translate-y-0.5'
                            }
                        `}
                    >
                        <Icon name="play" size={18} fill="currentColor" />
                        <span>Start Training</span>
                    </button>
                )}
            </div>
        </div>
    );
}
