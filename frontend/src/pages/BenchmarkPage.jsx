import React, { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function BenchmarkPage() {
  const params = new URLSearchParams(window.location.search);
  const qsDataset = params.get("dataset");
  const qsTool = params.get("tool");

  const [dataset, setDataset] = useState(qsDataset);
  const [tool, setTool] = useState(qsTool);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/compare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dataset: dataset ?? "*",
            tool: tool ?? "*",
          }),
        });
        const json = await res.json();
        setDataset(json.selected.dataset);
        setTool(json.selected.tool);
        setData(json);
        setLoading(false);
      } catch {
        setError("Failed to load benchmark");
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (error) return <div style={{ padding: 40 }}>{error}</div>;

  const rows = [data.selected, ...data.others];

  /* ---------------- HELPERS ---------------- */

  const fmt = (v) => {
    if (typeof v !== "number") return v;
    const s = v.toString();
    const i = s.indexOf(".");
    return i === -1 ? v : Number(s.slice(0, i + 5));
  };

  const extrema = (getter, lowerIsBetter = false) => {
    const vals = rows
      .map(getter)
      .filter((v) => typeof v === "number");
    if (!vals.length) return {};
    return {
      best: lowerIsBetter ? Math.min(...vals) : Math.max(...vals),
      worst: lowerIsBetter ? Math.max(...vals) : Math.min(...vals),
    };
  };

  const accEx = extrema(r => r.metrics?.accuracy);
  const precEx = extrema(r => r.metrics?.precision);
  const recEx = extrema(r => r.metrics?.recall);
  const f1Ex = extrema(r => r.metrics?.f1);
  const timeEx = extrema(r => r.system?.train_time_sec, true);
  const cpuEx = extrema(r => r.system?.cpu_peak_percent, true);
  const ramEx = extrema(r => r.system?.ram_peak_gb, true);

  const render = (val, ex) => (
    <span>
      {fmt(val)}
      {val === ex.best && <span className="up"> ▲</span>}
      {val === ex.worst && <span className="down"> ▼</span>}
    </span>
  );

  /* ----------------------------------------- */

  return (
    <div className="benchmark-container">
      <style>{`
        :root {
          --bg-app: #0D1117;
          --bg-panel: #161B22;
          --bg-hover: #21262D;
          --border: #30363D;
          --text-primary: #C9D1D9;
          --green: #2EA043;
          --red: #DA3633;
        }
        .benchmark-container {
          background: var(--bg-app);
          color: var(--text-primary);
          min-height: 100vh;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-family: system-ui;
        }
        .panel {
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th, td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          text-align: left;
          white-space: nowrap;
        }
        tr:hover td { background: var(--bg-hover); }
        .mono { font-family: monospace; }
        .up { color: var(--green); }
        .down { color: var(--red); }
      `}</style>

      {/* HEADER */}
      <div className="panel mono">
        Dataset: <strong>{dataset}</strong><br />
        Base Tool: <strong>{tool}</strong>
      </div>

      {/* PLACEHOLDERS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="panel">Metric Trade-offs (Radar – later)</div>
        <div className="panel">Relative Loss Curves (later)</div>
      </div>

      {/* DETAILED METRICS COMPARISON (LOCKED STRUCTURE) */}
      <div className="panel">
        <div style={{ marginBottom: 12, fontWeight: 600 }}>
          Detailed Metrics Comparison
        </div>

        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Best Model</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1</th>
              <th>Train Time (s)</th>
              <th>CPU Peak (%)</th>
              <th>RAM Peak (GB)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="mono">{r.tool}</td>
                <td className="mono">{r.best_model}</td>
                <td>{render(r.metrics?.accuracy, accEx)}</td>
                <td>{render(r.metrics?.precision, precEx)}</td>
                <td>{render(r.metrics?.recall, recEx)}</td>
                <td>{render(r.metrics?.f1, f1Ex)}</td>
                <td>{render(r.system?.train_time_sec, timeEx)}</td>
                <td>{render(r.system?.cpu_peak_percent, cpuEx)}</td>
                <td>{render(r.system?.ram_peak_gb, ramEx)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BEST METRICS OUTCOME (UNCHANGED) */}
      <div className="panel">
        <div style={{ marginBottom: 12, fontWeight: 600 }}>
          Best Metrics Outcome
        </div>

        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Best Tool</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Accuracy", accEx.best],
              ["Precision", precEx.best],
              ["Recall", recEx.best],
              ["F1 Score", f1Ex.best],
              ["Train Time (s)", timeEx.best],
              ["CPU Peak (%)", cpuEx.best],
              ["RAM Peak (GB)", ramEx.best],
            ].map(([label, best], i) => {
              const toolName =
                rows.find(r =>
                  r.metrics?.accuracy === best ||
                  r.metrics?.precision === best ||
                  r.metrics?.recall === best ||
                  r.metrics?.f1 === best ||
                  r.system?.train_time_sec === best ||
                  r.system?.cpu_peak_percent === best ||
                  r.system?.ram_peak_gb === best
                )?.tool ?? "N/A";

              return (
                <tr key={i}>
                  <td>{label}</td>
                  <td className="mono">{toolName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
