"use client";

import { useRef } from "react";

interface FileSenderProps {
  stageFile: (file: File) => void;
  stagedFiles: File[];
}

export function FileSender({ stageFile, stagedFiles }: FileSenderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        stageFile(file);
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Send Files</h2>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleFileSelect}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Select Files
      </button>

      {stagedFiles.length > 0 && (
        <div>
          <h3 className="font-semibold text-md">Staged Files:</h3>
          <ul className="list-disc list-inside">
            {stagedFiles.map((file: File, index: number) => (
              <li key={index} className="text-sm">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}