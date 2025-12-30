"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CreditTransaction {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface CreditStats {
  totalIssued: number;
  totalSpent: number;
  totalRefunded: number;
  averageBalance: number;
}

export default function AdminCreditsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStats>({
    totalIssued: 0,
    totalSpent: 0,
    totalRefunded: 0,
    averageBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchData();
  }, [session, status, router, page, search, typeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch transactions
      const transRes = await fetch(
        `/api/admin/credits/transactions?page=${page}&search=${encodeURIComponent(search)}&type=${typeFilter}`
      );
      const transData = await transRes.json();
      if (transData.transactions) {
        setTransactions(transData.transactions);
        setTotalPages(transData.pagination.totalPages);
      }

      // Fetch stats
      const statsRes = await fetch("/api/admin/credits/stats");
      const statsData = await statsRes.json();
      if (statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
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

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: "default" | "success" | "error" | "warning" | "outline"; label: string }> = {
      SIGNUP_BONUS: { variant: "success", label: "Signup Bonus" },
      PURCHASE: { variant: "success", label: "Purchase" },
      ADMIN_GRANT: { variant: "success", label: "Admin Grant" },
      IMAGE_GENERATION: { variant: "default", label: "Image Gen" },
      VIDEO_GENERATION: { variant: "default", label: "Video Gen" },
      AD_COPY_GENERATION: { variant: "default", label: "Ad Copy" },
      ADMIN_DEDUCT: { variant: "error", label: "Admin Deduct" },
      REFUND: { variant: "warning", label: "Refund" },
    };

    const config = variants[type] || { variant: "outline" as const, label: type };
    return <Badge variant={config.variant} size="xs">{config.label}</Badge>;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="font-bold uppercase">Loading Credits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Credit Management
        </h1>
        <p className="text-muted-foreground">
          View credit transactions and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-600">
              +{stats.totalIssued.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Credits added</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">
              -{stats.totalSpent.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Credits used</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Refunded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-yellow-600">
              {stats.totalRefunded.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Credits refunded</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Avg Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {stats.averageBalance.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-4 border-foreground">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border-4 border-foreground font-bold bg-background"
            >
              <option value="">All Types</option>
              <option value="SIGNUP_BONUS">Signup Bonus</option>
              <option value="PURCHASE">Purchase</option>
              <option value="ADMIN_GRANT">Admin Grant</option>
              <option value="ADMIN_DEDUCT">Admin Deduct</option>
              <option value="IMAGE_GENERATION">Image Gen</option>
              <option value="VIDEO_GENERATION">Video Gen</option>
              <option value="AD_COPY_GENERATION">Ad Copy</option>
              <option value="REFUND">Refund</option>
            </select>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-4 border-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold">
                        {transaction.userName || "No name"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.userEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell>
                    <span
                      className={`font-bold ${
                        transaction.amount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {transaction.amount.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {transaction.description || "-"}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="font-bold">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
