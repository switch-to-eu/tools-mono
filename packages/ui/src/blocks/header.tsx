"use client";

import Link from "next/link";
import { Calendar, Plus } from "lucide-react";
import { Button } from "../components/button";

export function Header() {
  return (
    <header className="max-w bg-background/95 2xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50  backdrop-blur">
      <div className="container mx-auto flex items-center justify-between py-3 sm:py-4">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 text-lg font-black transition-opacity hover:opacity-80 sm:text-xl"
        >
          <div className="relative flex h-6 w-6 items-center justify-center rounded-sm bg-purple-600">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <span className="text-purple-600 font-black tracking-wide uppercase">
            Plotty
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/create">
            <Button variant="default" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Poll
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/create">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
