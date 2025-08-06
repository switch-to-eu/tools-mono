"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { FileTransfer } from "@/lib/interfaces";
import { ProgressGreen } from "./progress-green";
import { Button } from "@workspace/ui/components/button";

interface DownloadsPanelProps {
  files: FileTransfer[];
}

export function DownloadsPanel({ files }: DownloadsPanelProps) {
  const handleDownload = (fileTransfer: FileTransfer) => {
    if (fileTransfer.status !== "done") return;
    const url = URL.createObjectURL(fileTransfer.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileTransfer.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloads</CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-sm text-gray-500">No files received yet.</p>
        ) : (
          <ul className="space-y-4">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{file.file.name}</span>
                  {file.status !== "done" && (
                    <ProgressGreen value={file.progress} className="mt-1" />
                  )}
                </div>
                {file.status === "done" && (
                  <Button size="sm" onClick={() => handleDownload(file)}>
                    Download
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}