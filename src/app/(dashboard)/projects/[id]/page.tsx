"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Asset {
  id: string;
  type: "IMAGE" | "VIDEO" | "COPY";
  aspectRatio: string | null;
  url: string;
  thumbnailUrl: string | null;
  prompt: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  assetCount: number;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

      {/* Assets Grid */}
      {project.assets.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {project.assets.map((asset) => (
            <Card
              key={asset.id}
              className="border-4 border-foreground overflow-hidden group"
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
                <div className="absolute top-2 right-2">
                  <span className="bg-foreground text-background px-2 py-1 text-xs font-bold uppercase">
                    {asset.type}
                  </span>
                </div>
                <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-background border-4 border-background hover:bg-accent"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <a
                    href={asset.url}
                    download
                    className="p-2 bg-background border-4 border-background hover:bg-accent"
                  >
                    <svg
                      className="w-5 h-5"
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
                  </a>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">
                  {formatDate(asset.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
