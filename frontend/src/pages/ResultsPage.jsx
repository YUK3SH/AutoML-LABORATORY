import React from "react";

export default function ResultsPage({ data }) {
  if (!data) {
    return <div className="text-red-500">Missing dataset or tool</div>;
  }

  const {
    dataset,
    tool,
    leaderboard = [],
    metrics = {},
    training_time_sec
  } = data;

  const bestAccuracy =
    metrics.accuracy ??
    leaderboard[0]?.accuracy ??
    "N/A";

  const trainingTime =
    typeof training_time_sec === "number"
      ? `${training_time_sec.toFixed(2)} sec`
      : "N/A";

  return (
    <div className="bg-[#0D1117] min-h-screen text-[#C9D1D9] p-6 space-y-6">

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4">
        <Card label="Dataset" value={dataset} />
        <Card label="Tool" value={tool.toUpperCase()} />
        <Card label="Best Accuracy" value={bestAccuracy} highlight />
        <Card label="Training Time" value={trainingTime} />
      </div>

      {/* LEADERBOARD */}
      <div className="bg-[#161B22] border border-[#30363D] rounded">
        <div className="p-3 font-semibold border-b border-[#30363D]">
          Top Models Leaderboard
        </div>

        <table className="w-full text-sm">
          <thead className="text-[#8B949E]">
            <tr>
              <th className="p-3 text-left">Model</th>
              <th className="p-3 text-left">Accuracy</th>
              <th className="p-3 text-left">Loss</th>
              <th className="p-3 text-left">Latency</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((m, i) => (
              <tr key={i} className="border-t border-[#30363D]">
                <td className="p-3">{m.model_id}</td>
                <td className="p-3">{m.accuracy ?? "N/A"}</td>
                <td className="p-3">{m.loss ?? "N/A"}</td>
                <td className="p-3">
                  {m.latency_ms ? `${m.latency_ms} ms` : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function Card({ label, value, highlight }) {
  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded p-4">
      <div className="text-xs text-[#8B949E] uppercase">{label}</div>
      <div className={`text-xl ${highlight ? "text-green-400" : ""}`}>
        {value}
      </div>
    </div>
  );
}
