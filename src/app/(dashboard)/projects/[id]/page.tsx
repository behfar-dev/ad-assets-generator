"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandEditor } from "@/components/brand/brand-editor";
import { AssetDetailModal } from "@/components/asset/asset-detail-modal";
import { BulkActionsToolbar } from "@/components/asset/bulk-actions-toolbar";

interface Asset {
  id: string;
  type: "IMAGE" | "VIDEO" | "COPY";
  aspectRatio: string | null;
  url: string;
  thumbnailUrl: string | null;
  prompt: string | null;
  createdAt: string;
}

interface BrandAsset {
  id: string;
  type: "LOGO" | "FOUNDER" | "MASCOT" | "PRODUCT" | "OTHER";
  url: string;
  description?: string | null;
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

interface Project {
  id: string;
  name: string;
  description: string | null;
  websiteUrl?: string | null;
  brandData?: BrandData | null;
  extractionStatus?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
  assetCount: number;
  assets: Asset[];
  brandAssets?: BrandAsset[];
  createdAt: string;
  updatedAt: string;
}

type AssetType = "ALL" | "IMAGE" | "VIDEO" | "COPY";
type AspectRatioFilter = "ALL" | "9:16" | "3:4" | "1:1" | "16:9" | "4:3";
type SortOption = "newest" | "oldest" | "type";

const ASPECT_RATIO_OPTIONS: { value: AspectRatioFilter; label: string }[] = [
  { value: "ALL", label: "All Ratios" },
  { value: "9:16", label: "9:16 (Vertical)" },
  { value: "3:4", label: "3:4 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "16:9", label: "16:9 (Widescreen)" },
];

const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "ALL", label: "All Types" },
  { value: "IMAGE", label: "Images" },
  { value: "VIDEO", label: "Videos" },
  { value: "COPY", label: "Ad Copy" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "type", label: "By Type" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Bulk selection state
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filter state from URL params
  const typeFilter = (searchParams.get("type") as AssetType) || "ALL";
  const aspectFilter = (searchParams.get("aspect") as AspectRatioFilter) || "ALL";
  const sortOption = (searchParams.get("sort") as SortOption) || "newest";
  const searchQuery = searchParams.get("q") || "";

  // Update URL params without navigation
  const updateFilters = useCallback(
    (updates: {
      type?: AssetType;
      aspect?: AspectRatioFilter;
      sort?: SortOption;
      q?: string;
    }) => {
      const newParams = new URLSearchParams(searchParams.toString());

      if (updates.type !== undefined) {
        if (updates.type === "ALL") {
          newParams.delete("type");
        } else {
          newParams.set("type", updates.type);
        }
      }
      if (updates.aspect !== undefined) {
        if (updates.aspect === "ALL") {
          newParams.delete("aspect");
        } else {
          newParams.set("aspect", updates.aspect);
        }
      }
      if (updates.sort !== undefined) {
        if (updates.sort === "newest") {
          newParams.delete("sort");
        } else {
          newParams.set("sort", updates.sort);
        }
      }
      if (updates.q !== undefined) {
        if (updates.q === "") {
          newParams.delete("q");
        } else {
          newParams.set("q", updates.q);
        }
      }

      const queryString = newParams.toString();
      router.replace(
        `/projects/${params.id}${queryString ? `?${queryString}` : ""}`,
        { scroll: false }
      );
    },
    [searchParams, router, params.id]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(`/projects/${params.id}`, { scroll: false });
  }, [router, params.id]);

  // Check if any filters are active
  const hasActiveFilters = typeFilter !== "ALL" || aspectFilter !== "ALL" || sortOption !== "newest" || searchQuery !== "";

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    if (!project?.assets) return [];

    let assets = [...project.assets];

    // Filter by type
    if (typeFilter !== "ALL") {
      assets = assets.filter((a) => a.type === typeFilter);
    }

