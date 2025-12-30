"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// Brutalist geometric spinner - rotating square
export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-6",
  };

  return (
    <motion.div
      className={cn(
        sizes[size],
        "border-foreground border-t-transparent",
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Brutalist blocks loading animation
export function BlocksLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-4 h-4 bg-foreground"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Brutalist progress bar
interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-bold uppercase">Progress</span>
          <span className="text-sm font-black">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="h-6 border-4 border-foreground bg-background">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-foreground"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-primary"
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <p className="text-lg font-black uppercase tracking-wider">{message}</p>
      </motion.div>
    </div>
  );
}

// Skeleton loading placeholder
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn("bg-muted border-4 border-foreground/10", className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Skeleton card for loading states
export function SkeletonCard() {
  return (
    <div className="border-4 border-foreground p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
