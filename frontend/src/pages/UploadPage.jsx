import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MockData from "../utils/MockData";
import Icon from "../components/Icons";

const API_BASE_URL = "http://127.0.0.1:8000";

function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
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

      setPreviewRows(parsed);
    };

    reader.readAsText(csvFile);
  };

  const uploadToServer = async () => {
    if (!file) {
      setMessage("⚠️ Please choose a CSV file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.filename) {
        // Save Draft Logic
        MockData.setDraftProject(res.data.filename);

        // Redirect to Run Experiment Wizard
        setTimeout(() => {
          navigate('/run-experiment');
        }, 1000); // Small delay for UX
        setMessage("✅ Upload successful! Redirecting...");
      } else {
        setMessage("⚠️ File uploaded, but server response was unexpected.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to upload file. Is backend running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Upload Dataset</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Step 1: Upload a CSV dataset to initialize your project.
        </p>
      </div>

      {/* Upload Box */}
      <div
        className={`
          w-full h-64 border-2 border-dashed rounded-2xl
          flex flex-col justify-center items-center cursor-pointer
          bg-gray-50 dark:bg-darkpanel dark:border-gray-700
          hover:bg-gray-100 dark:hover:bg-gray-800 transition-all
          ${file ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10' : ''}
        `}
        onClick={handleBoxClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${file ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
          <Icon name={file ? "folder" : "plus"} size={32} />
        </div>

        {file ? (
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-1">
              Click to browse or drag file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supported format: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">.csv</span>
            </p>
          </div>
        )}

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Action Area */}
      {message && <p className={`text-sm font-medium ${message.includes('❌') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

      <div className="flex justify-end">
        <button
          onClick={uploadToServer}
          disabled={!file || uploading}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all
            ${!file || uploading
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/25 transform hover:-translate-y-0.5'
            }
          `}
        >
          {uploading ? (
            <>Running Checks...</>
          ) : (
            <>
              <span>Continue</span>
              <Icon name="chevronRight" size={20} />
            </>
          )}
        </button>
      </div>

      {/* Dataset Preview */}
      {previewRows.length > 0 && (
        <div className="mt-12 animate-slide-up">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Dataset Preview</h2>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-800">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {previewRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={
                      rowIndex === 0
                        ? "bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white"
                        : "bg-white dark:bg-darkpanel text-gray-600 dark:text-gray-300"
                    }
                  >
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-3 whitespace-nowrap"
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

