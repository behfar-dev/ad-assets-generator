"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Invalid Link
          </h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="border-4 border-foreground bg-card p-6">
          <Link href="/forgot-password">
            <Button className="w-full h-14 text-lg font-black uppercase tracking-wider border-4 border-foreground">
              Request New Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset failed");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Password Reset
          </h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset.
          </p>
        </div>

        <div className="border-4 border-foreground bg-card p-6 space-y-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-green-500 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <Button
            onClick={() => router.push("/login")}
            className="w-full h-14 text-lg font-black uppercase tracking-wider border-4 border-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Reset Password
        </h1>
        <p className="text-muted-foreground">Enter your new password below</p>
      </div>

      {/* Form Container */}
      <div className="border-4 border-foreground bg-card p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="border-4 border-destructive bg-destructive/10 p-4">
            <p className="text-sm font-bold text-destructive">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              New Password
            </label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="border-4 border-foreground h-12 text-base font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="border-4 border-foreground h-12 text-base font-medium"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-lg font-black uppercase tracking-wider border-4 border-foreground"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-bold underline underline-offset-4 hover:text-foreground"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
