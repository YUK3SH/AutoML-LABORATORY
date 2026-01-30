import React from "react";

function DataPreview({ filename }) {
  if (!filename) {
    return (
      <p className="text-xs text-gray-500">
        Upload a dataset to see preview information here in future versions.
      </p>
    );
  }

  return (
    <div className="mt-4 text-xs text-gray-600">
      <p>
        <span className="font-semibold">Active Dataset:</span>{" "}
        <span className="font-mono">{filename}</span>
      </p>
      <p className="mt-1">
        In the extended version, this section can show first few rows, basic
        statistics, etc.
      </p>
    </div>
  );
}

export default DataPreview;
