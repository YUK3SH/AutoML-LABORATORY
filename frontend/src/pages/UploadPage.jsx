import React, { useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState(
    localStorage.getItem("uploadedFilename") || ""
  );
  const [previewRows, setPreviewRows] = useState([]);
  const fileInputRef = useRef(null);

  const resetPreview = () => {
    setPreviewRows([]);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".csv")) {
      setMessage("⚠️ Only CSV files are supported right now.");
      setFile(null);
      resetPreview();
      return;
    }

    setFile(selectedFile);
    setMessage("");
    generatePreview(selectedFile);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const generatePreview = (csvFile) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
        .slice(0, 21); // header + 20 rows

      const parsed = lines.map((line) =>
        line.split(",").map((c) => c.trim())
      );

      setPreviewRows(parsed); // ✅ FIX (always set)
    };

    reader.readAsText(csvFile);
  };

  const uploadToServer = async () => {
    if (!file) {
      setMessage("⚠️ Please choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.filename) {
        localStorage.setItem("uploadedFilename", res.data.filename);
        setUploadedFilename(res.data.filename);
        setMessage("✅ File uploaded successfully. You can now run AutoML.");
      } else {
        setMessage("⚠️ File uploaded, but server response was unexpected.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to upload file. Is backend running?");
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold mb-4">Upload Dataset</h1>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Upload a CSV dataset. A preview of the first 20 rows will be shown.
        After upload, go to <b>Run Tool</b> to start training.
      </p>

      {/* Upload Box */}
      <div
        className="
          w-full h-48 border-2 border-dashed rounded-xl
          flex flex-col justify-center items-center cursor-pointer
          bg-gray-100 dark:bg-gray-800 dark:border-gray-600
          hover:bg-gray-200 dark:hover:bg-gray-700 transition
        "
        onClick={handleBoxClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <span className="text-5xl mb-2">📤</span>
        <p className="text-lg font-medium mb-1">
          Drop your CSV file here or click to browse
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Supported format: <span className="font-mono">.csv</span>
        </p>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Status */}
      {message && <p className="mt-4 text-sm">{message}</p>}

      {uploadedFilename && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last uploaded file:{" "}
          <span className="font-mono font-semibold">{uploadedFilename}</span>
        </p>
      )}

      {/* Upload button */}
      <div className="mt-6">
        <button
          onClick={uploadToServer}
          className="px-6 py-2 rounded-full bg-black text-white text-sm
                     hover:bg-gray-800 dark:bg-white dark:text-black
                     dark:hover:bg-gray-200 transition"
        >
          Upload to Server
        </button>
      </div>

      {/* Dataset Preview */}
      {previewRows.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Dataset Preview</h2>

          <div className="overflow-auto border rounded-lg dark:border-gray-700 max-h-96">
            <table className="min-w-full text-xs">
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={
                      rowIndex === 0
                        ? "bg-gray-200 dark:bg-gray-800 font-semibold"
                        : rowIndex % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    }
                  >
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-3 py-2 whitespace-nowrap border-b dark:border-gray-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPage;

