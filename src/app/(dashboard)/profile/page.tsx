"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setIsSaved(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      // Update session
      await update({
        name: formData.name,
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      {/* Profile Info Card */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border-4 border-destructive bg-destructive/10 p-4">
              <p className="text-sm font-bold text-destructive">{error}</p>
            </div>
          )}

          {isSaved && (
            <div className="mb-4 border-4 border-green-500 bg-green-500/10 p-4">
              <p className="text-sm font-bold text-green-500">
                Profile updated successfully!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 border-4 border-foreground bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-3xl">
                  {session?.user?.name?.[0] ||
                    session?.user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </span>
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-4 border-foreground font-bold"
                  disabled
                >
                  Change Avatar
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Email
              </label>
              <Input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="border-4 border-foreground/50 h-12 text-base font-medium bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Name
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border-4 border-foreground h-12 text-base font-medium"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Bio
              </label>
              <textarea
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="w-full border-4 border-foreground p-3 text-base font-medium bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Company
              </label>
              <Input
                type="text"
                placeholder="Your company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="border-4 border-foreground h-12 text-base font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 font-black uppercase tracking-wider border-4 border-foreground"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase">
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-4 border-foreground p-4">
              <p className="text-sm font-bold uppercase text-muted-foreground">
                Member Since
              </p>
              <p className="text-xl font-black">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="border-4 border-foreground p-4">
              <p className="text-sm font-bold uppercase text-muted-foreground">
                Total Assets
              </p>
              <p className="text-xl font-black">0</p>
            </div>
            <div className="border-4 border-foreground p-4">
              <p className="text-sm font-bold uppercase text-muted-foreground">
                Credits Used
              </p>
              <p className="text-xl font-black">0</p>
            </div>
            <div className="border-4 border-foreground p-4">
              <p className="text-sm font-bold uppercase text-muted-foreground">
                Projects Created
              </p>
              <p className="text-xl font-black">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
