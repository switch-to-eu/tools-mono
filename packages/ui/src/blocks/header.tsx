"use client";

import { ReactNode } from "react";

export interface HeaderProps {
  /** Icon or logo element to display */
  logo?: ReactNode;
  /** Navigation content for desktop */
  navigation?: ReactNode;
  /** Navigation content for mobile (optional, defaults to navigation prop) */
  mobileNavigation?: ReactNode;
  /** Custom class name for the header container */
  className?: string;
  /** Custom class name for the brand/logo area */
  brandClassName?: string;
}

export function Header({
  logo,
  navigation,
  mobileNavigation,
  className = "",
}: HeaderProps) {
  const navContent = mobileNavigation || navigation;

  return (
    <header className={`max-w bg-background/95 2xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 backdrop-blur ${className}`}>
      <div className="container mx-auto flex items-center justify-between py-3 sm:py-4">
        {logo}

        {/* Desktop Navigation */}
        {navigation && (
          <div className="hidden items-center gap-2 md:flex">
            {navigation}
          </div>
        )}

        {/* Mobile Navigation */}
        {navContent && (
          <div className="flex items-center gap-2 md:hidden">
            {navContent}
          </div>
        )}
      </div>
    </header>
  );
}
