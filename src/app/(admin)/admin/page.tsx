"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalCredits: number;
  totalRevenue: number;
  assetsGenerated: number;
  projectsCreated: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCredits: 0,
    totalRevenue: 0,
    assetsGenerated: 0,
    projectsCreated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    // Fetch stats
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="font-bold uppercase">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats.totalUsers}</div>
            <p className="text-sm text-muted-foreground">
              {stats.activeUsers} active this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Credits Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats.totalCredits}</div>
            <p className="text-sm text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Assets Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats.assetsGenerated}</div>
            <p className="text-sm text-muted-foreground">Total generations</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Projects Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats.projectsCreated}</div>
            <p className="text-sm text-muted-foreground">Total projects</p>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border-2 border-foreground" />
              <span className="text-xl font-black text-green-500">
                Operational
              </span>
            </div>
            <p className="text-sm text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-4 border-foreground">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users"
              className="flex items-center justify-between p-4 border-4 border-foreground/20 hover:bg-accent transition-colors"
            >
              <span className="font-bold">Manage Users</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
            <a
              href="/admin/credits"
              className="flex items-center justify-between p-4 border-4 border-foreground/20 hover:bg-accent transition-colors"
            >
              <span className="font-bold">Credit Management</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">
                Activity log coming soon...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
