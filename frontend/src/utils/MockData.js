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
        // For now, we assume every run creates a "Project" entry or updates one
        const newProject = {
            id: Date.now(),
            updated: new Date().toLocaleDateString(),
            status: "Active",
            count: 1,
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
            id: Date.now(),
            date: new Date().toISOString(),
            status: "Running",
            ...experiment,
            ...results
        };
        const updated = [newExperiment, ...experiments];
        localStorage.setItem(KEYS.EXPERIMENTS, JSON.stringify(updated));

        // Also ensure a corresponding project exists or update it
        // Simplified logic: If project name doesn't exist in project list, add it. 
        // Real logic would be more complex.
        const projects = MockData.getProjects();
        const existingProj = projects.find(p => p.name === experiment.project);

        if (existingProj) {
            // Update existing project count
            existingProj.count += 1;
            existingProj.updated = "Just now";
            localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
        } else {
            // Create new project entry
            MockData.addProject({
                name: experiment.project,
                type: "AutoML", // Generic type
                count: 1
            });
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
    generateDeterministicResults: (modelName) => {
        const seed = modelName.length;
        const baseAcc = 0.85 + (seed % 10) * 0.01;

        const lossCurve = Array.from({ length: 10 }, (_, i) => ({
            epoch: i + 1,
            loss: Math.max(0.1, 1.0 - (i * 0.08) - (Math.random() * 0.05)),
            val_loss: Math.max(0.15, 1.1 - (i * 0.07) - (Math.random() * 0.05))
        }));

        const leaderboard = [
            { model_id: `${modelName}_Best`, accuracy: (baseAcc + 0.02).toFixed(4), loss: 0.12, latency_ms: 45 },
            { model_id: `${modelName}_Ensemble`, accuracy: baseAcc.toFixed(4), loss: 0.15, latency_ms: 120 },
            { model_id: "XGBoost_Baseline", accuracy: (baseAcc - 0.05).toFixed(4), loss: 0.22, latency_ms: 30 },
            { model_id: "GLM_v2", accuracy: (baseAcc - 0.12).toFixed(4), loss: 0.35, latency_ms: 10 },
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
            leaderboard: leaderboard
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
