import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const TOOLS = [
  { key: "h2o", label: "H2O AutoML" },
  { key: "autogluon", label: "AutoGluon" },
  { key: "flaml", label: "FLAML" },
  { key: "tpot", label: "TPOT" }
];

export default function BenchmarkPage() {
  const [datasets, setDatasets] = useState([]);
  const [dataset, setDataset] = useState("");
  const [tool, setTool] = useState("h2o");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/list_files`)
      .then(res => res.json())
      .then(d => setDatasets(d.files || []));
  }, []);

  const runCompare = async () => {
    if (!dataset) return;
    setLoading(true);
    setData(null);

    const res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset, tool })
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Benchmark</h1>

        <div className="flex gap-4">
          <select
            className="px-3 py-2 bg-gray-800 text-green-400 rounded"
            value={dataset}
            onChange={e => setDataset(e.target.value)}
          >
            <option value="">Select Dataset</option>
            {datasets.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 bg-gray-800 text-green-400 rounded"
            value={tool}
            onChange={e => setTool(e.target.value)}
          >
            {TOOLS.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>

          <button
            onClick={runCompare}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-black rounded font-semibold"
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </div>
    );
  }

  const selected = data.selected;
  const others = data.others || [];

  const allRecords = TOOLS.map(t =>
    t.key === selected.tool
      ? selected
      : others.find(o => o.tool === t.key)
  );

  const metrics = ["accuracy", "precision", "recall", "f1"];
  const systemMetrics = [
    { key: "train_time_sec", label: "Train Time (s)" },
    { key: "cpu_peak_percent", label: "CPU Peak (%)" },
    { key: "ram_peak_gb", label: "RAM Peak (GB)" }
  ];

  const bestToolForMetric = metric => {
    let best = null;
    allRecords.forEach(r => {
      const v = r?.metrics?.[metric];
      if (v != null && (!best || v > best.value)) {
        best = { tool: r.tool, value: v };
      }
    });
    return best?.tool;
  };

  const bestToolForSystem = key => {
    let best = null;
    allRecords.forEach(r => {
      const v = r?.system?.[key];
      if (v != null && (!best || v < best.value)) {
        best = { tool: r.tool, value: v };
      }
    });
    return best?.tool;
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-white">Benchmark</h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MODEL METRICS */}
        <div className="border border-green-500 rounded-xl p-6 bg-black">
          <h2 className="text-green-400 font-bold mb-4">MODEL METRICS</h2>

          {metrics.map(m => (
            <div
              key={m}
              className="flex justify-between items-center border-b border-green-800 py-1 font-mono"
            >
              <span className="text-white uppercase">{m}</span>
              <span className="text-green-400">
                {(selected.metrics[m] * 100).toFixed(2)} %
              </span>
            </div>
          ))}
        </div>

        {/* SYSTEM USAGE */}
        <div className="border border-green-500 rounded-xl p-6 bg-black">
          <h2 className="text-green-400 font-bold mb-4">SYSTEM USAGE</h2>

          {systemMetrics.map(s => (
            <div
              key={s.key}
              className="flex justify-between items-center border-b border-green-800 py-1 font-mono"
            >
              <span className="text-white">{s.label}</span>
              <span className="text-green-400">
                {selected.system?.[s.key] ?? "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="border border-green-600 rounded-xl p-6 bg-black">
        <h2 className="text-green-400 font-bold mb-4">
          AutoML Benchmark Comparison
        </h2>

        <table className="w-full text-sm font-mono border border-green-700">
          <thead className="text-green-400">
            <tr>
              <th className="border border-green-700 p-2">Metric</th>
              {TOOLS.map(t => (
                <th key={t.key} className="border border-green-700 p-2">
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-green-200">
            {metrics.map(m => (
              <tr key={m}>
                <td className="border border-green-700 p-2 uppercase">{m}</td>

                {allRecords.map((r, i) => {
                  const v = r?.metrics?.[m];
                  const isBest = bestToolForMetric(m) === r?.tool;
                  return (
                    <td key={i} className="border border-green-700 p-2 text-center">
                      {v != null ? (v * 100).toFixed(2) + " %" : "-"}
                      {others.length > 0 && isBest && (
                        <span className="text-green-400"> ▲</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {systemMetrics.map(s => (
              <tr key={s.key}>
                <td className="border border-green-700 p-2 uppercase">
                  {s.label}
                </td>

                {allRecords.map((r, i) => {
                  const v = r?.system?.[s.key];
                  const isBest = bestToolForSystem(s.key) === r?.tool;
                  return (
                    <td key={i} className="border border-green-700 p-2 text-center">
                      {v ?? "-"}
                      {others.length > 0 && isBest && (
                        <span className="text-green-400"> ▲</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BEST OUTCOME SUMMARY */}
      <div className="border border-green-600 rounded-xl p-6 bg-black">
        <h2 className="text-green-400 font-bold mb-4">
          Best Outcome Summary
        </h2>

        <table className="w-full text-sm font-mono border border-green-700">
          <thead className="text-green-400">
            <tr>
              <th className="border border-green-700 p-2">Metric</th>
              <th className="border border-green-700 p-2">Best Tool</th>
            </tr>
          </thead>

          <tbody className="text-green-200">
            {metrics.map(m => (
              <tr key={m}>
                <td className="border border-green-700 p-2 uppercase">{m}</td>
                <td className="border border-green-700 p-2 text-center">
                  {bestToolForMetric(m) ?? "-"}
                </td>
              </tr>
            ))}

            {systemMetrics.map(s => (
              <tr key={s.key}>
                <td className="border border-green-700 p-2 uppercase">
                  {s.label}
                </td>
                <td className="border border-green-700 p-2 text-center">
                  {bestToolForSystem(s.key) ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
