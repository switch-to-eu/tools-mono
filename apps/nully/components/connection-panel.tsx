"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { P2PState } from "@/lib/interfaces";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { X } from "lucide-react";

interface ConnectionPanelProps {
  state: P2PState;
  remotePeerId: string;
  onRemotePeerIdChange: (id: string) => void;
  onConnect: () => void;
  onClearError: () => void;
}

export function ConnectionPanel({
  state,
  remotePeerId,
  onRemotePeerIdChange,
  onConnect,
  onClearError,
}: ConnectionPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && (
          <Alert variant="destructive">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onClearError}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}
        <div>
          <label className="text-sm font-medium">Your Peer ID</label>
          <Input readOnly value={state.peerId || "Loading..."} />
        </div>
        <div>
          <label className="text-sm font-medium">Remote Peer ID</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter remote peer ID"
              value={remotePeerId}
              onChange={(e) => onRemotePeerIdChange(e.target.value)}
              disabled={!state.peerId || state.isConnected}
            />
            <Button
              disabled={!state.peerId || state.isConnected || !remotePeerId}
              onClick={onConnect}
            >
              Connect
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}