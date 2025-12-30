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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  creditBalance: number;
  projectCount: number;
  assetCount: number;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    fetchUsers();
  }, [session, status, router, page, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleGrantCredits = async () => {
    if (!selectedUser || !creditAmount) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditAdjustment: parseFloat(creditAmount),
          creditReason,
        }),
      });

      if (res.ok) {
        setSelectedUser(null);
        setCreditAmount("");
        setCreditReason("");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update credits:", error);
    }
    setIsUpdating(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent animate-spin mx-auto" />
          <p className="font-bold uppercase">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">
            User Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all users
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-4 border-foreground">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-4 border-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-bold">{user.name || "No name"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "error" : "default"}
                    size="xs"
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-bold">{user.creditBalance.toFixed(1)}</span>
                </TableCell>
                <TableCell>{user.projectCount}</TableCell>
                <TableCell>{user.assetCount}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      Credits
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === "ADMIN"}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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

      {/* Credit Adjustment Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Credits</DialogTitle>
            <DialogDescription>
              Adjust credits for {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">
                Current Balance
              </label>
              <p className="text-2xl font-black">
                {selectedUser?.creditBalance.toFixed(1)} credits
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">
                Amount (positive to add, negative to deduct)
              </label>
              <Input
                type="number"
                placeholder="e.g., 50 or -10"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase">
                Reason (optional)
              </label>
              <Input
                placeholder="e.g., Promotional bonus"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGrantCredits}
              disabled={!creditAmount || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
