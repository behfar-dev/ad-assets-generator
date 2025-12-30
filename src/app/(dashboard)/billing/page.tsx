"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditBalance } from "@/components/credits/credit-balance";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  description?: string;
  popular?: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const creditsAdded = searchParams.get("credits");

  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Show success/canceled message
    if (success) {
      setMessage({
        type: "success",
        text: `Successfully added ${creditsAdded || ""} credits to your account!`,
      });
    } else if (canceled) {
      setMessage({
        type: "error",
        text: "Purchase was canceled. No charges were made.",
      });
    }

    // Fetch packages
    fetch("/api/credits/packages")
      .then((res) => res.json())
      .then((data) => setPackages(data.packages || []))
      .catch(console.error);

    // Fetch transaction history
    fetch("/api/credits/history?limit=10")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(console.error);
  }, [success, canceled, creditsAdded]);

  const handlePurchase = async (packageId: string) => {
    setIsLoading(packageId);
    setMessage(null);

    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Purchase failed");
      }

      // If URL is returned, redirect to Stripe
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        // Development mode - credits added directly
        setMessage({
          type: "success",
          text: `${data.credits} credits added to your account!`,
        });
        // Refresh the page to update balance
        window.location.reload();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Purchase failed",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "BONUS":
      case "ADMIN_GRANT":
        return "text-green-500";
      case "USAGE":
      case "ADMIN_DEDUCT":
        return "text-red-500";
      case "REFUND":
        return "text-blue-500";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Billing & Credits
        </h1>
        <p className="text-muted-foreground">
          Purchase credits and view your transaction history
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`border-4 p-4 ${
            message.type === "success"
              ? "border-green-500 bg-green-500/10"
              : "border-destructive bg-destructive/10"
          }`}
        >
          <p
            className={`font-bold ${
              message.type === "success" ? "text-green-500" : "text-destructive"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Current Balance */}
      <Card className="border-4 border-foreground">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground">
              Current Balance
            </p>
            <div className="text-5xl font-black text-primary mt-2">
              <CreditBalance showLabel={false} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Credits never expire
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">Buy Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`border-4 border-foreground relative ${
                pkg.popular ? "ring-4 ring-primary" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 font-black uppercase text-sm">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                {pkg.description && (
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-black">{pkg.credits}</div>
                  <p className="text-muted-foreground">credits</p>
                </div>
                <div className="border-t-4 border-foreground/20 pt-4">
                  <div className="text-3xl font-black">${pkg.price}</div>
                  <p className="text-sm text-muted-foreground">
                    ${(pkg.price / pkg.credits).toFixed(3)} per credit
                  </p>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isLoading !== null}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {isLoading === pkg.id ? "Processing..." : "Buy Now"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">Transaction History</h2>
        <Card className="border-4 border-foreground">
          {transactions.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center p-12">
              <p className="text-muted-foreground font-medium">
                No transactions yet
              </p>
            </CardContent>
          ) : (
            <div className="divide-y-4 divide-foreground/10">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-bold">{tx.description || tx.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`text-xl font-black ${getTransactionColor(tx.type)}`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
