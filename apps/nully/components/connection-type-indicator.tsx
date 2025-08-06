"use client";

import { useTranslations } from "next-intl";
import { Zap, Globe, Shield, HelpCircle } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import type { ConnectionType } from "../hooks/use-peer-connection";

interface ConnectionTypeIndicatorProps {
  connectionType: ConnectionType;
  className?: string;
}

export function ConnectionTypeIndicator({ 
  connectionType, 
  className 
}: ConnectionTypeIndicatorProps) {
  const t = useTranslations("Nully.Connection");

  const getConnectionInfo = (type: ConnectionType) => {
    switch (type) {
      case "direct-p2p":
        return {
          icon: <Zap className="h-3 w-3" />,
          label: t("types.directP2P"),
          description: t("types.directP2PDesc"),
          variant: "default" as const,
          color: "bg-green-500",
        };
      case "stun-server":
        return {
          icon: <Globe className="h-3 w-3" />,
          label: t("types.stunServer"),
          description: t("types.stunServerDesc"),
          variant: "secondary" as const,
          color: "bg-blue-500",
        };
      case "turn-relay":
        return {
          icon: <Shield className="h-3 w-3" />,
          label: t("types.turnRelay"),
          description: t("types.turnRelayDesc"),
          variant: "outline" as const,
          color: "bg-yellow-500",
        };
      case "unknown":
      default:
        return {
          icon: <HelpCircle className="h-3 w-3" />,
          label: t("types.unknown"),
          description: t("types.unknownDesc"),
          variant: "outline" as const,
          color: "bg-gray-400",
        };
    }
  };

  const connectionInfo = getConnectionInfo(connectionType);

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className={`w-2 h-2 rounded-full ${connectionInfo.color}`} />
      <Badge 
        variant={connectionInfo.variant}
        className="flex items-center gap-1 text-xs"
        title={connectionInfo.description}
      >
        {connectionInfo.icon}
        {connectionInfo.label}
      </Badge>
    </div>
  );
}