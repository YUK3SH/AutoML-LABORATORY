import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function H2OPage({ setLastResult }) {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedTool, setSelectedTool] = useState("h2o");
  const [loading, setLoading] = useState(false);

  const [logMessages, setLogMessages] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [systemStats, setSystemStats] = useState(null);

  const logRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logMessages]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/list_files")
      .then((res) => setFiles(res.data.files || []))
      .catch(() => setFiles([]));
  }, []);

  const runAutoML = () => {
    if (!selectedFile) return;

    setLoading(true);
    setLogMessages(["[system] Starting AutoML..."]);
    setSystemInfo(null);
    setSystemStats(null);
    resultRef.current = null;

    const wsUrl =
      selectedTool === "h2o"
        ? "ws://127.0.0.1:8000/ws/automl"
        : selectedTool === "tpot"
        ? "ws://127.0.0.1:8000/ws/tpot"
        : selectedTool === "flaml"
        ? "ws://127.0.0.1:8000/ws/flaml"
        : "ws://127.0.0.1:8000/ws/autogluon";

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ filename: selectedFile }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "log") {
        setLogMessages((p) => [...p, msg.message]);
      }

      if (msg.type === "system_info") {
        setSystemInfo(msg.data);
      }

      if (msg.type === "system_stats") {
        setSystemStats(msg.data);
      }

      if (msg.type === "result") {
        resultRef.current = msg.data;
      }

      if (msg.type === "done") {
        ws.close();
        setLoading(false);

        if (resultRef.current) {
          // ✅ THIS IS THE CRITICAL FIX
          setLastResult(resultRef.current);
          navigate("/results");
        }
      }
    };

    ws.onerror = () => {
      setLogMessages((p) => [...p, "[error] WebSocket failed"]);
      setLoading(false);
    };
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 h-full">
      <h2 className="text-xl font-semibold mb-4">Select & Run AutoML</h2>

      <select
        value={selectedTool}
        onChange={(e) => setSelectedTool(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
      >
        <option value="h2o">H2O AutoML</option>
        <option value="autogluon">AutoGluon AutoML</option>
        <option value="tpot">TPOT AutoML</option>
        <option value="flaml">FLAML AutoML</option>
      </select>

      <select
        value={selectedFile}
        onChange={(e) => setSelectedFile(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      >
        <option value="">-- Select Dataset --</option>
        {files.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <button
        onClick={runAutoML}
        disabled={loading}
        className="px-5 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Running..." : "Run AutoML"}
      </button>

      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2">Live Logs</h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          <div
            ref={logRef}
            className="lg:col-span-3 font-mono text-sm rounded-md border
                       bg-gray-100 dark:bg-black
                       text-green-600 dark:text-green-400
                       h-72 overflow-y-auto px-3 py-2"
          >
            {logMessages.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>

          <div className="font-mono text-sm rounded-md border
                          bg-gray-100 dark:bg-black
                          text-green-600 dark:text-green-400
                          h-72 px-3 py-2">
            {systemStats ? (
              <>
                <div>CPU : {systemStats.cpu_usage_percent}%</div>
                <div>RAM : {systemStats.ram_used_gb} GB</div>
                <div>Usage : {systemStats.ram_percent}%</div>
                <div>Up : {systemStats.uptime_sec}s</div>
                <hr className="my-2" />
                <div>OS : {systemInfo?.os}</div>
                <div>Python : {systemInfo?.python_version}</div>
                <div>Cores : {systemInfo?.cpu_cores}</div>
                <div>RAM : {systemInfo?.ram_total_gb} GB</div>
              </>
            ) : (
              <div>Waiting for system info...</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
