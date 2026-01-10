"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";

interface Asset {
  id: string;
  type: "IMAGE" | "VIDEO" | "COPY";
  aspectRatio: string | null;
  url: string;
  thumbnailUrl: string | null;
  prompt: string | null;
  createdAt: string;
}

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (assetId: string) => Promise<void>;
  onRegenerate?: (asset: Asset) => void;
  projectName?: string;
}

export function AssetDetailModal({
  asset,
  open,
  onOpenChange,
  onDelete,
  onRegenerate,
  projectName,
}: AssetDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset delete confirmation when modal closes or asset changes
  useEffect(() => {
    if (!open) {
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onOpenChange(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, showDeleteConfirm, onOpenChange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getFileExtension = (type: Asset["type"]) => {
    switch (type) {
      case "IMAGE":
        return "png";
      case "VIDEO":
        return "mp4";
      case "COPY":
        return "txt";
    }
  };

  const generateFileName = useCallback(() => {
    if (!asset) return "asset";

    const prefix = projectName?.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "asset";
    const date = new Date(asset.createdAt)
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "");
    const type = asset.type.toLowerCase();
    const ratio = asset.aspectRatio?.replace(":", "x") || "custom";
    const ext = getFileExtension(asset.type);

    return `${prefix}-${type}-${ratio}-${date}.${ext}`;
  }, [asset, projectName]);

  const handleDownload = async () => {
    if (!asset) return;

    try {
      if (asset.type === "COPY") {
        // For copy, create a text file download
        const blob = new Blob([asset.prompt || ""], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = generateFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For images/videos, fetch and download with proper filename
        const response = await fetch(asset.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = generateFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to direct link download
      const a = document.createElement("a");
      a.href = asset.url;
      a.download = generateFileName();
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDelete = async () => {
    if (!asset || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(asset.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Delete error:", error);
      setIsDeleting(false);
    }
  };

  const handleRegenerate = () => {
    if (!asset || !onRegenerate) return;
    onRegenerate(asset);
    onOpenChange(false);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-foreground w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-foreground text-background px-2 py-1 text-xs font-bold uppercase">
              {asset.type}
            </span>
            Asset Details
          </DialogTitle>
          <DialogDescription>
            {asset.aspectRatio && `${asset.aspectRatio} · `}
            Created {formatDate(asset.createdAt)}
          </DialogDescription>
        </DialogHeader>

        {/* Preview Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-4">
            {/* Large Preview */}
            <div className="relative border-4 border-foreground bg-muted">
              {asset.type === "IMAGE" && (
                <img
                  src={asset.url}
                  alt={asset.prompt || "Generated asset"}
                  className="w-full max-h-[50vh] object-contain mx-auto"
                />
              )}
              {asset.type === "VIDEO" && (
                <video
                  src={asset.url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full max-h-[50vh] object-contain mx-auto"
                />
              )}
              {asset.type === "COPY" && (
                <div className="p-6 min-h-[200px] max-h-[50vh] overflow-y-auto">
                  <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {asset.prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              {/* Prompt */}
              {asset.prompt && asset.type !== "COPY" && (
                <div className="border-4 border-foreground/20 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">
                    Prompt
                  </h4>
                  <p className="text-sm text-foreground line-clamp-4">
                    {asset.prompt}
                  </p>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="border-4 border-foreground/20 p-3">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">
                    Type
                  </h4>
                  <p className="text-sm font-bold mt-1">{asset.type}</p>
                </div>
                {asset.aspectRatio && (
                  <div className="border-4 border-foreground/20 p-3">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground">
                      Aspect Ratio
                    </h4>
                    <p className="text-sm font-bold mt-1">{asset.aspectRatio}</p>
                  </div>
                )}
                <div className="border-4 border-foreground/20 p-3">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground">
                    Created
                  </h4>
                  <p className="text-sm font-bold mt-1">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="flex-shrink-0 border-4 border-destructive bg-destructive/10 p-4 space-y-3">
            <p className="font-bold text-destructive">
              Are you sure you want to delete this asset?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="font-bold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        {!showDeleteConfirm && (
          <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2">
            <div className="flex flex-1 gap-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="font-bold flex-1 sm:flex-none"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </Button>

              {onRegenerate && asset.type !== "COPY" && (
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  className="font-bold flex-1 sm:flex-none"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Regenerate Variant
                </Button>
              )}
            </div>

            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="font-bold"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
