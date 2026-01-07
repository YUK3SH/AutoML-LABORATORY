import React from "react";

function MetricCard({ label, value }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex flex-col items-center shadow-sm">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-xl font-semibold text-blue-700 mt-1">
        {value}
      </div>
    </div>
  );
}

function formatPercent(v) {
  if (typeof v !== "number" || isNaN(v)) return "N/A";
  return (v * 100).toFixed(2) + "%";
}

function safeNumber(v, digits = 4) {
  if (typeof v !== "number" || isNaN(v)) return "N/A";
  return v.toFixed(digits);
}

function getCellStyle(value, max) {
  const intensity = max === 0 ? 0 : value / max;
  return {
    backgroundColor: `rgba(59,130,246,${0.15 + intensity * 0.6})`,
  };
}

export default function MetricsDisplay({ metrics }) {
  if (!metrics || Object.keys(metrics).length === 0) {
    return <p className="text-sm text-gray-600">No metrics available.</p>;
  }

  const isClassification =
    typeof metrics.accuracy === "number" ||
    typeof metrics.f1 === "number";

  const isRegression =
    typeof metrics.rmse === "number" ||
    typeof metrics.mae === "number";

  const cm = metrics.confusion_matrix;
  let maxVal = 0;

  if (cm?.matrix) {
    maxVal = Math.max(...cm.matrix.flat());
  }

  return (
    <>
      {isClassification && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Accuracy" value={formatPercent(metrics.accuracy)} />
            <MetricCard label="Precision" value={formatPercent(metrics.precision)} />
            <MetricCard label="Recall" value={formatPercent(metrics.recall)} />
            <MetricCard label="F1 Score" value={formatPercent(metrics.f1)} />
          </div>

          {cm?.matrix && cm?.labels && (
            <div className="border rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold mb-3">
                Confusion Matrix
              </h3>

              <div className="overflow-x-auto">
                <table className="border-collapse text-xs mx-auto">
                  <thead>
                    <tr>
                      <th className="px-3 py-2"></th>
                      <th colSpan={cm.labels.length} className="px-3 py-2 text-center">
                        Predicted
                      </th>
                    </tr>
                    <tr>
                      <th className="px-3 py-2">Actual</th>
                      {cm.labels.map((l) => (
                        <th key={l} className="px-3 py-2 text-center">
                          {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cm.matrix.map((row, i) => (
                      <tr key={i}>
                        <th className="px-3 py-2 text-right">
                          {cm.labels[i]}
                        </th>
                        {row.map((v, j) => (
                          <td
                            key={j}
                            className="px-4 py-3 text-center font-mono"
                            style={getCellStyle(v, maxVal)}
                          >
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {isRegression && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard label="RMSE" value={safeNumber(metrics.rmse)} />
          <MetricCard label="MAE" value={safeNumber(metrics.mae)} />
          <MetricCard label="R²" value={safeNumber(metrics.r2)} />
        </div>
      )}
    </>
  );
}
