"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandAssetCard, BrandAssetType } from "./brand-asset-card";
import { UploadAssetDialog } from "./upload-asset-dialog";
import { Loader2, Plus, Save, Palette, Upload } from "lucide-react";

interface BrandAsset {
  id: string;
  type: BrandAssetType;
  url: string;
  description?: string | null;
  tags?: string[];
}

interface BrandData {
  colors?: string[];
  brandName?: string;
  tagline?: string;
  description?: string;
  voice?: string;
  industry?: string;
  productCategories?: string[];
}

interface BrandEditorProps {
  projectId: string;
  brandData?: BrandData | null;
  brandAssets?: BrandAsset[];
  onSave?: (data: BrandData) => Promise<void>;
  onExtractBrand?: () => Promise<void>;
  onUploadAsset?: (data: {
    file: File;
    type: BrandAssetType;
    description: string;
    tags: string[];
  }) => Promise<void>;
  onDeleteAsset?: (assetId: string) => Promise<void>;
  extracting?: boolean;
}

export function BrandEditor({
  projectId,
  brandData: initialBrandData,
  brandAssets: initialBrandAssets = [],
  onSave,
  onExtractBrand,
  onUploadAsset,
  onDeleteAsset,
  extracting = false,
}: BrandEditorProps) {
  const [brandData, setBrandData] = useState<BrandData>(
    initialBrandData || {}
  );
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>(
    initialBrandAssets
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newColor, setNewColor] = useState("#000000");

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(brandData);
    } finally {
      setIsSaving(false);
    }
  };

  const addColor = () => {
    if (newColor && !brandData.colors?.includes(newColor)) {
      setBrandData({
        ...brandData,
        colors: [...(brandData.colors || []), newColor],
      });
    }
  };

  const removeColor = (color: string) => {
    setBrandData({
      ...brandData,
      colors: brandData.colors?.filter((c) => c !== color) || [],
    });
  };

  const addProductCategory = () => {
    const category = prompt("Enter product category:");
    if (category && category.trim()) {
      setBrandData({
        ...brandData,
        productCategories: [
          ...(brandData.productCategories || []),
          category.trim(),
        ],
      });
    }
  };

  const removeProductCategory = (category: string) => {
    setBrandData({
      ...brandData,
      productCategories:
        brandData.productCategories?.filter((c) => c !== category) || [],
    });
  };

  const hasBrandData = brandData && Object.keys(brandData).length > 0;

  return (
    <div className="space-y-6">
      <UploadAssetDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={onUploadAsset!}
      />

      {/* Brand Data Section */}
      {hasBrandData ? (
        <Card className="border-4 border-foreground">
          <CardHeader>
            <CardTitle>Brand Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Brand Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Brand Name
              </label>
              <Input
                value={brandData.brandName || ""}
                onChange={(e) =>
                  setBrandData({ ...brandData, brandName: e.target.value })
                }
                placeholder="Your Brand Name"
                className="border-4 border-foreground"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Tagline
              </label>
              <Input
                value={brandData.tagline || ""}
                onChange={(e) =>
                  setBrandData({ ...brandData, tagline: e.target.value })
                }
                placeholder="Your tagline or slogan"
                className="border-4 border-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={brandData.description || ""}
                onChange={(e) =>
                  setBrandData({ ...brandData, description: e.target.value })
                }
                placeholder="Brief brand description..."
                rows={3}
                className="w-full border-4 border-foreground p-4 text-base font-medium bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Voice & Industry Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">
                  Brand Voice
                </label>
                <Input
                  value={brandData.voice || ""}
                  onChange={(e) =>
                    setBrandData({ ...brandData, voice: e.target.value })
                  }
                  placeholder="e.g., Professional, Innovative"
                  className="border-4 border-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wide">
                  Industry
                </label>
                <Input
                  value={brandData.industry || ""}
                  onChange={(e) =>
                    setBrandData({ ...brandData, industry: e.target.value })
                  }
                  placeholder="e.g., Technology, Healthcare"
                  className="border-4 border-foreground"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Palette
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {brandData.colors?.map((color) => (
                  <Badge
                    key={color}
                    variant="outline"
                    className="border-4 border-foreground pl-2 pr-3 py-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeColor(color)}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-2 border-2 border-foreground"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-20 h-12 border-4 border-foreground cursor-pointer"
                />
                <Input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="#000000"
                  className="border-4 border-foreground flex-1"
                />
                <Button onClick={addColor} className="font-black">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Product Categories */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wide">
                Product Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {brandData.productCategories?.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="border-4 border-foreground cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeProductCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={addProductCategory}
                variant="outline"
                className="font-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            {/* Save Button */}
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="font-black w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Brand Data
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-4 border-foreground">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No brand data extracted yet.
            </p>
            {onExtractBrand && (
              <Button
                onClick={onExtractBrand}
                disabled={extracting}
                className="font-black"
              >
                {extracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting Brand Data...
                  </>
                ) : (
                  "Extract Brand Data"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Brand Assets Section */}
      <Card className="border-4 border-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Brand Assets</CardTitle>
            {onUploadAsset && (
              <Button
                onClick={() => setShowUploadDialog(true)}
                variant="outline"
                className="font-black"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Asset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {brandAssets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandAssets.map((asset) => (
                <BrandAssetCard
                  key={asset.id}
                  id={asset.id}
                  type={asset.type}
                  url={asset.url}
                  description={asset.description || undefined}
                  tags={asset.tags || []}
                  onDelete={onDeleteAsset}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center">
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
              <p className="text-sm text-muted-foreground mb-4">
                No brand assets yet. Upload images like logos, products, or team photos.
              </p>
              {onUploadAsset && (
                <Button
                  onClick={() => setShowUploadDialog(true)}
                  variant="outline"
                  className="font-black"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload First Asset
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
