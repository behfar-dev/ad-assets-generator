"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BrandAsset {
  id: string;
  type: "LOGO" | "FOUNDER" | "MASCOT" | "PRODUCT" | "OTHER";
  url: string;
  description?: string | null;
}

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  brandAssets?: BrandAsset[];
  selected?: boolean;
  onClick?: () => void;
}

export function ProjectCard({
  id,
  name,
  description,
  brandAssets = [],
  selected = false,
  onClick,
}: ProjectCardProps) {
  const logo = brandAssets.find((asset) => asset.type === "LOGO");

  return (
    <Card
      className={cn(
        "border-4 cursor-pointer transition-all hover:shadow-lg",
        selected
          ? "border-primary bg-primary/5"
          : "border-foreground/20 hover:border-foreground"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo ? (
              <div className="w-16 h-16 border-4 border-foreground bg-background flex items-center justify-center overflow-hidden">
                <img
                  src={logo.url}
                  alt={`${name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 border-4 border-dashed border-foreground/30 bg-muted flex items-center justify-center">
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
            )}
          </div>

          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-lg uppercase truncate">{name}</h3>
              {selected && (
                <Badge variant="default" className="text-xs font-bold">
                  SELECTED
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            {logo && (
              <p className="text-xs text-muted-foreground mt-1">
                Logo will be used in generation
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
