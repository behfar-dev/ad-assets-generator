"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Welcome Back
          {session?.user?.name && `, ${session.user.name.split(" ")[0]}`}
        </h1>
        <p className="text-muted-foreground">
          Manage your projects and generate new ad assets
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credits Card */}
        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Available Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary">10</div>
            <Link href="/billing" className="text-sm text-muted-foreground hover:underline">
              Buy more credits
            </Link>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">0</div>
            <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
              View all projects
            </Link>
          </CardContent>
        </Card>

        {/* Assets Card */}
        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Assets Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">0</div>
            <span className="text-sm text-muted-foreground">This month</span>
          </CardContent>
        </Card>

        {/* Credits Used Card */}
        <Card className="border-4 border-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">0</div>
            <span className="text-sm text-muted-foreground">This month</span>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/generate">
            <Card className="border-4 border-foreground hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-16 h-16 border-4 border-foreground flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="font-black uppercase text-lg">Generate Assets</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects/new">
            <Card className="border-4 border-foreground hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-16 h-16 border-4 border-foreground flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <span className="font-black uppercase text-lg">New Project</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/billing">
            <Card className="border-4 border-foreground hover:bg-accent transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-16 h-16 border-4 border-foreground flex items-center justify-center">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <span className="font-black uppercase text-lg">Buy Credits</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="outline" className="border-4 border-foreground font-bold">
              View All
            </Button>
          </Link>
        </div>
        <Card className="border-4 border-foreground">
          <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-20 h-20 border-4 border-dashed border-muted-foreground flex items-center justify-center">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground font-medium">No projects yet</p>
            <Link href="/projects/new">
              <Button className="border-4 border-foreground font-bold">
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
