"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-20 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <BrandLogo size="nav" />
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
