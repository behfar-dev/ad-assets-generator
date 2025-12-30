"use client";

import { useEffect, useState } from "react";

interface CreditBalanceProps {
  className?: string;
  showLabel?: boolean;
}

export function CreditBalance({
  className = "",
  showLabel = true,
}: CreditBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch("/api/credits");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch credit balance:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        {showLabel && (
          <span className="text-sm font-bold uppercase">Credits:</span>
        )}
        <span className="ml-2 font-black text-primary animate-pulse">--</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && (
        <span className="text-sm font-bold uppercase">Credits:</span>
      )}
      <span className="ml-2 font-black text-primary">
        {balance?.toFixed(1) ?? "0"}
      </span>
    </div>
  );
}
