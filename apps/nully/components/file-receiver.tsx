"use client";

import type { FileMetadata } from "../lib/interfaces";

interface FileReceiverProps {
  availableFiles: FileMetadata[];
  requestFile: (fileId: string) => void;
}

export function FileReceiver({ availableFiles, requestFile }: FileReceiverProps) {
  const handleDownload = (fileId: string) => {
    requestFile(fileId);
  };

  if (availableFiles.length === 0) {
    return (
      <div className="p-4 border rounded-lg text-center">
        <p className="text-gray-500">Waiting for files...</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Available Files</h2>
      <ul className="space-y-2">
        {availableFiles.map((file: FileMetadata) => (
          <li
            key={file.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span className="text-sm">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>
            <button
              onClick={() => handleDownload(file.id)}
              className="bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded"
            >
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}