import React from "react";

export default function ModelCard({ model }) {
  if (!model) return null;

  const formatPercent = (v) =>
    v === null || v === undefined || isNaN(v)
      ? "0.00%"
      : (v * 100).toFixed(2) + "%";

  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm text-sm">
      <div className="font-mono text-xs text-gray-700 break-all mb-2">
        {model.model_id}
      </div>
      {"accuracy" in model && (
        <>
          <div>Accuracy: {formatPercent(model.accuracy)}</div>
          <div>Precision: {formatPercent(model.precision)}</div>
          <div>Recall: {formatPercent(model.recall)}</div>
          <div>F1 Score: {formatPercent(model.f1)}</div>
          <div className="mt-1 text-xs text-gray-500">
            Δ from best: {formatPercent(model.difference_from_best)}
          </div>
        </>
      )}
      {"rmse" in model && (
        <>
          <div>RMSE: {model.rmse.toFixed(4)}</div>
          <div>MAE: {model.mae.toFixed(4)}</div>
          <div>R²: {model.r2.toFixed(4)}</div>
          <div className="mt-1 text-xs text-gray-500">
            Δ from best (RMSE): {model.difference_from_best.toFixed(4)}
          </div>
        </>
      )}
    </div>
  );
}
