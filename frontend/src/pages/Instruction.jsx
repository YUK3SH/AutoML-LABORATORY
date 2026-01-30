// src/pages/Instruction.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Instruction() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Title */}
      <header>
        <h1 className="text-3xl font-semibold mb-2">How to Use the AutoML Platform</h1>
        <p className="text-gray-600">
          Use this guide to explore how the AutoML Platform simplifies data processing, automates model selection, and delivers actionable insights.
        </p>
      </header>

      {/* Step 1 – Upload Dataset */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">1. Upload Your Dataset</h2>
        <p className="text-gray-700 text-sm mb-2">
          The first step is to provide a dataset (CSV format) for analysis.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Click <b>Upload Dataset</b> in the left sidebar.</li>
          <li>Select your CSV file (e.g., marketing_data.csv, diabetes.csv).</li>
          <li>Preview the first few rows to confirm the column names and target variable.</li>
          <li>The uploaded file will appear automatically in all ML tool sections.</li>
        </ul>
      </section>

      {/* Step 2 – Select & Run */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">2. Select & Run AutoML</h2>
        <p className="text-gray-700 text-sm mb-2">
          After uploading your dataset, you can begin the AutoML process.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Navigate to <b>Select / Run</b> under ML Tools.</li>
          <li>Choose the dataset you uploaded from the dropdown.</li>
          <li>Select the AutoML engine (H2O AutoML or AutoGluon).</li>
          <li>Click <b>Run</b> to start automated training.</li>
          <li>A progress window displays the training status and model evaluations.</li>
        </ul>
        <p className="text-gray-600 text-xs mt-2">
          *The system automatically handles preprocessing, model selection, hyperparameter tuning,
          and ranking of results.*
        </p>
      </section>

      {/* Step 3 – Result Page */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">3. View Results & Insights</h2>
        <p className="text-gray-700 text-sm mb-2">
          Once AutoML completes, detailed results and insights will be available.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Go to <b>Result</b> under ML Tools.</li>
          <li>See the <b>Top 5 performing models</b> selected by AutoML.</li>
          <li>Compare metrics such as Accuracy, F1-Score, Precision, Recall, and AUC.</li>
          <li>Explore model names like GBM, XGBoost, Random Forest, Neural Net, etc.</li>
          <li>Download or screenshot results for your reports.</li>
        </ul>
      </section>

      {/* Step 4 – System Logs */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">4. System Logs</h2>
        <p className="text-gray-700 text-sm">
          System Logs provide insights into model execution, errors, and processing time.
          This is mainly helpful if something fails during AutoML.
        </p>
      </section>

      {/* Tool Versions */}
      <section className="bg-white p-5 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">AutoML Engines Used</h2>
        <p className="text-gray-600 text-sm mb-3">
          Our platform uses industry-standard AutoML engines to deliver powerful model selection and training.
        </p>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-3 py-2 text-left">Engine</th>
              <th className="border px-3 py-2 text-left">What It Does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-3 py-2">H2O AutoML</td>
              <td className="border px-3 py-2">
                Trains multiple algorithms (GBM, Deep Learning, GLM, Stacked Ensembles) and selects the best model automatically.
              </td>
            </tr>
            <tr>
              <td className="border px-3 py-2">AutoGluon</td>
              <td className="border px-3 py-2">
                Specializes in tabular data and builds high-performance stacked ensemble models with minimal configuration.
              </td>
            </tr>
            <tr>
              <td className="border px-3 py-2">TPOT</td>
              <td className="border px-3 py-2">
                Uses genetic programming to automatically search, optimize, and construct efficient machine learning pipelines.
              </td>
            </tr>
            <tr>
              <td className="border px-3 py-2">FLAML</td>
              <td className="border px-3 py-2">
                Performs fast and lightweight AutoML using cost-effective hyperparameter optimization with minimal computational overhead.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Back */}
      <div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 border rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
