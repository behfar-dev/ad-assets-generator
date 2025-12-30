"use client";

import { Button } from "@/components/ui/button";
import { CreditBalance } from "@/components/credits/credit-balance";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function DashboardHeader() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b-4 border-foreground bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 border-4 border-foreground bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">A</span>
            </div>
            <span className="font-black text-xl uppercase tracking-tight hidden sm:block">
              Ad Assets
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="font-bold uppercase text-sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="ghost" className="font-bold uppercase text-sm">
                Projects
              </Button>
            </Link>
            <Link href="/generate">
              <Button variant="ghost" className="font-bold uppercase text-sm">
                Generate
              </Button>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <Link href="/billing" className="hidden sm:flex items-center border-4 border-foreground px-3 py-1 hover:bg-accent transition-colors">
              <CreditBalance />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 border-4 border-foreground px-3 py-2 hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">
                    {session?.user?.name?.[0] ||
                      session?.user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 border-4 border-foreground bg-card z-20">
                    <div className="p-4 border-b-4 border-foreground">
                      <p className="font-bold truncate">{session?.user?.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 font-bold uppercase text-sm hover:bg-accent"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 font-bold uppercase text-sm hover:bg-accent"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/billing"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 font-bold uppercase text-sm hover:bg-accent"
                      >
                        Billing
                      </Link>
                    </div>
                    <div className="p-2 border-t-4 border-foreground">
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full text-left px-4 py-2 font-bold uppercase text-sm text-destructive hover:bg-destructive/10"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden border-4 border-foreground p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
