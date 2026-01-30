/**
 * Mock Data Utility
 * Manages project and experiment data execution using localStorage.
 * Acts as a temporary data layer that can be swapped for API calls later.
 */

const KEYS = {
    PROJECTS: 'automl_projects',
    EXPERIMENTS: 'automl_experiments',
    DRAFT_PROJECT: 'automl_draft_project'
};

const MockData = {
    // --- Projects ---
    getProjects: () => {
        const data = localStorage.getItem(KEYS.PROJECTS);
        return data ? JSON.parse(data) : [];
    },

    addProject: (project) => {
        const projects = MockData.getProjects();
        // Check if project exists or update logic could go here
        const newProject = {
            id: Date.now().toString(),
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            status: "Active",
            domain: project.domain || "General",
            ...project
        };
        const updated = [newProject, ...projects];
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(updated));
        return newProject;
    },

    // --- Experiments ---
    getExperiments: () => {
        const data = localStorage.getItem(KEYS.EXPERIMENTS);
        return data ? JSON.parse(data) : [];
    },

    addExperiment: (experiment) => {
        const experiments = MockData.getExperiments();

        // Generate deterministic results
        const results = MockData.generateDeterministicResults(experiment.model);

        const newExperiment = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: "Running",
            projectId: experiment.projectId, // Strict linking
            ...experiment,
            ...results
        };
        const updated = [newExperiment, ...experiments];
        localStorage.setItem(KEYS.EXPERIMENTS, JSON.stringify(updated));

        // Update Project Timestamp
        if (experiment.projectId) {
            const projects = MockData.getProjects();
            const projIndex = projects.findIndex(p => p.id === experiment.projectId);
            if (projIndex !== -1) {
                projects[projIndex].updated = new Date().toISOString();
                localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
            }
        }

        return newExperiment;
    },

    updateExperimentStatus: (id, status, results = {}) => {
        const experiments = MockData.getExperiments();
        const index = experiments.findIndex(e => e.id === id);
        if (index !== -1) {
            experiments[index] = { ...experiments[index], status, ...results };
            localStorage.setItem(KEYS.EXPERIMENTS, JSON.stringify(experiments));
        }
    },

    // --- Flow Management (Drafts) ---
    setDraftProject: (filename) => {
        localStorage.setItem(KEYS.DRAFT_PROJECT, filename);
    },

    getDraftProject: () => {
        return localStorage.getItem(KEYS.DRAFT_PROJECT);
    },

    setDraftExperimentName: (name) => {
        localStorage.setItem('automl_draft_exp_name', name);
    },

    getDraftExperimentName: () => {
        return localStorage.getItem('automl_draft_exp_name');
    },

    clearDraft: () => {
        localStorage.removeItem(KEYS.DRAFT_PROJECT);
        localStorage.removeItem('automl_draft_exp_name');
    },

    // --- Helpers ---
    getProjectStats: (projectId) => {
        const experiments = MockData.getExperiments().filter(e => e.projectId === projectId);
        if (experiments.length === 0) return { count: 0, bestAccuracy: 'N/A' };

        // Calculate Best Accuracy
        const accuracies = experiments
            .map(e => parseFloat(e.metrics?.accuracy || 0));

        const best = Math.max(...accuracies);

        return {
            count: experiments.length,
            bestAccuracy: best > 0 ? (best * 100).toFixed(1) + '%' : 'N/A'
        };
    },

    generateDeterministicResults: (modelName) => {
        const seed = modelName.length;
        const baseAcc = 0.85 + (seed % 10) * 0.01;

        const lossCurve = Array.from({ length: 10 }, (_, i) => ({
            epoch: i + 1,
            loss: Math.max(0.1, 1.0 - (i * 0.08) - (Math.random() * 0.05)),
            val_loss: Math.max(0.15, 1.1 - (i * 0.07) - (Math.random() * 0.05))
        }));

        const leaderboard = [
            { model_id: `${modelName}_Best`, accuracy: (baseAcc + 0.02).toFixed(4), precision: (baseAcc + 0.01).toFixed(4), recall: (baseAcc - 0.01).toFixed(4), f1: (baseAcc + 0.015).toFixed(4), training_time_sec: 124.5, loss: 0.12, latency_ms: 45 },
            { model_id: `${modelName}_Ensemble`, accuracy: baseAcc.toFixed(4), precision: (baseAcc - 0.01).toFixed(4), recall: (baseAcc + 0.01).toFixed(4), f1: baseAcc.toFixed(4), training_time_sec: 156.2, loss: 0.15, latency_ms: 120 },
            { model_id: "XGBoost_Baseline", accuracy: (baseAcc - 0.05).toFixed(4), precision: (baseAcc - 0.06).toFixed(4), recall: (baseAcc - 0.04).toFixed(4), f1: (baseAcc - 0.05).toFixed(4), training_time_sec: 45.0, loss: 0.22, latency_ms: 30 },
            { model_id: "GLM_v2", accuracy: (baseAcc - 0.12).toFixed(4), precision: (baseAcc - 0.10).toFixed(4), recall: (baseAcc - 0.15).toFixed(4), f1: (baseAcc - 0.13).toFixed(4), training_time_sec: 10.5, loss: 0.35, latency_ms: 10 },
        ];

        // Generate aligned confusion matrix
        // Assuming 2 classes for simplicity: 0 and 1
        const totalSamples = 1000;
        const tp = Math.floor(totalSamples * (baseAcc + 0.02) / 2);
        const tn = Math.floor(totalSamples * (baseAcc + 0.02) / 2);
        const fp = Math.floor((totalSamples - tp - tn) / 2);
        const fn = totalSamples - tp - tn - fp;

        const confusion_matrix = [
            [tn, fp],
            [fn, tp]
        ];

        return {
            metrics: {
                accuracy: (baseAcc + 0.02).toFixed(4),
                auc: (baseAcc + 0.01).toFixed(4),
                f1: (baseAcc - 0.01).toFixed(4),
                precision: (baseAcc + 0.015).toFixed(4),
                recall: (baseAcc - 0.025).toFixed(4),
                training_time_sec: 124.5,
                cpu_peak: (20 + (seed % 30)).toFixed(1),
                ram_peak: (2 + (seed % 6)).toFixed(2)
            },
            loss_curve: lossCurve,
            leaderboard: leaderboard,
            confusion_matrix: confusion_matrix
        };
    },

    // --- Dev Tools ---
    resetAll: () => {
        localStorage.removeItem(KEYS.PROJECTS);
        localStorage.removeItem(KEYS.EXPERIMENTS);
        localStorage.removeItem(KEYS.DRAFT_PROJECT);
    }
};

export default MockData;
