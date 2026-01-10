"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Asset {
  id: string;
  type: "IMAGE" | "VIDEO" | "COPY";
  aspectRatio: string | null;
  url: string;
  prompt: string | null;
  creditCost: number;
  createdAt: string;
  project: {
    id: string;
    name: string;
  } | null;
}

interface Project {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creditsSummary, setCreditsSummary] = useState({
    totalSpent: 0,
    imageCredits: 0,
    videoCredits: 0,
    copyCredits: 0,
  });

  // Get filter values from URL
  const typeFilter = searchParams.get("type") || "";
  const projectFilter = searchParams.get("projectId") || "";
  const searchQuery = searchParams.get("q") || "";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Update URL params
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset page when filters change (except when page itself is updated)
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/history?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch projects for filter dropdown
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch(console.error);
  }, []);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "20");
      if (typeFilter) params.set("type", typeFilter);
      if (projectFilter) params.set("projectId", projectFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/assets/history?${params.toString()}`);
      const data = await res.json();

      setAssets(data.assets || []);
      setPagination(data.pagination || null);
      setCreditsSummary(
        data.creditsSummary || {
          totalSpent: 0,
          imageCredits: 0,
          videoCredits: 0,
          copyCredits: 0,
        }
      );
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, typeFilter, projectFilter, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Group assets by date
  const groupedAssets = useMemo(() => {
    const groups: Record<string, Asset[]> = {};
    assets.forEach((asset) => {
      const date = new Date(asset.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(asset);
    });
    return groups;
  }, [assets]);

  const hasFilters =
    typeFilter || projectFilter || searchQuery || dateFrom || dateTo;

  const clearFilters = () => {
    router.push("/history");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IMAGE":
        return (
          <svg
            className="w-4 h-4"
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
        );
      case "VIDEO":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case "COPY":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "IMAGE":
        return "bg-blue-500";
      case "VIDEO":
        return "bg-purple-500";
      case "COPY":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Generation History
        </h1>
        <p className="text-muted-foreground">
          View all your past generations with prompts, settings, and credit
          usage
        </p>
      </div>

      {/* Credits Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-4 border-foreground">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Total Credits Used
            </p>
            <p className="text-3xl font-black text-primary">
              {creditsSummary.totalSpent.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-4 border-foreground">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Images
            </p>
            <p className="text-3xl font-black text-blue-500">
              {creditsSummary.imageCredits.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-4 border-foreground">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Videos
            </p>
            <p className="text-3xl font-black text-purple-500">
              {creditsSummary.videoCredits.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-4 border-foreground">
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Ad Copy
            </p>
            <p className="text-3xl font-black text-green-500">
              {creditsSummary.copyCredits.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-4 border-foreground">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Search Prompts
              </label>
              <input
                type="text"
                placeholder="Search by prompt keywords..."
                value={searchQuery}
                onChange={(e) => updateFilters({ q: e.target.value })}
                className="w-full border-4 border-foreground px-3 py-2 bg-background focus:outline-none focus:border-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-40">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => updateFilters({ type: e.target.value })}
                className="w-full border-4 border-foreground px-3 py-2 bg-background focus:outline-none focus:border-primary"
              >
                <option value="">All Types</option>
                <option value="IMAGE">Images</option>
                <option value="VIDEO">Videos</option>
                <option value="COPY">Ad Copy</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                Project
              </label>
              <select
                value={projectFilter}
                onChange={(e) => updateFilters({ projectId: e.target.value })}
                className="w-full border-4 border-foreground px-3 py-2 bg-background focus:outline-none focus:border-primary"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="w-full lg:w-36">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilters({ from: e.target.value })}
                className="w-full border-4 border-foreground px-3 py-2 bg-background focus:outline-none focus:border-primary"
              />
            </div>
            <div className="w-full lg:w-36">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => updateFilters({ to: e.target.value })}
                className="w-full border-4 border-foreground px-3 py-2 bg-background focus:outline-none focus:border-primary"
              />
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Info */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-bold text-foreground">
              {assets.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-foreground">
              {pagination.totalCount}
            </span>{" "}
            generations
            {hasFilters && " (filtered)"}
          </p>
        </div>
      )}

      {/* Timeline View */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-foreground border-t-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading history...</p>
        </div>
      ) : assets.length === 0 ? (
        <Card className="border-4 border-foreground">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <svg
              className="w-16 h-16 text-muted-foreground mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl font-bold mb-2">No generations found</p>
            <p className="text-muted-foreground text-center mb-4">
              {hasFilters
                ? "Try adjusting your filters"
                : "Generate your first asset to see it here"}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters}>Clear Filters</Button>
            ) : (
              <Link href="/generate">
                <Button>Generate Assets</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAssets).map(([date, dateAssets]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="sticky top-0 bg-background z-10 py-2 mb-4">
                <h2 className="text-lg font-black uppercase border-b-4 border-foreground pb-2">
                  {date}
                </h2>
              </div>

              {/* Assets for this date */}
              <div className="space-y-4 pl-4 border-l-4 border-foreground/20">
                {dateAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="border-4 border-foreground hover:border-primary transition-colors"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Preview */}
                        <div className="w-full md:w-48 h-32 md:h-auto bg-accent/30 flex-shrink-0">
                          {asset.type === "IMAGE" && (
                            <img
                              src={asset.url}
                              alt={asset.prompt || "Generated image"}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {asset.type === "VIDEO" && (
                            <video
                              src={asset.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                          {asset.type === "COPY" && (
                            <div className="w-full h-full p-4 flex items-center">
                              <p className="text-sm line-clamp-3 text-muted-foreground">
                                {asset.url}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Type & Time */}
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white ${getTypeBadgeColor(asset.type)}`}
                                >
                                  {getTypeIcon(asset.type)}
                                  {asset.type}
                                </span>
                                {asset.aspectRatio && (
                                  <span className="text-xs text-muted-foreground border border-foreground/20 px-2 py-0.5">
                                    {asset.aspectRatio}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(asset.createdAt)}
                                </span>
                              </div>

                              {/* Prompt */}
                              {asset.prompt && (
                                <p className="text-sm line-clamp-2 mb-2">
                                  {asset.prompt}
                                </p>
                              )}

                              {/* Project Link */}
                              {asset.project && (
                                <Link
                                  href={`/projects/${asset.project.id}`}
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                  </svg>
                                  {asset.project.name}
                                </Link>
                              )}
                            </div>

                            {/* Credit Cost */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-muted-foreground uppercase">
                                Credits
                              </p>
                              <p className="text-lg font-black text-primary">
                                -{asset.creditCost}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() =>
              updateFilters({ page: (currentPage - 1).toString() })
            }
          >
            Previous
          </Button>
          <span className="px-4 py-2 border-4 border-foreground font-bold">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= pagination.totalPages}
            onClick={() =>
              updateFilters({ page: (currentPage + 1).toString() })
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center p-8">
          <div className="inline-block w-8 h-8 border-4 border-foreground border-t-primary animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
