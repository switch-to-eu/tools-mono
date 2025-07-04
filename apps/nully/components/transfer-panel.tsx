"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

interface TransferPanelProps {
  onFileSelect: (file: File | null) => void;
  onSend: () => void;
  isConnected: boolean;
}

export function TransferPanel({
  onFileSelect,
  onSend,
  isConnected,
}: TransferPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="file"
            disabled={!isConnected}
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          />
          <Button disabled={!isConnected} onClick={onSend}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}