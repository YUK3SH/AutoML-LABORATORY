import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MetricsDisplay from "../components/MetricsDisplay";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const result = state.result;
  const filename = state.filename;

  if (!result) {
    return <div>No results available</div>;
  }

  const metrics = result.metrics || {};
  const cm = result.confusion_matrix;
  const topModels = result.top_models || [];

  return (
    <section className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">AutoML Results Dashboard</h2>
          <p className="text-sm text-gray-600">Dataset: {filename}</p>
        </div>
        <button
          onClick={() => navigate("/h2o", { state: { filename } })}
          className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded"
        >
          Run Again
        </button>
      </div>

      <MetricsDisplay metrics={metrics} />

      {cm && (
        <div className="mt-6 border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3">Confusion Matrix</h3>
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th></th>
                {cm.labels.map((l) => (
                  <th key={l} className="border px-3 py-2 bg-yellow-100">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cm.matrix.map((row, i) => (
                <tr key={i}>
                  <th className="border px-3 py-2 bg-yellow-100">
                    {cm.labels[i]}
                  </th>
                  {row.map((v, j) => (
                    <td
                      key={j}
                      className="border px-3 py-2 text-center bg-blue-50"
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">
          Top 5 Models (Leaderboard)
        </h3>

        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border px-2 py-2 text-left">model_id</th>
              <th className="border px-2 py-2">accuracy</th>
              <th className="border px-2 py-2">precision</th>
              <th className="border px-2 py-2">recall</th>
              <th className="border px-2 py-2">f1</th>
            </tr>
          </thead>
          <tbody>
            {topModels.map((m, i) => (
              <tr key={i}>
                <td className="border px-2 py-2 font-mono">{m.model_id}</td>
                <td className="border px-2 py-2">{m.accuracy ?? "N/A"}</td>
                <td className="border px-2 py-2">{m.precision ?? "N/A"}</td>
                <td className="border px-2 py-2">{m.recall ?? "N/A"}</td>
                <td className="border px-2 py-2">{m.f1 ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
