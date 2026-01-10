"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function LandingNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close menu when clicking anchor links
  const handleAnchorClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b-4 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary" />
            <span className="text-xl font-black tracking-tight">AD ASSETS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#how-it-works" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              How It Works
            </a>
            <Link href="/login" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-primary text-primary-foreground font-bold uppercase tracking-wide border-4 border-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-2 font-bold text-sm uppercase tracking-wide border-2 border-foreground hover:bg-accent transition-colors"
            >
              Login
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 border-2 border-foreground hover:bg-accent transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute top-full left-0 right-0 bg-background border-b-4 border-foreground z-50 md:hidden">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              <a
                href="#features"
                onClick={handleAnchorClick}
                className="block w-full px-4 py-3 font-bold uppercase text-sm tracking-wide hover:bg-accent transition-colors border-2 border-transparent hover:border-foreground"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={handleAnchorClick}
                className="block w-full px-4 py-3 font-bold uppercase text-sm tracking-wide hover:bg-accent transition-colors border-2 border-transparent hover:border-foreground"
              >
                Pricing
              </a>
              <a
                href="#how-it-works"
                onClick={handleAnchorClick}
                className="block w-full px-4 py-3 font-bold uppercase text-sm tracking-wide hover:bg-accent transition-colors border-2 border-transparent hover:border-foreground"
              >
                How It Works
              </a>
              <Link
                href="/pricing"
                className="block w-full px-4 py-3 font-bold uppercase text-sm tracking-wide hover:bg-accent transition-colors border-2 border-transparent hover:border-foreground"
              >
                Full Pricing
              </Link>
              <div className="pt-2">
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 bg-primary text-primary-foreground font-bold uppercase text-sm tracking-wide text-center border-4 border-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
