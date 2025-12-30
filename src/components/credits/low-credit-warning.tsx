"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LowCreditWarningProps {
  threshold?: number;
  className?: string;
}

export function LowCreditWarning({
  threshold = 5,
  className = "",
}: LowCreditWarningProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance ?? 0);
        }
      } catch {
        console.error("Failed to fetch credit balance");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // Don't show if loading, dismissed, or balance is above threshold
  if (isLoading || isDismissed || balance === null || balance >= threshold) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 max-w-sm z-50
        border-4 border-foreground bg-background shadow-brutal
        p-4 animate-in slide-in-from-bottom-4
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 flex-shrink-0 bg-warning border-4 border-foreground flex items-center justify-center">
          <svg
            className="w-5 h-5 text-warning-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black uppercase text-sm">Low Credits</h4>
          <p className="text-sm text-muted-foreground mt-1">
            You have only{" "}
            <span className="font-bold text-foreground">
              {balance.toFixed(1)}
            </span>{" "}
            credits left. Buy more to continue generating assets.
          </p>
          <div className="flex gap-2 mt-3">
            <Link href="/billing">
              <Button size="sm">Buy Credits</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="w-6 h-6 flex items-center justify-center hover:bg-accent transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
