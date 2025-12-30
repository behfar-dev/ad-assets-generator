"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditBalance } from "@/components/credits/credit-balance";
import Link from "next/link";
import { useState, useRef } from "react";

export default function GeneratePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Generate Assets
          </h1>
          <p className="text-muted-foreground">
            Upload an image to generate ad creatives with AI
          </p>
        </div>
        <div className="border-4 border-foreground px-4 py-2">
          <CreditBalance />
        </div>
      </div>

      {/* Credit Info */}
      <Card className="border-4 border-foreground bg-primary/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-4 border-foreground bg-primary flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold">Credit Usage</p>
              <p className="text-sm text-muted-foreground">
                Images: 1 credit | Videos: 5 credits
              </p>
            </div>
          </div>
          <Link href="/billing">
            <Button variant="outline" size="sm">
              Buy Credits
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload */}
        <Card className="border-4 border-foreground">
          <CardHeader>
            <CardTitle>Upload Brand Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-4 border-dashed cursor-pointer transition-all
                ${isDragging ? "border-primary bg-primary/10" : "border-foreground/50 hover:border-foreground"}
                ${previewUrl ? "p-2" : "p-12"}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full aspect-square object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="absolute top-2 right-2 w-10 h-10 bg-background border-4 border-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
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
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 border-4 border-foreground flex items-center justify-center">
                    <svg
                      className="w-10 h-10"
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
                  <div>
                    <p className="font-bold text-lg">
                      Drop your image here or click to upload
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG, or WebP up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between border-4 border-foreground/20 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-muted flex items-center justify-center flex-shrink-0">
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
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Badge variant="success">Ready</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Asset Types */}
        <Card className="border-4 border-foreground">
          <CardHeader>
            <CardTitle>What Will Be Generated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "9:16 Stories", count: 3, credits: 3, icon: "📱" },
                { type: "3:4 Portrait", count: 3, credits: 3, icon: "🖼️" },
                { type: "1:1 Square", count: 3, credits: 3, icon: "⬜" },
                { type: "16:9 Landscape", count: 3, credits: 3, icon: "🖥️" },
                { type: "16:9 Videos", count: 3, credits: 15, icon: "🎬" },
              ].map((item) => (
                <div
                  key={item.type}
                  className="border-4 border-foreground/20 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-sm">{item.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {item.count} assets
                    </span>
                    <Badge variant="outline" size="xs">
                      {item.credits} credits
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-4 border-foreground/20 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold">Total Cost</span>
                <span className="text-2xl font-black text-primary">
                  ~27 credits
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Plus AI-generated ad copy including headlines, descriptions,
                CTAs, and social media captions.
              </p>
            </div>

            <Link href="/" className="block">
              <Button
                className="w-full h-14 text-lg"
                disabled={!selectedFile}
              >
                {selectedFile ? (
                  <>
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Generate Assets
                  </>
                ) : (
                  "Upload an Image First"
                )}
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              You will be redirected to the full generator
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Generations */}
      <Card className="border-4 border-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Generations</CardTitle>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 border-4 border-dashed border-muted-foreground flex items-center justify-center mb-4">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-muted-foreground">
              Your recent generations will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
