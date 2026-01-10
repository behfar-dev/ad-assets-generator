"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { BrandAssetType } from "./brand-asset-card";

interface UploadAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (data: {
    file: File;
    type: BrandAssetType;
    description: string;
    tags: string[];
  }) => Promise<void>;
}

export function UploadAssetDialog({
  open,
  onOpenChange,
  onUpload,
}: UploadAssetDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<BrandAssetType>("PRODUCT");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload({
        file,
        type: assetType,
        description,
        tags,
      });

      // Reset form
      setFile(null);
      setPreview(null);
      setAssetType("PRODUCT");
      setDescription("");
      setTags([]);
      setTagInput("");
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md md:max-w-xl border-4 border-foreground max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">
            Upload Brand Asset
          </DialogTitle>
          <DialogDescription>
            Upload an image (logo, product shot, founder photo, etc.) to help the brand system generate better ads.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              Image File *
            </label>
            {preview ? (
              <div className="relative border-4 border-foreground p-4 bg-muted">
                <div className="aspect-video relative bg-background flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 font-black"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <label
                htmlFor="asset-file"
                className="block border-4 border-dashed border-foreground p-8 text-center cursor-pointer hover:bg-muted"
              >
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-bold">Click to upload image</p>
                <input
                  id="asset-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Asset Type */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              Asset Type *
            </label>
            <Select
              value={assetType}
              onValueChange={(value) => setAssetType(value as BrandAssetType)}
            >
              <SelectTrigger className="border-4 border-foreground h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOGO">Logo</SelectItem>
                <SelectItem value="FOUNDER">Founder/Owner</SelectItem>
                <SelectItem value="MASCOT">Mascot</SelectItem>
                <SelectItem value="PRODUCT">Product</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Main product hero shot"
              className="border-4 border-foreground h-12"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">
              Tags
            </label>
            <p className="text-xs text-muted-foreground">
              Add tags to help the AI understand when to use this asset
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-4 border-foreground px-2 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., hero, lifestyle, outdoor"
                className="border-4 border-foreground h-12"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="font-black"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="text-xs text-muted-foreground w-full">
                Suggested tags:
              </p>
              {["hero", "lifestyle", "product-shot", "detail", "action", "outdoor", "studio"].map(
                (suggestion) =>
                  !tags.includes(suggestion) && (
                    <Badge
                      key={suggestion}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        setTags([...tags, suggestion]);
                      }}
                    >
                      + {suggestion}
                    </Badge>
                  )
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!file || isUploading}
              className="flex-1 h-12 font-black"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Asset"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="h-12"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
