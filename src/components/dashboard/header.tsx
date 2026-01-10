"use client";

import { Button } from "@/components/ui/button";
import { CreditBalance } from "@/components/credits/credit-balance";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile nav when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Close mobile nav on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileNavOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
    { href: "/generate", label: "Generate" },
  ];

  const isActiveLink = (href: string) => pathname === href;

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`font-bold uppercase text-sm ${
                    isActiveLink(link.href) ? "bg-accent" : ""
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Credits Display - Desktop */}
            <Link href="/billing" className="hidden sm:flex items-center border-4 border-foreground px-3 py-1 hover:bg-accent transition-colors">
              <CreditBalance />
            </Link>

            {/* User Menu - Desktop only */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 border-4 border-foreground px-3 py-2 hover:bg-accent transition-colors"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-sm">
                    {session?.user?.name?.[0] ||
                      session?.user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
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

              {/* Desktop Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
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
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 font-bold uppercase text-sm hover:bg-accent"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 font-bold uppercase text-sm hover:bg-accent"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/billing"
                        onClick={() => setIsUserMenuOpen(false)}
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
              className="md:hidden border-4 border-foreground p-2 hover:bg-accent transition-colors"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            >
              {isMobileNavOpen ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
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
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
          />

          {/* Drawer */}
          <nav className="fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-card border-l-4 border-foreground z-50 md:hidden overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b-4 border-foreground">
              <span className="font-black text-lg uppercase">Menu</span>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="border-4 border-foreground p-2 hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b-4 border-foreground bg-accent/30">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary flex items-center justify-center border-4 border-foreground">
                  <span className="text-primary-foreground font-black text-lg">
                    {session?.user?.name?.[0] ||
                      session?.user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{session?.user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Credits - Mobile */}
            <Link
              href="/billing"
              className="flex items-center justify-between p-4 border-b-4 border-foreground hover:bg-accent transition-colors"
            >
              <span className="font-bold uppercase text-sm">Credits</span>
              <CreditBalance />
            </Link>

            {/* Main Navigation */}
            <div className="p-2">
              <p className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Navigation
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block w-full px-4 py-3 font-bold uppercase text-sm hover:bg-accent transition-colors ${
                    isActiveLink(link.href) ? "bg-accent border-l-4 border-primary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Account Links */}
            <div className="p-2 border-t-4 border-foreground">
              <p className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Account
              </p>
              <Link
                href="/profile"
                className={`block w-full px-4 py-3 font-bold uppercase text-sm hover:bg-accent transition-colors ${
                  pathname === "/profile" ? "bg-accent border-l-4 border-primary" : ""
                }`}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className={`block w-full px-4 py-3 font-bold uppercase text-sm hover:bg-accent transition-colors ${
                  pathname === "/settings" ? "bg-accent border-l-4 border-primary" : ""
                }`}
              >
                Settings
              </Link>
              <Link
                href="/billing"
                className={`block w-full px-4 py-3 font-bold uppercase text-sm hover:bg-accent transition-colors ${
                  pathname === "/billing" ? "bg-accent border-l-4 border-primary" : ""
                }`}
              >
                Billing
              </Link>
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t-4 border-foreground mt-auto">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full border-4 border-destructive text-destructive px-4 py-3 font-bold uppercase text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                Sign Out
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
