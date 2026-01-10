"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    setIsLoading("password");

    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    const confirmation = prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (confirmation !== "DELETE") {
      return;
    }

    setIsLoading("delete");

    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      // Sign out and redirect
      signOut({ callbackUrl: "/" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message */}
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

      {/* Password Change */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Your current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            <Button type="submit" disabled={isLoading === "password"}>
              {isLoading === "password" ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Store your own API keys for AI services. Keys are encrypted and
            stored securely.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              fal.ai API Key
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your fal.ai API key"
                disabled
              />
              <Button variant="outline" disabled>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your OpenAI API key"
                disabled
              />
              <Button variant="outline" disabled>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-4 border-foreground/20 p-4">
            <div>
              <p className="font-bold">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates about your account
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between border-4 border-foreground/20 p-4">
            <div>
              <p className="font-bold">Low Credit Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when credits are running low
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className="flex items-center justify-between border-4 border-foreground/20 p-4">
            <div>
              <p className="font-bold">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">
                Tips, updates, and special offers
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Tour */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle>Product Tour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-4 border-foreground/20 p-4">
            <div>
              <p className="font-bold">Restart Product Tour</p>
              <p className="text-sm text-muted-foreground">
                View the onboarding guide again to learn about features
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsLoading("tour");
                try {
                  await fetch("/api/user/onboarding", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ completed: false }),
                  });
                  router.push("/dashboard");
                  router.refresh();
                } catch (error) {
                  setMessage({
                    type: "error",
                    text: "Failed to restart tour",
                  });
                } finally {
                  setIsLoading(null);
                }
              }}
              disabled={isLoading === "tour"}
            >
              {isLoading === "tour" ? "Restarting..." : "Restart Tour"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download all your data including projects, assets, and account
            information.
          </p>
          <Button variant="outline" disabled>
            Export My Data (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-4 border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-4 border-foreground/20 p-4 space-y-4">
            <div>
              <p className="font-bold">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading === "delete"}
            >
              {isLoading === "delete" ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
