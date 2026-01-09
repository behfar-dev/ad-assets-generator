"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { X, Upload } from "lucide-react";

export type BrandAssetType = "LOGO" | "FOUNDER" | "MASCOT" | "PRODUCT" | "OTHER";

interface BrandAssetCardProps {
  id: string;
  type: BrandAssetType;
  url: string;
  description?: string;
  tags?: string[];
  onDelete?: (id: string) => void;
  onReplace?: (id: string, file: File) => void;
}

const assetTypeLabels: Record<BrandAssetType, string> = {
  LOGO: "Logo",
  FOUNDER: "Founder",
  MASCOT: "Mascot",
  PRODUCT: "Product",
  OTHER: "Other",
};

const assetTypeColors: Record<BrandAssetType, string> = {
  LOGO: "bg-primary text-primary-foreground",
  FOUNDER: "bg-blue-500 text-white",
  MASCOT: "bg-purple-500 text-white",
  PRODUCT: "bg-green-500 text-white",
  OTHER: "bg-gray-500 text-white",
};

export function BrandAssetCard({
  id,
  type,
  url,
  description,
  tags = [],
  onDelete,
  onReplace,
}: BrandAssetCardProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplace) {
      onReplace(id, file);
    }
  };

  return (
    <Card className="border-4 border-foreground overflow-hidden">
      <div className="aspect-square relative bg-muted">
        <Image
          src={url}
          alt={`${assetTypeLabels[type]} asset`}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={assetTypeColors[type]}>
            {assetTypeLabels[type]}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          {onReplace && (
            <label htmlFor={`replace-${id}`}>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
              <input
                id={`replace-${id}`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {(description || tags.length > 0) && (
        <div className="p-3 border-t-4 border-foreground space-y-2">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
