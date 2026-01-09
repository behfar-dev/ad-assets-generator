"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BrandAsset {
  id: string;
  type: "LOGO" | "FOUNDER" | "MASCOT" | "PRODUCT" | "OTHER";
  url: string;
  description?: string | null;
  tags?: string[];
}

interface BrandAssetSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandAssets: BrandAsset[];
  onSelect: (assets: BrandAsset[]) => void;
}

const assetTypeLabels: Record<BrandAsset["type"], string> = {
  LOGO: "Logo",
  FOUNDER: "Founder",
  MASCOT: "Mascot",
  PRODUCT: "Product",
  OTHER: "Other",
};

const assetTypeColors: Record<BrandAsset["type"], string> = {
  LOGO: "bg-blue-500 text-white",
  FOUNDER: "bg-purple-500 text-white",
  MASCOT: "bg-green-500 text-white",
  PRODUCT: "bg-orange-500 text-white",
  OTHER: "bg-gray-500 text-white",
};

export function BrandAssetSelector({
  open,
  onOpenChange,
  brandAssets,
  onSelect,
}: BrandAssetSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleAsset = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    const selected = brandAssets.filter((asset) => selectedIds.has(asset.id));
    onSelect(selected);
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedIds(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border-4 border-foreground max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">
            Select Brand Assets
          </DialogTitle>
          <DialogDescription>
            Choose brand assets to use as input images for generation. Selected assets will be added to your upload queue.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {brandAssets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-dashed border-foreground/30 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">
                No brand assets found for this project.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload brand assets in the project settings first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
              {brandAssets.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <button
                    key={asset.id}
                    onClick={() => toggleAsset(asset.id)}
                    className={cn(
                      "relative border-4 transition-all group",
                      isSelected
                        ? "border-primary shadow-lg"
                        : "border-foreground/20 hover:border-foreground/50"
                    )}
                  >
                    {/* Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <img
                        src={asset.url}
                        alt={asset.description || assetTypeLabels[asset.type]}
                        className="w-full h-full object-cover"
                      />

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-12 h-12 bg-primary border-4 border-background flex items-center justify-center">
                            <Check className="w-6 h-6 text-primary-foreground" />
                          </div>
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={cn("text-xs font-bold", assetTypeColors[asset.type])}>
                          {assetTypeLabels[asset.type]}
                        </Badge>
                      </div>
                    </div>

                    {/* Description & Tags */}
                    <div className="p-2 text-left bg-background">
                      {asset.description && (
                        <p className="text-xs font-medium line-clamp-1 mb-1">
                          {asset.description}
                        </p>
                      )}
                      {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {asset.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{asset.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="flex-1 sm:flex-none font-black"
          >
            Add {selectedIds.size > 0 && `(${selectedIds.size})`} Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
