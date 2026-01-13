import React, { useEffect, useState } from "react";

export default function BenchmarkPage() {
  const params = new URLSearchParams(window.location.search);
  const dataset = params.get("dataset");
  const tool = params.get("tool");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dataset || !tool) {
      setError("Missing dataset or tool");
      setLoading(false);
      return;
    }

    fetch("http://localhost:8000/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset, tool }),
    })
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load benchmark data");
        setLoading(false);
      });
  }, [dataset, tool]);

  if (loading) {
    return <div style={{ padding: 40, color: "#8B949E" }}>Loading benchmark…</div>;
  }

  if (error) {
    return <div style={{ padding: 40, color: "#DA3633" }}>{error}</div>;
  }

  const { selected, others } = data;

  return (
    <div className="benchmark-container">
      <style>{`
        :root {
          --bg-app: #0D1117;
          --bg-panel: #161B22;
          --bg-hover: #21262D;
          --border: #30363D;
          --text-primary: #C9D1D9;
          --text-secondary: #8B949E;
          --accent-green: #2EA043;
          --accent-red: #DA3633;
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
        }

        tr:hover td {
          background: var(--bg-hover);
        }

        .mono {
          font-family: monospace;
        }
      `}</style>

      {/* HEADER */}
      <div className="panel">
        <div className="mono">
          Dataset: <strong>{dataset}</strong> <br />
          Base Tool: <strong>{tool}</strong>
        </div>
      </div>

      {/* VISUAL PLACEHOLDERS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="panel">Metric Trade-offs (Radar – coming soon)</div>
        <div className="panel">Relative Loss Curves (coming soon)</div>
      </div>

      {/* TABLE */}
      <div className="panel">
        <div style={{ marginBottom: 12, fontWeight: 600 }}>
          Detailed Metrics Comparison
        </div>

        <table>
          <thead>
            <tr>
              <th>Run</th>
              <th>Accuracy</th>
              <th>Loss</th>
              <th>Latency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {/* Base */}
            <tr>
              <td className="mono">Base ({selected.tool})</td>
              <td>{selected.accuracy}%</td>
              <td>{selected.loss}</td>
              <td>{selected.latency} ms</td>
              <td>{selected.duration}</td>
            </tr>

            {/* Others */}
            {others.map((r, i) => (
              <tr key={i}>
                <td className="mono">{r.tool}</td>
                <td
                  style={{
                    color:
                      r.accuracy > selected.accuracy
                        ? "var(--accent-green)"
                        : "var(--accent-red)",
                  }}
                >
                  {r.accuracy}%
                </td>
                <td>{r.loss}</td>
                <td>{r.latency} ms</td>
                <td>{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
