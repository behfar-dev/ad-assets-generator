"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/credits", label: "Credits" },
  ];

  return (
    <header className="border-b-4 border-destructive bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-10 h-10 border-4 border-destructive bg-destructive flex items-center justify-center">
                <span className="text-destructive-foreground font-black text-lg">A</span>
              </div>
              <span className="font-black text-xl uppercase tracking-tight">
                Admin
              </span>
            </Link>
            <Badge variant="error" size="sm">
              Admin Panel
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className="font-bold uppercase text-sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Exit Admin
              </Button>
            </Link>
            <div className="flex items-center space-x-2 border-4 border-foreground px-3 py-1">
              <div className="w-6 h-6 bg-destructive flex items-center justify-center">
                <span className="text-destructive-foreground font-black text-xs">
                  {session?.user?.name?.[0] || "A"}
                </span>
              </div>
              <span className="text-sm font-bold hidden sm:block">
                {session?.user?.name || "Admin"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