    // Filter by aspect ratio
    if (aspectFilter !== "ALL") {
      assets = assets.filter((a) => a.aspectRatio === aspectFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter(
        (a) => a.prompt?.toLowerCase().includes(query)
      );
    }

    // Sort
    assets.sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "type":
          return a.type.localeCompare(b.type);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return assets;
  }, [project?.assets, typeFilter, aspectFilter, sortOption, searchQuery]);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/projects/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Project not found");
          return res.json();
        })
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch project:", error);
          router.push("/projects");
        });
    }
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project");

      router.push("/projects");
    } catch (error) {
      console.error("Delete error:", error);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSaveBrandData = async (brandData: BrandData) => {
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandData }),
      });

      if (!res.ok) throw new Error("Failed to save brand data");

      const updated = await res.json();
      setProject(updated);
    } catch (error) {
      console.error("Save brand data error:", error);
      alert("Failed to save brand data");
    }
  };

  const handleExtractBrand = async () => {
    if (!project?.websiteUrl) {
      alert("No website URL provided. Please add a website URL first.");
      return;
    }

    setIsExtracting(true);
    try {
      const res = await fetch(`/api/projects/${params.id}/extract-brand`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract brand data");
      }

      // Refresh project data
      const projectRes = await fetch(`/api/projects/${params.id}`);
      const updatedProject = await projectRes.json();
      setProject(updatedProject);

      alert("Brand data extracted successfully!");
    } catch (error) {
      console.error("Extract brand error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to extract brand data"
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUploadAsset = async (data: {
    file: File;
    type: string;
    description: string;
    tags: string[];
  }) => {
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(data.file);
      });

      // Upload to storage via API
      const res = await fetch(`/api/projects/${params.id}/upload-asset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: data.file.name,
          fileData: base64,
          contentType: data.file.type,
          assetType: data.type,
          description: data.description,
          tags: data.tags,
        }),
      });

      if (!res.ok) {
        let message = "Failed to upload asset";
        try {
          const resData = await res.json();
          if (resData?.error) message = String(resData.error);
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {
            // ignore
          }
        }
        throw new Error(`${message} (HTTP ${res.status})`);
      }

      // Refresh project data to show new asset
      const projectRes = await fetch(`/api/projects/${params.id}`);
      const updatedProject = await projectRes.json();
      setProject(updatedProject);

      alert("Asset uploaded successfully!");
    } catch (error) {
      console.error("Upload asset error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to upload asset"
      );
    }
  };

  const handleDeleteBrandAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${params.id}/delete-asset/${assetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete asset");
      }

      // Refresh project data
      const projectRes = await fetch(`/api/projects/${params.id}`);
      const updatedProject = await projectRes.json();
      setProject(updatedProject);

      alert("Asset deleted successfully!");
    } catch (error) {
      console.error("Delete asset error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete asset"
      );
    }
  };

  // Handler for opening asset detail modal
  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsAssetModalOpen(true);
  };

  // Handler for deleting generated assets (from modal)
  const handleDeleteGeneratedAsset = async (assetId: string) => {
    const res = await fetch(`/api/assets/${assetId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete asset");
    }

    // Refresh project data
    const projectRes = await fetch(`/api/projects/${params.id}`);
    const updatedProject = await projectRes.json();
    setProject(updatedProject);
    setSelectedAsset(null);
  };

  // Handler for regenerating asset (navigate to generate page with asset data)
  const handleRegenerateAsset = (asset: Asset) => {
    // Navigate to generate page with asset as reference for variant generation
    const queryParams = new URLSearchParams({
      variantFrom: asset.url,
      variantType: asset.type.toLowerCase(),
      ...(asset.aspectRatio && { aspectRatio: asset.aspectRatio }),
      ...(asset.prompt && { prompt: asset.prompt }),
    });
    router.push(`/generate?${queryParams.toString()}`);
  };

  // Bulk selection handlers
  const toggleAssetSelection = (assetId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedAssetIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      // Exit selection mode if nothing selected
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      } else if (!isSelectionMode) {
        setIsSelectionMode(true);
      }
      return newSet;
    });
  };

  const selectAllAssets = () => {
    const allIds = new Set(filteredAssets.map((a) => a.id));
    setSelectedAssetIds(allIds);
    setIsSelectionMode(true);
  };

  const clearSelection = () => {
    setSelectedAssetIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async (assetIds: string[]) => {
    // Delete assets one by one (API doesn't support bulk delete currently)
    const errors: string[] = [];

    for (const id of assetIds) {
      try {
        const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          errors.push(data.error || `Failed to delete asset ${id}`);
        }
      } catch (error) {
        errors.push(`Failed to delete asset ${id}`);
        console.error("Delete error:", error);
      }
    }

    if (errors.length > 0) {
      console.error("Bulk delete errors:", errors);
    }

    // Refresh project data
    const projectRes = await fetch(`/api/projects/${params.id}`);
    const updatedProject = await projectRes.json();
    setProject(updatedProject);

    // Clear selection
    clearSelection();

    if (errors.length > 0) {
      throw new Error(`Failed to delete ${errors.length} asset(s)`);
    }
  };

  // Get selected assets for toolbar
  const selectedAssets = useMemo(() => {
    return filteredAssets.filter((a) => selectedAssetIds.has(a.id));
  }, [filteredAssets, selectedAssetIds]);

  const allFilteredSelected =
    filteredAssets.length > 0 &&
    filteredAssets.every((a) => selectedAssetIds.has(a.id));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3" />
          <div className="h-6 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <Link
              href="/projects"
              className="text-muted-foreground hover:text-foreground"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              {project.name}
            </h1>
          </div>
          {project.description && (
            <p className="text-muted-foreground ml-10">{project.description}</p>
          )}
          <p className="text-sm text-muted-foreground ml-10">
            Created {formatDate(project.createdAt)} | {project.assetCount} assets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/generate">
            <Button className="font-bold">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Generate Assets
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Brand Data Section */}
      {project.websiteUrl && (
        <BrandEditor
          projectId={project.id}
          brandData={project.brandData}
          brandAssets={project.brandAssets}
          onSave={handleSaveBrandData}
          onExtractBrand={handleExtractBrand}
          onUploadAsset={handleUploadAsset}
          onDeleteAsset={handleDeleteBrandAsset}
          extracting={isExtracting || project.extractionStatus === "PROCESSING"}
        />
      )}

      {/* Assets Section */}
      <div className="space-y-4">
        {/* Filter Controls - only show if there are assets */}
        {project.assets && project.assets.length > 0 && (
          <Card className="border-4 border-foreground">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Search and controls row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <Input
                      placeholder="Search by prompt..."
                      value={searchQuery}
                      onChange={(e) => updateFilters({ q: e.target.value })}
                      className="pl-10 h-10"
                    />
                  </div>

                  {/* Filter dropdowns */}
                  <div className="flex flex-wrap gap-2">
                    <Select
                      value={typeFilter}
                      onValueChange={(value) => updateFilters({ type: value as AssetType })}
                    >
                      <SelectTrigger className="w-[140px] border-4 border-foreground bg-background text-foreground h-10">
                        <SelectValue placeholder="Asset Type" />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-foreground bg-background">
                        {ASSET_TYPE_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-foreground hover:bg-accent"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={aspectFilter}
                      onValueChange={(value) => updateFilters({ aspect: value as AspectRatioFilter })}
                    >
                      <SelectTrigger className="w-[160px] border-4 border-foreground bg-background text-foreground h-10">
                        <SelectValue placeholder="Aspect Ratio" />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-foreground bg-background">
                        {ASPECT_RATIO_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-foreground hover:bg-accent"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={sortOption}
                      onValueChange={(value) => updateFilters({ sort: value as SortOption })}
                    >
                      <SelectTrigger className="w-[140px] border-4 border-foreground bg-background text-foreground h-10">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="border-4 border-foreground bg-background">
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-foreground hover:bg-accent"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="h-10 font-bold"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results count and select toggle */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{filteredAssets.length}</span> of{" "}
                    <span className="font-bold text-foreground">{project.assets.length}</span> assets
                  </span>
                  <div className="flex items-center gap-4">
                    {hasActiveFilters && (
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Filters active
                      </span>
                    )}
                    {filteredAssets.length > 0 && (
                      <Button
                        variant={isSelectionMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isSelectionMode) {
                            clearSelection();
                          } else {
                            setIsSelectionMode(true);
                          }
                        }}
                        className="font-bold"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        {isSelectionMode ? "Cancel" : "Select"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions Toolbar - show when items are selected */}
        {isSelectionMode && selectedAssetIds.size > 0 && (
          <BulkActionsToolbar
            selectedAssets={selectedAssets}
            totalAssets={filteredAssets.length}
            projectName={project.name}
            onSelectAll={selectAllAssets}
            onClearSelection={clearSelection}
            onDelete={handleBulkDelete}
            allSelected={allFilteredSelected}
          />
        )}

        {/* Empty state */}
        {(!project.assets || project.assets.length === 0) ? (
          <Card className="border-4 border-foreground">
            <CardContent className="flex flex-col items-center justify-center p-16 space-y-6">
              <div className="w-24 h-24 border-4 border-dashed border-muted-foreground flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-muted-foreground"
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
              <div className="text-center space-y-2">
                <p className="text-xl font-bold">No assets yet</p>
                <p className="text-muted-foreground">
                  Generate your first ad assets for this project
                </p>
              </div>
              <Link href="/generate">
                <Button size="lg" className="font-black">
                  Generate Assets
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredAssets.length === 0 ? (
          /* No results from filtering */
          <Card className="border-4 border-foreground">
            <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
              <svg
                className="w-16 h-16 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold">No matching assets</p>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
              <Button variant="outline" onClick={clearFilters} className="font-bold">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Assets grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAssetIds.has(asset.id);
              return (
                <Card
                  key={asset.id}
                  className={`border-4 overflow-hidden group cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-foreground hover:border-primary"
                  }`}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleAssetSelection(asset.id, { stopPropagation: () => {} } as React.MouseEvent);
                    } else {
                      handleAssetClick(asset);
                    }
                  }}
                >
                  <div className="relative aspect-square bg-muted">
                    {asset.type === "IMAGE" && (
                      <img
                        src={asset.thumbnailUrl || asset.url}
                        alt={asset.prompt || "Generated asset"}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {asset.type === "VIDEO" && (
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    )}
                    {asset.type === "COPY" && (
                      <div className="w-full h-full p-4 flex items-center justify-center text-center">
                        <p className="text-sm line-clamp-6">{asset.prompt}</p>
                      </div>
                    )}

                    {/* Selection checkbox - show in selection mode or on hover */}
                    <div
                      className={`absolute top-2 left-2 z-10 ${
                        isSelectionMode || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      } transition-opacity`}
                    >
                      <button
                        onClick={(e) => toggleAssetSelection(asset.id, e)}
                        className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-foreground hover:border-primary"
                        }`}
                        aria-label={isSelected ? "Deselect asset" : "Select asset"}
                      >
                        {isSelected && (
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
                      </button>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className="bg-foreground text-background px-2 py-1 text-xs font-bold uppercase">
                        {asset.type}
                      </span>
                    </div>

                    {/* Hover overlay with quick actions - hide in selection mode */}
                    {!isSelectionMode && (
                      <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center">
                          <svg
                            className="w-10 h-10 mx-auto text-background mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="text-background text-sm font-bold uppercase">
                            View Details
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Selection mode overlay - show checkmark icon when selected */}
                    {isSelectionMode && isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-primary-foreground"
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
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(asset.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        open={isAssetModalOpen}
        onOpenChange={setIsAssetModalOpen}
        onDelete={handleDeleteGeneratedAsset}
        onRegenerate={handleRegenerateAsset}
        projectName={project.name}
      />
    </div>
  );
}
