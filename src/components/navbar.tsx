"use client";

import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="LivePoll logo"
            width={32}
            height={32}
            className="dark:hidden"
            priority
          />
          <Image
            src="/logo-dark.png"
            alt="LivePoll logo"
            width={32}
            height={32}
            className="hidden dark:block"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">LivePoll</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
