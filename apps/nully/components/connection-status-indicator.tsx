import type { ConnectionStatus } from "../hooks/use-peer-connection";

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  error?: string | null;
  role?: "sender" | "receiver";
}

export function ConnectionStatusIndicator({
  status,
  error,
  role = "sender"
}: ConnectionStatusIndicatorProps) {
  if (status === "connecting") {
    const message = role === "sender"
      ? "Initializing connection..."
      : "Connecting to sender...";

    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${role === "sender" ? "border-blue-500" : "border-green-500"
          }`}></div>
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-red-500 text-center">
        <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
        {error && <p>{error}</p>}
      </div>
    );
  }

  if (status === "connected") {
    const message = role === "sender"
      ? "Receiver has joined and is ready to receive files"
      : "Successfully connected to sender";

    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">Connected</span>
        </div>
        <p className="text-sm text-green-600">{message}</p>
      </div>
    );
  }

  // Disconnected state - waiting
  if (role === "sender") {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        Waiting for receiver to join...
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      Preparing to join...
    </div>
  );
}