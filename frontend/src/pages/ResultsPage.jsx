import React, { useState } from "react";
import axios from "axios";

export default function BenchmarkPage() {
  const [dataset, setDataset] = useState("");
  const [tool, setTool] = useState("");
  const [data, setData] = useState(null);

  const handleCompare = async () => {
    const res = await axios.post("http://127.0.0.1:8000/compare", {
      dataset,
      tool,
    });
    setData(res.data);
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-green-400">Benchmark</h1>
        <button
          onClick={handleCompare}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Compare
        </button>
      </div>
    );
  }

  const all = [data.selected, ...data.others].filter(Boolean);

  const metricKeys = ["accuracy", "precision", "recall", "f1"];

  const bestToolByMetric = {};
  metricKeys.forEach((m) => {
    let best = null;
    all.forEach((r) => {
      if (!best || r.metrics[m] > best.metrics[m]) {
        best = r;
      }
    });
    bestToolByMetric[m] = best?.tool;
  });

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-green-400">Benchmark</h1>

      {/* MODEL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="MODEL METRICS">
          <Row label="Tool" value={data.selected.tool} />
          <Row label="Model ID" value={data.selected.best_model} />
          {metricKeys.map((k) => (
            <Row
              key={k}
              label={k.toUpperCase()}
              value={`${(data.selected.metrics[k] * 100).toFixed(2)} %`}
            />
          ))}
        </InfoCard>

        <InfoCard title="SYSTEM USAGE">
          <Row label="Train Time" value={data.selected.system.train_time} />
          <Row label="CPU Peak" value={data.selected.system.cpu_peak} />
          <Row label="RAM Peak" value={data.selected.system.ram_peak} />
        </InfoCard>
      </div>

      {/* COMPARISON TABLE */}
      <InfoCard title="AutoML Benchmark Comparison">
        <table className="w-full text-sm border border-green-700">
          <thead className="text-green-400">
            <tr>
              <th className="border p-2">Metric</th>
              {all.map((r) => (
                <th key={r.tool} className="border p-2">
                  {r.tool}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">MODEL ID</td>
              {all.map((r) => (
                <td key={r.tool} className="border p-2 break-all">
                  {r.best_model}
                </td>
              ))}
            </tr>

            {metricKeys.map((m) => (
              <tr key={m}>
                <td className="border p-2">{m.toUpperCase()}</td>
                {all.map((r) => {
                  const val = r.metrics[m];
                  const best = bestToolByMetric[m] === r.tool;
                  return (
                    <td key={r.tool} className="border p-2 text-center">
                      {(val * 100).toFixed(2)} %
                      {best && (
                        <span className="ml-1 text-green-400">▲</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </InfoCard>

      {/* BEST OUTCOME SUMMARY */}
      <InfoCard title="Best Outcome Summary">
        <table className="w-full border border-green-700 text-sm">
          <thead className="text-green-400">
            <tr>
              <th className="border p-2">Metric</th>
              <th className="border p-2">Best Tool</th>
            </tr>
          </thead>
          <tbody>
            {metricKeys.map((m) => (
              <tr key={m}>
                <td className="border p-2">{m.toUpperCase()}</td>
                <td className="border p-2">{bestToolByMetric[m]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfoCard>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function InfoCard({ title, children }) {
  return (
    <div className="border border-green-600 rounded-xl p-6 bg-black">
      <h2 className="text-green-400 font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1 font-mono text-green-200">
      <span>{label}</span>
      <span className="break-all">{value}</span>
    </div>
  );
}
