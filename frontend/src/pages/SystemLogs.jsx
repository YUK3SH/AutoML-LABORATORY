import React, { useEffect, useRef, useState } from "react";

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);

  const logRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/system_logs");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "log") {
          setLogs((p) => [...p, msg.message]);
        }

        if (msg.type === "system_info") {
          setInfo(msg.data);
        }

        if (msg.type === "system_stats") {
          setStats(msg.data);
        }
      } catch {}
    };

    ws.onerror = () => {
      setLogs((p) => [...p, "[error] System log connection failed"]);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        System Logs
      </h2>

      {/* SYSTEM INFO */}
      {info && (
        <div className="mb-4 text-sm grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
          <div><b>OS:</b> {info.os}</div>
          <div><b>Python:</b> {info.python_version}</div>
          <div><b>CPU Cores:</b> {info.cpu_cores}</div>
          <div><b>Threads:</b> {info.cpu_threads}</div>
          <div><b>Total RAM:</b> {info.ram_total_gb} GB</div>
        </div>
      )}

      {/* LIVE STATS */}
      {stats && (
        <div className="mb-4 text-sm grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
          <div><b>CPU Usage:</b> {stats.cpu_usage_percent}%</div>
          <div><b>RAM Used:</b> {stats.ram_used_gb} GB</div>
          <div><b>RAM %:</b> {stats.ram_percent}%</div>
          <div><b>Uptime:</b> {stats.uptime_sec}s</div>
        </div>
      )}

      {/* LOG TERMINAL */}
      <div
        ref={logRef}
        className="font-mono text-sm rounded-md
                   border border-gray-300 dark:border-gray-700
                   bg-gray-100 dark:bg-black
                   text-green-600 dark:text-green-400
                   h-[360px] overflow-y-auto px-3 py-2 whitespace-pre-wrap"
      >
        {logs.length === 0 ? (
          <div>[system] Waiting for system events...</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="leading-snug">{l}</div>
          ))
        )}
      </div>
    </section>
  );
}
