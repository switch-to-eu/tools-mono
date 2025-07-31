"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

interface BrandIndicatorProps {
  locale?: string;
  className?: string;
  variant?: "default" | "compact";
  showIcon?: boolean;
}

export function BrandIndicator({
  locale = "en",
  className,
  variant = "default",
  showIcon = false,
}: BrandIndicatorProps) {
  const href = `https://switch-to.eu/${locale}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-xs opacity-60 transition-opacity hover:opacity-100",
        variant === "compact" && "gap-0.5 text-[10px]",
        className
      )}
    >
      <span className="font-light">by</span>
      <span className="font-medium">Switch-to.eu</span>
      {showIcon && <ExternalLink className="h-2.5 w-2.5" />}
    </a>
  );
}