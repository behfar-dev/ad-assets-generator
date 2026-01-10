"use client";

import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { useState } from "react";

interface Asset {
  id: string;
  type: "IMAGE" | "VIDEO" | "COPY";
  aspectRatio: string | null;
  url: string;
  thumbnailUrl: string | null;
  prompt: string | null;
  createdAt: string;
}

interface BulkActionsToolbarProps {
  selectedAssets: Asset[];
  totalAssets: number;
  projectName: string;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: (assetIds: string[]) => Promise<void>;
  allSelected: boolean;
}

export function BulkActionsToolbar({
  selectedAssets,
  totalAssets,
  projectName,
  onSelectAll,
  onClearSelection,
  onDelete,
  allSelected,
}: BulkActionsToolbarProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const selectedCount = selectedAssets.length;

  // Generate a sanitized filename from project name
  const sanitizeFilename = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Get file extension based on asset type and URL
  const getFileExtension = (asset: Asset): string => {
    if (asset.type === "COPY") return "txt";

    // Try to extract extension from URL
    const urlPath = new URL(asset.url).pathname;
    const extMatch = urlPath.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      return extMatch[1].toLowerCase();
    }

    // Default based on type
    return asset.type === "IMAGE" ? "png" : "mp4";
  };

  // Generate unique filename for asset
  const generateFilename = (asset: Asset, index: number): string => {
    const date = new Date(asset.createdAt).toISOString().split("T")[0];
    const ratio = asset.aspectRatio?.replace(":", "x") || "unknown";
    const ext = getFileExtension(asset);
    const type = asset.type.toLowerCase();

    return `${type}-${ratio}-${date}-${index + 1}.${ext}`;
  };

  // Handle bulk download as ZIP
  const handleBulkDownload = async () => {
    if (selectedCount === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const downloadableAssets = selectedAssets.filter(
        (a) => a.type === "IMAGE" || a.type === "VIDEO"
      );
      const copyAssets = selectedAssets.filter((a) => a.type === "COPY");

      let completed = 0;
      const total = downloadableAssets.length + (copyAssets.length > 0 ? 1 : 0);

      // Download images and videos
      for (let i = 0; i < downloadableAssets.length; i++) {
        const asset = downloadableAssets[i];
        try {
          const response = await fetch(asset.url);
          if (!response.ok) {
            console.error(`Failed to fetch asset: ${asset.url}`);
            continue;
          }
          const blob = await response.blob();
          const filename = generateFilename(asset, i);
          zip.file(filename, blob);
        } catch (error) {
          console.error(`Error downloading asset ${asset.id}:`, error);
        }
        completed++;
        setDownloadProgress(Math.round((completed / total) * 100));
      }

      // Bundle copy assets into a single text file
      if (copyAssets.length > 0) {
        const copyContent = copyAssets
          .map((asset, i) => {
            const date = new Date(asset.createdAt).toLocaleDateString();
            return `--- Ad Copy ${i + 1} (${date}) ---\n\n${asset.prompt || "No content"}\n`;
          })
          .join("\n\n");
        zip.file("ad-copy.txt", copyContent);
        completed++;
        setDownloadProgress(Math.round((completed / total) * 100));
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(projectName)}-assets-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Clear selection after successful download
      onClearSelection();
    } catch (error) {
      console.error("Bulk download error:", error);
      alert("Failed to create ZIP file. Please try again.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;

    setIsDeleting(true);
    try {
      const assetIds = selectedAssets.map((a) => a.id);
      await onDelete(assetIds);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete some assets. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-foreground text-background border-4 border-foreground p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Selection info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={allSelected ? onClearSelection : onSelectAll}
              className="w-5 h-5 border-2 border-background flex items-center justify-center hover:bg-background/20 transition-colors"
              aria-label={allSelected ? "Deselect all" : "Select all"}
            >
              {allSelected && (
                <svg
                  className="w-4 h-4"
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
              )}
              {!allSelected && selectedCount > 0 && (
                <div className="w-2 h-2 bg-background" />
              )}
            </button>
            <span className="font-bold">
              {selectedCount} of {totalAssets} selected
            </span>
          </div>

          <button
            onClick={onClearSelection}
            className="text-sm underline hover:no-underline"
          >
            Clear selection
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!showDeleteConfirm ? (
            <>
              {/* Download ZIP button */}
              <Button
                onClick={handleBulkDownload}
                disabled={isDownloading || selectedCount === 0}
                className="bg-background text-foreground border-2 border-background hover:bg-background/90 font-bold"
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {downloadProgress}%
                  </>
                ) : (
                  <>
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
                    Download ZIP
                  </>
                )}
              </Button>

              {/* Delete button */}
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedCount === 0}
                variant="destructive"
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
            </>
          ) : (
            /* Delete confirmation */
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-300">
                Delete {selectedCount} asset{selectedCount !== 1 ? "s" : ""}?
              </span>
              <Button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                variant="destructive"
                className="font-bold"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="bg-background text-foreground border-2 border-background hover:bg-background/90 font-bold"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
