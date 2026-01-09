"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CreditBalance } from "@/components/credits/credit-balance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import OpenAI from "openai";
import { fal } from "@fal-ai/client";
import { getUserFalKey } from "@/lib/use-user-fal-key";
import { ProjectCard } from "@/components/project/project-card";
import { BrandAssetSelector } from "@/components/brand/brand-asset-selector";
import {
  CREATIVE_DIRECTIONS,
  DEFAULT_CREATIVE_DIRECTION_ID,
  type CreativeDirectionId,
  getCreativeDirection,
  buildImageGenerationPrompt,
  buildVideoGenerationPrompt,
} from "@/lib/creative-direction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Fal AI Logo Spinner Component
function FalSpinner({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      style={style}
      width="48"
      height="48"
      viewBox="0 0 170 171"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M109.571 0.690002C112.515 0.690002 114.874 3.08348 115.155 6.01352C117.665 32.149 138.466 52.948 164.603 55.458C167.534 55.7394 169.927 58.0985 169.927 61.042V110.255C169.927 113.198 167.534 115.557 164.603 115.839C138.466 118.349 117.665 139.148 115.155 165.283C114.874 168.213 112.515 170.607 109.571 170.607H60.3553C57.4116 170.607 55.0524 168.213 54.7709 165.283C52.2608 139.148 31.4601 118.349 5.32289 115.839C2.39266 115.557 -0.000976562 113.198 -0.000976562 110.255V61.042C-0.000976562 58.0985 2.39267 55.7394 5.3229 55.458C31.4601 52.948 52.2608 32.149 54.7709 6.01351C55.0524 3.08348 57.4116 0.690002 60.3553 0.690002H109.571ZM34.1182 85.5045C34.1182 113.776 57.0124 136.694 85.2539 136.694C113.495 136.694 136.39 113.776 136.39 85.5045C136.39 57.2332 113.495 34.3147 85.2539 34.3147C57.0124 34.3147 34.1182 57.2332 34.1182 85.5045Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Asset type
type Asset = {
  id: string;
  type: 'image' | 'video';
  aspectRatio: '9:16' | '3:4' | '1:1' | '16:9';
  status: 'generating' | 'completed' | 'failed';
  description: string;
  url: string;
  dbId?: string; // Database ID after saving
};

// History item type (from database)
type HistoryItem = {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  aspectRatio: string;
  url: string;
  prompt: string | null;
  settings: any;
  createdAt: string;
};

// Convert Base64 Data URI to Blob
function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Convert File to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Tool Definitions (OpenAI Format)
const analyzeBrandTool = {
  type: "function" as const,
  function: {
    name: "analyze_brand_identity",
    description: "Analyzes the image to extract brand colors, mood, and subject matter",
    parameters: {
      type: "object",
      properties: {
        colors: { type: "array", items: { type: "string" }, description: "Hex codes of dominant brand colors" },
        mood: { type: "string", description: "Emotional tone (e.g., Energetic, Serene, Luxury)" },
        subject: { type: "string", description: "Main subject of the image" },
        brandName: { type: "string", description: "Brand name visible or inferred" },
        slogan: { type: "string", description: "Potential marketing slogan" },
        hasLogo: { type: "boolean", description: "Whether a distinct brand logo is detected" }
      },
      required: ["colors", "mood", "subject"],
    },
  },
};

const generateImageSpecsTool = {
  type: "function" as const,
  function: {
    name: "generate_asset_specs",
    description: "Determines prompts and aspect ratios for diverse assets",
    parameters: {
      type: "object",
      properties: {
        socialPrompts: { type: "array", items: { type: "string" }, description: "Prompts for 9:16 stories. NO TEXT in images." },
        portrait34Prompts: { type: "array", items: { type: "string" }, description: "Prompts for 3:4 portrait. NO TEXT in images." },
        videoPrompts: { type: "array", items: { type: "string" }, description: "Cinematic prompts for 16:9 videos (Kling)." },
        squarePrompts: { type: "array", items: { type: "string" }, description: "Prompts for 1:1 feed posts. NO TEXT in images." },
        landscapePrompts: { type: "array", items: { type: "string" }, description: "Cinematic prompts for 16:9 landscape. NO TEXT in images." },
      },
      required: ["socialPrompts", "portrait34Prompts", "videoPrompts", "squarePrompts", "landscapePrompts"],
    },
  },
};

const generateAdCopyTool = {
  type: "function" as const,
  function: {
    name: "generate_ad_copy",
    description: "Generates comprehensive advertising copy",
    parameters: {
      type: "object",
      properties: {
        headline: { type: "string", description: "Main headline (max 10 words)" },
        tagline: { type: "string", description: "Brand tagline" },
        description: { type: "string", description: "Ad description (2-3 sentences)" },
        cta: { type: "string", description: "Call-to-action text" },
        hashtags: { type: "array", items: { type: "string" }, description: "5-8 hashtags" },
        instagramCaption: { type: "string", description: "Instagram caption" },
        facebookCaption: { type: "string", description: "Facebook caption" },
        twitterCaption: { type: "string", description: "Twitter/X caption" },
        linkedinCaption: { type: "string", description: "LinkedIn caption" },
      },
      required: ["headline", "description", "cta", "hashtags"],
    },
  },
};

const generateUniquePromptTool = {
  type: "function" as const,
  function: {
    name: "generate_unique_prompt",
    description: "Generates a unique, creative prompt for asset generation",
    parameters: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Unique, creative, original prompt" },
      },
      required: ["prompt"],
    },
  },
};

interface BrandAsset {
  id: string;
  type: "LOGO" | "FOUNDER" | "MASCOT" | "PRODUCT" | "OTHER";
  url: string;
  description?: string | null;
  tags?: string[];
}

type Project = {
  id: string;
  name: string;
  description: string | null;
  brandAssets?: BrandAsset[];
  brandData?: {
    colors?: string[];
    brandName?: string;
    tagline?: string;
    description?: string;
    voice?: string;
    industry?: string;
    productCategories?: string[];
  } | null;
};

export default function GeneratePage() {
  const { data: session } = useSession();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project selection
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Aspect ratio counts
  const [portraitCount, setPortraitCount] = useState<number>(1);
  const [portrait34Count, setPortrait34Count] = useState<number>(1);
  const [squareCount, setSquareCount] = useState<number>(1);
  const [landscapeCount, setLandscapeCount] = useState<number>(1);
  const [videoCount, setVideoCount] = useState<number>(1);

  const [userInstruction, setUserInstruction] = useState("");
  const [creativeDirectionId, setCreativeDirectionId] =
    useState<CreativeDirectionId>(DEFAULT_CREATIVE_DIRECTION_ID);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'analyzing' | 'generating' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Results
  const [brandContext, setBrandContext] = useState<{
    colors?: string[];
    mood?: string;
    subject?: string;
    brandName?: string;
  } | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<Asset[]>([]);
  const [adCopy, setAdCopy] = useState<{
    headline?: string;
    tagline?: string;
    description?: string;
    cta?: string;
    hashtags?: string[];
    instagramCaption?: string;
    facebookCaption?: string;
    twitterCaption?: string;
    linkedinCaption?: string;
  } | null>(null);

  const [uploadedSourceUrls, setUploadedSourceUrls] = useState<string[]>([]);
  const [openaiClient, setOpenaiClient] = useState<OpenAI | null>(null);
  const [isGeneratingAdCopy, setIsGeneratingAdCopy] = useState(false);

  // Dialog states
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSingleAssetDialog, setShowSingleAssetDialog] = useState(false);
  const [singleAssetType, setSingleAssetType] = useState<'image' | 'video'>('image');
  const [singleAssetAspectRatio, setSingleAssetAspectRatio] = useState<'9:16' | '3:4' | '1:1' | '16:9'>('16:9');
  const [singleAssetInstruction, setSingleAssetInstruction] = useState("");
  const [showAssetVariantDialog, setShowAssetVariantDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | HistoryItem | null>(null);
  const [showBrandAssetSelector, setShowBrandAssetSelector] = useState(false);
  const [variantInstruction, setVariantInstruction] = useState("");
  const [variantAspectRatio, setVariantAspectRatio] = useState<'9:16' | '3:4' | '1:1' | '16:9'>('16:9');
  const [variantType, setVariantType] = useState<'image' | 'video'>('image');
  const [showAdCopyDialog, setShowAdCopyDialog] = useState(false);
  const [adCopyInstruction, setAdCopyInstruction] = useState("");

  // Credit transaction tracking for refunds
  const creditTransactionsRef = useRef<Array<{ amount: number; type: "IMAGE_GENERATION" | "VIDEO_GENERATION" | "AD_COPY_GENERATION"; transactionId?: string }>>([]);

  // Load history and projects from database on mount
  useEffect(() => {
    loadHistory();
    loadProjects();
  }, [session]);

  // Load brand data when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      loadProjectBrandData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjectBrandData = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const project = await response.json();

        // If project has brand data, populate brand context
        if (project.brandData) {
          setBrandContext({
            colors: project.brandData.colors || [],
            mood: project.brandData.voice || "Professional",
            subject: project.brandData.description || project.brandName || "Brand",
            brandName: project.brandData.brandName || project.name,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load project brand data:", err);
    }
  };

  const loadProjects = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoadingProjects(true);
      const response = await fetch('/api/projects?sortBy=updatedAt&sortOrder=desc');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadHistory = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/assets?limit=50&sortBy=createdAt&sortOrder=desc');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.assets || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  // Credit management functions
  const checkCredits = async (amount: number): Promise<{ hasEnough: boolean; balance: number }> => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check', amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to check credits');
      }

      const data = await response.json();
      return { hasEnough: data.hasEnough, balance: data.balance };
    } catch (err) {
      console.error("Check credits error:", err);
      throw err;
    }
  };

  const deductCredits = async (
    amount: number,
    type: "IMAGE_GENERATION" | "VIDEO_GENERATION" | "AD_COPY_GENERATION",
    description?: string
  ): Promise<{ transactionId: string; newBalance: number }> => {
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deduct', amount, type, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402) {
          throw new Error(`Insufficient credits. Required: ${errorData.required}, Available: ${errorData.available}`);
        }
        throw new Error(errorData.error || 'Failed to deduct credits');
      }

      const data = await response.json();
      // Track transaction for potential refund
      creditTransactionsRef.current.push({
        amount,
        type,
        transactionId: data.transactionId,
      });
      return data;
    } catch (err) {
      console.error("Deduct credits error:", err);
      throw err;
    }
  };

  const refundCredits = async (
    amount: number,
    type: "IMAGE_GENERATION" | "VIDEO_GENERATION" | "AD_COPY_GENERATION",
    reason?: string
  ): Promise<void> => {
    try {
      const response = await fetch('/api/credits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type, reason }),
      });

      if (!response.ok) {
        console.error("Failed to refund credits");
      }
    } catch (err) {
      console.error("Refund credits error:", err);
    }
  };

  const refundAllFailedCredits = async (reason: string) => {
    const transactions = creditTransactionsRef.current;
    if (transactions.length === 0) return;

    // Refund all tracked transactions
    await Promise.all(
      transactions.map((tx) =>
        refundCredits(tx.amount, tx.type, `${reason} - Transaction: ${tx.transactionId}`)
      )
    );

    // Clear tracked transactions
    creditTransactionsRef.current = [];
  };

  // Helper to ensure OpenAI client is initialized
  const ensureOpenAIClient = (): OpenAI => {
    if (openaiClient) return openaiClient;

    const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
    if (!falKey) {
      throw new Error("FAL API key required. Configure NEXT_PUBLIC_FAL_API_KEY in environment variables.");
    }

    if (typeof fal.config === 'function') {
      fal.config({ credentials: falKey });
    }

    const client = new OpenAI({
      baseURL: "https://fal.run/openrouter/router/openai/v1",
      apiKey: "not-needed",
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        "Authorization": `Key ${falKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Fal Creative Agent",
      },
    });

    setOpenaiClient(client);
    return client;
  };

  // Initialize on mount
  useEffect(() => {
    try {
      ensureOpenAIClient();
    } catch (e) {
      console.log("OpenAI client will be initialized when needed");
    }
  }, []);

  const uploadSourceImages = async (files: File[]): Promise<string[]> => {
    const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
    if (!falKey) throw new Error("FAL API key required");

    if (typeof fal.config === 'function') {
      fal.config({ credentials: falKey });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const base64 = await fileToBase64(file);
        const blob = base64ToBlob(base64);
        const url = await fal.storage.upload(blob);
        return url;
      } catch (e) {
        console.error("Failed to upload:", e);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  };

  const analyzeImage = async (base64Data: string): Promise<any> => {
    const client = ensureOpenAIClient();
    const model = "google/gemini-3-pro-preview";
    const imageUrl = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and call the analyze_brand_identity function." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        }],
        tools: [analyzeBrandTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && 'function' in toolCall && toolCall.function.name === 'analyze_brand_identity') {
        return JSON.parse(toolCall.function.arguments);
      }

      return { colors: ["#000000"], mood: "Modern", subject: "Unknown" };
    } catch (e) {
      console.error("Error in analyzeImage:", e);
      throw e;
    }
  };

  const createSpecs = async (context: any, userInstruction?: string, counts?: { portrait: number; portrait34: number; square: number; landscape: number; video: number }): Promise<any> => {
    const client = ensureOpenAIClient();
    const model = "google/gemini-3-pro-preview";
    const pCount = counts?.portrait ?? portraitCount;
    const p34Count = counts?.portrait34 ?? portrait34Count;
    const sCount = counts?.square ?? squareCount;
    const lCount = counts?.landscape ?? landscapeCount;
    const vCount = counts?.video ?? videoCount;

    // Build brand context string if available
    let brandContextStr = "";
    if (brandContext?.colors && brandContext.colors.length > 0) {
      brandContextStr += `\nBrand Colors: ${brandContext.colors.join(", ")}`;
    }
    if (brandContext?.mood) {
      brandContextStr += `\nBrand Voice/Tone: ${brandContext.mood}`;
    }
    if (brandContext?.brandName) {
      brandContextStr += `\nBrand Name: ${brandContext.brandName}`;
    }

    const creativeDirection = getCreativeDirection(creativeDirectionId);
    let prompt = `Based on context: ${JSON.stringify(context)}, create:
    - ${pCount} prompts for social (9:16)
    - ${p34Count} prompts for portrait (3:4)
    - ${vCount} prompts for Video (16:9) [All for Kling]
    - ${sCount} prompts for Square (1:1)
    - ${lCount} prompts for Landscape (16:9)

    CONTENT GOAL: ${creativeDirection.label}
    ${creativeDirection.assetSpecGuidelines({ vCount })}
    ${brandContextStr ? `\nBRAND GUIDELINES:${brandContextStr}\nEnsure all prompts align with these brand guidelines.` : ""}

    Call generate_asset_specs.`;

    if (userInstruction) {
      prompt += `\n\nIMPORTANT USER INSTRUCTION: ${userInstruction}\nAlign all prompts with this.`;
    }

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        tools: [generateImageSpecsTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && 'function' in toolCall && toolCall.function.name === 'generate_asset_specs') {
        return JSON.parse(toolCall.function.arguments);
      }

      return {
        socialPrompts: Array(pCount).fill("Vibrant lifestyle shot"),
        portrait34Prompts: Array(p34Count).fill("Elegant portrait composition"),
        videoPrompts: Array(vCount).fill("Cinematic wide shot"),
        squarePrompts: Array(sCount).fill("Minimalist product focus"),
        landscapePrompts: Array(lCount).fill("Wide cinematic product shot")
      };
    } catch (e) {
      console.error("Error in createSpecs:", e);
      return {
        socialPrompts: Array(pCount).fill("Vibrant lifestyle shot"),
        portrait34Prompts: Array(p34Count).fill("Elegant portrait composition"),
        videoPrompts: Array(vCount).fill("Cinematic wide shot"),
        squarePrompts: Array(sCount).fill("Minimalist product focus"),
        landscapePrompts: Array(lCount).fill("Wide cinematic product shot")
      };
    }
  };

  // Save asset to database
  const saveAssetToDatabase = async (asset: Asset): Promise<string | null> => {
    if (!session?.user?.id || asset.status !== 'completed' || !asset.url) return null;

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: asset.type.toUpperCase(),
          aspectRatio: asset.aspectRatio,
          url: asset.url,
          prompt: asset.description,
          projectId: selectedProjectId || null,
          settings: {
            brandContext,
            userInstruction,
            creativeDirectionId,
          },
          creditCost: asset.type === 'video' ? 5 : 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.asset?.id || null;
      }
    } catch (err) {
      console.error("Failed to save asset:", err);
    }
    return null;
  };

  const generateAsset = async (id: string, prompt: string, aspectRatio: Asset['aspectRatio'], sourceImageUrls: string[]) => {
    try {
      const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
      if (!falKey) throw new Error("FAL API key required");

      if (typeof fal.config === 'function') {
        fal.config({ credentials: falKey });
      }

      setProgressMessage(`Generating ${aspectRatio} image...`);

      const result: any = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
        input: {
          prompt: buildImageGenerationPrompt({ creativeDirectionId, prompt }),
          image_urls: sourceImageUrls,
          aspect_ratio: aspectRatio,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          enable_safety_checker: false,
          output_format: "png"
        } as any,
        logs: true
      });

      const images = result.images || result.data?.images;

      if (images && images.length > 0) {
        const finalUrl = images[0].url;

        // Update state to mark as completed
        const updatedAsset: Asset = {
          id,
          type: 'image',
          aspectRatio,
          status: 'completed',
          description: prompt,
          url: finalUrl
        };

        setGeneratedAssets(prev => prev.map(asset =>
          asset.id === id ? updatedAsset : asset
        ));

        // Save to database (outside state setter to avoid duplicates)
        const dbId = await saveAssetToDatabase(updatedAsset);
        if (dbId) {
          setGeneratedAssets(prev => prev.map(a =>
            a.id === id ? { ...a, dbId } : a
          ));
          loadHistory(); // Reload history
        }
      } else {
        throw new Error(`No image returned`);
      }
    } catch (err: any) {
      console.error(err);
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  const generateVideoWorkflow = async (id: string, prompt: string, sourceImageUrls: string[]) => {
    try {
      const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
      if (!falKey) throw new Error("FAL API key required");

      if (typeof fal.config === 'function') {
        fal.config({ credentials: falKey });
      }

      setProgressMessage(`Generating video keyframe...`);

      const imageResult: any = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
        input: {
          prompt: buildImageGenerationPrompt({
            creativeDirectionId,
            prompt: `Cinematic, clean composition, no text, ${prompt}`,
          }),
          image_urls: sourceImageUrls,
          aspect_ratio: "16:9",
          output_format: "png"
        }
      });

      const images = imageResult.images || imageResult.data?.images;
      const imageUrl = images?.[0]?.url;
      if (!imageUrl) throw new Error(`Failed to generate keyframe`);

      setProgressMessage(`Generating video with Kling 2.6...`);

      const videoPrompt = buildVideoGenerationPrompt({
        creativeDirectionId,
        prompt,
      });
      const result: any = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
        input: {
          prompt: videoPrompt,
          image_url: imageUrl,
          duration: "10",
          generate_audio: true
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log: any) => log.message).forEach(console.log);
          }
        },
      });

      const video = result.video || result.data?.video;
      const videoUrl = video?.url || result.data?.url || result.url;

      if (videoUrl) {
        // Update state to mark as completed
        const updatedAsset: Asset = {
          id,
          type: 'video',
          aspectRatio: '16:9',
          status: 'completed',
          description: prompt,
          url: videoUrl
        };

        setGeneratedAssets(prev => prev.map(asset =>
          asset.id === id ? updatedAsset : asset
        ));

        // Save to database (outside state setter to avoid duplicates)
        const dbId = await saveAssetToDatabase(updatedAsset);
        if (dbId) {
          setGeneratedAssets(prev => prev.map(a =>
            a.id === id ? { ...a, dbId } : a
          ));
          loadHistory();
        }
      } else {
        throw new Error(`No video returned`);
      }
    } catch (err: any) {
      console.error(err);
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  const generateAdCopy = async (customInstruction?: string, contextOverride?: typeof brandContext) => {
    const context = contextOverride || brandContext;
    if (!context) {
      setError("Please run initial generation first");
      return;
    }

    const client = ensureOpenAIClient();
    setIsGeneratingAdCopy(true);

    const model = "google/gemini-3-pro-preview";
    const creativeDirection = getCreativeDirection(creativeDirectionId);
    let prompt = `Based on brand context: ${JSON.stringify(context)}, generate comprehensive advertising copy.
    Create: headline, tagline, description, CTA, hashtags, and social media captions.
    Align with brand mood: ${context.mood}, subject: ${context.subject}, brand: ${context.brandName || 'Brand'}
    Content goal: ${creativeDirection.label}
    ${creativeDirection.adCopyGuidelines}
    Call generate_ad_copy.`;

    if (customInstruction) {
      prompt += `\n\nIMPORTANT: ${customInstruction}`;
    }

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        tools: [generateAdCopyTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && 'function' in toolCall && toolCall.function.name === 'generate_ad_copy') {
        setAdCopy(JSON.parse(toolCall.function.arguments));
      } else {
        // Fallback
        setAdCopy({
          headline: `Discover ${context?.brandName || 'Excellence'}`,
          tagline: `${context?.mood || 'Premium'} Quality`,
          description: `Experience exceptional quality crafted with care.`,
          cta: "Shop Now",
          hashtags: ["premium", "quality", "lifestyle"],
        });
      }
    } catch (err) {
      console.error("Ad copy error:", err);
      setAdCopy({
        headline: `Discover ${context?.brandName || 'Excellence'}`,
        tagline: `${context?.mood || 'Premium'} Quality`,
        description: `Experience exceptional quality.`,
        cta: "Learn More",
        hashtags: ["premium", "quality", "lifestyle"],
      });
    } finally {
      setIsGeneratingAdCopy(false);
    }
  };

  // Generate unique prompt
  const generateUniquePrompt = async (type: 'image' | 'video', aspectRatio: Asset['aspectRatio']): Promise<string> => {
    if (!brandContext) throw new Error("Brand context not initialized");

    const client = ensureOpenAIClient();
    const model = "google/gemini-3-pro-preview";
    const assetType = type === 'video' ? 'video' : 'image';
    const creativeDirection = getCreativeDirection(creativeDirectionId);

    const prompt = `Based on brand context: ${JSON.stringify(brandContext)}, generate a UNIQUE prompt for ${assetType} (${aspectRatio}).
    Must be creative, visually stunning, and aligned with mood: ${brandContext.mood}, subject: ${brandContext.subject}.
    Content goal: ${creativeDirection.label}
    ${creativeDirection.assetSpecGuidelines({ vCount: videoCount })}
    Call generate_unique_prompt.`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        tools: [generateUniquePromptTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && 'function' in toolCall && toolCall.function.name === 'generate_unique_prompt') {
        const result = JSON.parse(toolCall.function.arguments);
        return result.prompt;
      }

      // Fallback
      const timestamp = Date.now();
      return type === 'video'
        ? `Cinematic ${brandContext.subject} showcase, ${brandContext.mood} atmosphere, unique ${timestamp}`
        : `Creative ${creativeDirection.label} concept, ${brandContext.subject}, ${brandContext.mood} mood, unique ${timestamp}`;
    } catch (err) {
      console.error("Unique prompt error:", err);
      const timestamp = Date.now();
      return type === 'video'
        ? `Cinematic ${brandContext.subject} showcase, ${brandContext.mood} atmosphere, unique ${timestamp}`
        : `Creative ${creativeDirection.label} concept, ${brandContext.subject}, ${brandContext.mood} mood, unique ${timestamp}`;
    }
  };

  // Generate single asset variant
  const generateSingleAssetVariant = async (type: 'image' | 'video', aspectRatio: Asset['aspectRatio'], customInstruction?: string) => {
    if (!brandContext) {
      setError("Please run initial generation first");
      return;
    }
    if (uploadedSourceUrls.length === 0) {
      setError("No source images available");
      return;
    }

    // Calculate credits needed
    const creditsNeeded = type === 'video' ? 5 : 1;
    const id = `${type}-${aspectRatio}-${Date.now()}`;

    try {
      // Check and deduct credits
      const creditCheck = await checkCredits(creditsNeeded);
      if (!creditCheck.hasEnough) {
        setError(`Insufficient credits. Required: ${creditsNeeded}, Available: ${creditCheck.balance}`);
        return;
      }

      await deductCredits(
        creditsNeeded,
        type === 'video' ? "VIDEO_GENERATION" : "IMAGE_GENERATION",
        `Single ${type} generation (${aspectRatio})`
      );

      const placeholderDesc = customInstruction || `Generating ${type}...`;
      const newAsset: Asset = {
        id,
        type,
        aspectRatio,
        status: 'generating',
        description: placeholderDesc,
        url: ''
      };

      setGeneratedAssets(prev => [...prev, newAsset]);

      let prompt = "";
      if (customInstruction) {
        prompt = customInstruction;
      } else {
        prompt = await generateUniquePrompt(type, aspectRatio);
      }

      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, description: prompt } : asset
      ));

      if (type === 'video') {
        await generateVideoWorkflow(id, prompt, uploadedSourceUrls);
      } else {
        await generateAsset(id, prompt, aspectRatio, uploadedSourceUrls);
      }

      // Clear credit transaction on success
      creditTransactionsRef.current = creditTransactionsRef.current.slice(0, -1);
    } catch (err) {
      console.error("Single asset error:", err);
      
      // Refund credits if generation fails
      if (creditsNeeded > 0 && creditTransactionsRef.current.length > 0) {
        const lastTransaction = creditTransactionsRef.current[creditTransactionsRef.current.length - 1];
        if (lastTransaction) {
          await refundCredits(
            lastTransaction.amount,
            lastTransaction.type,
            `Single asset generation failed`
          );
          creditTransactionsRef.current = creditTransactionsRef.current.slice(0, -1);
        }
      }

      // Update asset status to failed
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  // Generate variant from existing asset
  const generateVariantFromAsset = async (sourceAsset: Asset | HistoryItem, type: 'image' | 'video', aspectRatio: Asset['aspectRatio'], customInstruction?: string) => {
    if (!sourceAsset.url) {
      setError("Source asset has no URL");
      return;
    }

    // Calculate credits needed
    const creditsNeeded = type === 'video' ? 5 : 1;
    const id = `${type}-${aspectRatio}-variant-${Date.now()}`;

    try {
      // Check and deduct credits
      const creditCheck = await checkCredits(creditsNeeded);
      if (!creditCheck.hasEnough) {
        setError(`Insufficient credits. Required: ${creditsNeeded}, Available: ${creditCheck.balance}`);
        return;
      }

      await deductCredits(
        creditsNeeded,
        type === 'video' ? "VIDEO_GENERATION" : "IMAGE_GENERATION",
        `Variant ${type} generation from existing asset (${aspectRatio})`
      );

      const placeholderDesc = customInstruction || `Generating ${type} variant...`;

      const newAsset: Asset = {
        id,
        type,
        aspectRatio,
        status: 'generating',
        description: placeholderDesc,
        url: ''
      };

      setGeneratedAssets(prev => [...prev, newAsset]);
      let prompt = "";
      if (customInstruction) {
        prompt = customInstruction;
      } else if (brandContext) {
        prompt = await generateUniquePrompt(type, aspectRatio);
      } else {
        const creativeDirection = getCreativeDirection(creativeDirectionId);
        prompt = `Creative variant for ${creativeDirection.label}, unique ${Date.now()}`;
      }

      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, description: prompt } : asset
      ));

      if (type === 'video') {
        // Use source image as keyframe
        const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
        if (!falKey) throw new Error("FAL API key required");

        if (typeof fal.config === 'function') {
          fal.config({ credentials: falKey });
        }

        setProgressMessage(`Generating video from selected image...`);

        const videoPrompt = buildVideoGenerationPrompt({
          creativeDirectionId,
          prompt,
        });
        const result: any = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
          input: {
            prompt: videoPrompt,
            image_url: sourceAsset.url,
            duration: "10",
            generate_audio: true
          },
          logs: true,
        });

        const video = result.video || result.data?.video;
        const videoUrl = video?.url || result.data?.url || result.url;

        if (videoUrl) {
          // Update state to mark as completed
          const updatedAsset: Asset = {
            id,
            type: 'video',
            aspectRatio: '16:9',
            status: 'completed',
            description: prompt,
            url: videoUrl
          };

          setGeneratedAssets(prev => prev.map(asset =>
            asset.id === id ? updatedAsset : asset
          ));

          // Save to database (outside state setter to avoid duplicates)
          const dbId = await saveAssetToDatabase(updatedAsset);
          if (dbId) {
            setGeneratedAssets(prev => prev.map(a =>
              a.id === id ? { ...a, dbId } : a
            ));
            loadHistory();
          }
        } else {
          throw new Error(`No video returned`);
        }
      } else {
        // Image variant using img2img
        const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
        if (!falKey) throw new Error("FAL API key required");

        if (typeof fal.config === 'function') {
          fal.config({ credentials: falKey });
        }

        setProgressMessage(`Generating image variant...`);

        const result: any = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
          input: {
            prompt: buildImageGenerationPrompt({ creativeDirectionId, prompt }),
            image_urls: [sourceAsset.url],
            aspect_ratio: aspectRatio,
            num_inference_steps: 28,
            guidance_scale: 3.5,
            enable_safety_checker: false,
            output_format: "png"
          } as any,
          logs: true
        });

        const images = result.images || result.data?.images;

        if (images && images.length > 0) {
          const finalUrl = images[0].url;

          // Update state to mark as completed
          const updatedAsset: Asset = {
            id,
            type: 'image',
            aspectRatio,
            status: 'completed',
            description: prompt,
            url: finalUrl
          };

          setGeneratedAssets(prev => prev.map(asset =>
            asset.id === id ? updatedAsset : asset
          ));

          // Save to database (outside state setter to avoid duplicates)
          const dbId = await saveAssetToDatabase(updatedAsset);
          if (dbId) {
            setGeneratedAssets(prev => prev.map(a =>
              a.id === id ? { ...a, dbId } : a
            ));
            loadHistory();
          }
        } else {
          throw new Error(`No image returned`);
        }
      }

      // Clear credit transaction on success
      creditTransactionsRef.current = creditTransactionsRef.current.slice(0, -1);
    } catch (err) {
      console.error("Variant error:", err);
      
      // Refund credits if generation fails
      if (creditsNeeded > 0 && creditTransactionsRef.current.length > 0) {
        const lastTransaction = creditTransactionsRef.current[creditTransactionsRef.current.length - 1];
        if (lastTransaction) {
          await refundCredits(
            lastTransaction.amount,
            lastTransaction.type,
            `Variant generation failed`
          );
          creditTransactionsRef.current = creditTransactionsRef.current.slice(0, -1);
        }
      }

      // Update asset status to failed - find by id if available, otherwise by type/aspectRatio
      setGeneratedAssets(prev => {
        const assetToUpdate = prev.find(a => a.id === id);
        if (assetToUpdate) {
          return prev.map(asset =>
            asset.id === id ? { ...asset, status: 'failed' } : asset
          );
        }
        // Fallback: find by type/aspectRatio if id not found
        return prev.map(asset => {
          if (asset.status === 'generating' && asset.type === type && asset.aspectRatio === aspectRatio) {
            return { ...asset, status: 'failed' };
          }
          return asset;
        });
      });
    }
  };

  // Handle asset click
  const handleAssetClick = (asset: Asset) => {
    if (asset.status === 'completed' && asset.url && asset.type === 'image') {
      setSelectedAsset(asset);
      setVariantAspectRatio(asset.aspectRatio);
      setVariantType('image');
      setVariantInstruction("");
      setShowAssetVariantDialog(true);
    }
  };

  // Generate variant from history
  const generateVariantFromHistory = (item: HistoryItem) => {
    const mockAsset: Asset = {
      id: item.id,
      type: item.type === 'IMAGE' ? 'image' : 'video',
      aspectRatio: item.aspectRatio as Asset['aspectRatio'],
      status: 'completed',
      description: item.prompt || '',
      url: item.url,
    };
    setSelectedAsset(mockAsset);
    setVariantAspectRatio(mockAsset.aspectRatio);
    setVariantType('image');
    setVariantInstruction("");
    setShowAssetVariantDialog(true);
    setShowHistory(false);
  };

  // Delete history item
  const deleteHistoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete asset:", err);
    }
  };

  // Clear all history
  const clearHistory = async () => {
    if (!confirm("Are you sure you want to delete all generated assets? This cannot be undone.")) return;

    try {
      // Delete all assets one by one
      await Promise.all(history.map(item => deleteHistoryItem(item.id)));
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleGenerate = async () => {
    const falKey = getUserFalKey() || process.env.NEXT_PUBLIC_FAL_API_KEY;
    if (!falKey) {
      setError("Please configure FAL API key in environment variables");
      return;
    }

    if (typeof fal.config === 'function') {
      fal.config({ credentials: falKey });
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Uploading images...");
    setError(null);
    setCurrentPhase('analyzing');
    // DON'T clear brandContext - preserve project brand data
    const hasProjectBrandData = brandContext && (brandContext.colors || brandContext.brandName);
    setGeneratedAssets([]);
    creditTransactionsRef.current = []; // Reset credit transactions

    // Calculate total credits needed
    const totalAssets = portraitCount + portrait34Count + squareCount + landscapeCount;
    const totalVideos = videoCount;
    const totalCredits = totalAssets * 1 + totalVideos * 5; // 1 credit per image, 5 per video

    try {
      // Check and deduct credits before starting generation
      if (totalCredits > 0) {
        setProgressMessage("Checking credits...");
        const creditCheck = await checkCredits(totalCredits);

        if (!creditCheck.hasEnough) {
          setError(`Insufficient credits. Required: ${totalCredits}, Available: ${creditCheck.balance}`);
          setIsProcessing(false);
          setCurrentPhase('idle');
          return;
        }

        setProgressMessage("Deducting credits...");
        await deductCredits(
          totalCredits,
          totalVideos > 0 ? "VIDEO_GENERATION" : "IMAGE_GENERATION",
          `Batch generation: ${totalAssets} image${totalAssets !== 1 ? 's' : ''}, ${totalVideos} video${totalVideos !== 1 ? 's' : ''}`
        );
      }

      setProgressMessage("Uploading source assets...");
      setProgress(10);
      const uploadedUrls = await uploadSourceImages(uploadedImages);
      setUploadedSourceUrls(uploadedUrls);

      if (uploadedUrls.length === 0) {
        // Refund credits if upload fails
        if (totalCredits > 0) {
          await refundAllFailedCredits("Failed to upload source images");
        }
        throw new Error("Failed to upload images");
      }

      // Only analyze image if project brand data doesn't exist
      let finalBrandContext = brandContext;
      if (!hasProjectBrandData) {
        setProgressMessage("Analyzing brand identity...");
        setProgress(20);
        const primaryImageBase64 = await fileToBase64(uploadedImages[0]);
        const analysisResult = await analyzeImage(primaryImageBase64);

        if (!analysisResult) {
          // Refund credits if analysis fails
          if (totalCredits > 0) {
            await refundAllFailedCredits("Failed to analyze brand identity");
          }
          throw new Error("Failed to analyze image");
        }

        finalBrandContext = analysisResult;
        setBrandContext(analysisResult);
      } else {
        setProgressMessage("Using project brand data...");
        setProgress(20);
      }

      setProgress(30);

      setProgressMessage("Formulating strategy...");
      setProgress(40);
      const counts = { portrait: portraitCount, portrait34: portrait34Count, square: squareCount, landscape: landscapeCount, video: videoCount };
      const specs = await createSpecs({ mood: finalBrandContext?.mood || "Professional", subject: finalBrandContext?.subject || "Brand" }, userInstruction, counts);

      setCurrentPhase('generating');
      setProgressMessage("Generating assets...");
      setProgress(50);

      const pendingTasks: Array<() => Promise<void>> = [];
      const assets: Asset[] = [];

      if (portraitCount > 0) {
        specs.socialPrompts.slice(0, portraitCount).forEach((prompt: string, i: number) => {
          const id = `image-9:16-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '9:16', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '9:16', uploadedUrls));
        });
      }

      if (portrait34Count > 0) {
        const portrait34Prompts = specs.portrait34Prompts || Array(portrait34Count).fill("Elegant portrait");
        portrait34Prompts.slice(0, portrait34Count).forEach((prompt: string, i: number) => {
          const id = `image-3:4-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '3:4', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '3:4', uploadedUrls));
        });
      }

      if (squareCount > 0) {
        specs.squarePrompts.slice(0, squareCount).forEach((prompt: string, i: number) => {
          const id = `image-1:1-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '1:1', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '1:1', uploadedUrls));
        });
      }

      if (landscapeCount > 0) {
        const landscapePrompts = specs.landscapePrompts || Array(landscapeCount).fill("Cinematic product shot");
        landscapePrompts.slice(0, landscapeCount).forEach((prompt: string, i: number) => {
          const id = `image-16:9-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '16:9', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '16:9', uploadedUrls));
        });
      }

      if (videoCount > 0) {
        const videoPrompts = specs.videoPrompts || Array(videoCount).fill("Cinematic wide shot");
        videoPrompts.slice(0, videoCount).forEach((prompt: string, i: number) => {
          const id = `video-16:9-${Date.now()}-${i}`;
          const description = `[Kling] ${prompt}`;
          assets.push({ id, type: 'video', aspectRatio: '16:9', status: 'generating', description, url: '' });
          pendingTasks.push(() => generateVideoWorkflow(id, prompt, uploadedUrls));
        });
      }

      setGeneratedAssets(assets);
      setProgress(60);

      // Generate all assets
      await Promise.all(pendingTasks.map(task => task()));

      // Clear credit transactions on success (no refund needed)
      creditTransactionsRef.current = [];

      setIsGeneratingAdCopy(true);
      try {
        await generateAdCopy(userInstruction || undefined, finalBrandContext);
      } catch (err) {
        console.error("Ad copy error:", err);
      } finally {
        setIsGeneratingAdCopy(false);
      }

      setCurrentPhase('completed');
      setProgress(100);
      setProgressMessage("All assets generated!");

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate";
      setError(message);
      console.error("Generation error:", err);
      
      // Refund credits if generation fails before completion
      if (totalCredits > 0 && creditTransactionsRef.current.length > 0) {
        await refundAllFailedCredits(`Generation failed: ${message}`);
      }
      
      setCurrentPhase('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentPhase('idle');
    setProgress(0);
    setUploadedImages([]);
    setPreviewUrls([]);
    setUserInstruction("");
    setBrandContext(null);
    setGeneratedAssets([]);
    setError(null);
    setUploadedSourceUrls([]);
    setPortraitCount(1);
    setPortrait34Count(1);
    setSquareCount(1);
    setLandscapeCount(1);
    setVideoCount(1);
    setAdCopy(null);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setError("Please select image files");
      return;
    }

    setUploadedImages(prev => [...prev, ...imageFiles]);
    const newUrls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newUrls]);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleBrandAssetsSelected = async (assets: BrandAsset[]) => {
    try {
      // Download each brand asset and convert to File
      const filePromises = assets.map(async (asset) => {
        const response = await fetch(asset.url);
        const blob = await response.blob();
        const filename = `brand-${asset.type.toLowerCase()}-${asset.id}.${blob.type.split('/')[1] || 'png'}`;
        return new File([blob], filename, { type: blob.type });
      });

      const files = await Promise.all(filePromises);

      // Add to uploaded images
      setUploadedImages(prev => [...prev, ...files]);

      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } catch (err) {
      console.error("Failed to load brand assets:", err);
      setError("Failed to load brand assets");
    }
  };

  const getAspectRatioBadge = (ratio: string) => {
    const colors: Record<string, string> = {
      '9:16': 'bg-purple-500/10 text-purple-600 border-purple-600',
      '3:4': 'bg-orange-500/10 text-orange-600 border-orange-600',
      '1:1': 'bg-blue-500/10 text-blue-600 border-blue-600',
      '16:9': 'bg-green-500/10 text-green-600 border-green-600',
    };
    return colors[ratio] || 'bg-muted text-muted-foreground border-muted-foreground';
  };

  const totalAssets = portraitCount + portrait34Count + squareCount + landscapeCount;
  const totalVideos = videoCount;
  const estimatedCredits = totalAssets + (totalVideos * 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight uppercase">Generate Assets</h1>
          <p className="text-muted-foreground">Upload images to generate ad creatives with AI</p>
        </div>
        <div className="flex items-center gap-4">
          {/* History Button */}
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className="border-4 border-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
            {history.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground border-none px-2 py-0.5 text-xs">
                {history.length}
              </Badge>
            )}
          </Button>
          <div className="border-4 border-foreground px-4 py-2">
            <CreditBalance />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-4 border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-4 border-destructive bg-destructive flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="font-bold text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload & Configure Section */}
      {currentPhase === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <Card className="border-4 border-foreground">
              <CardHeader>
                <CardTitle>Upload Brand Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative border-4 border-dashed cursor-pointer transition-all",
                    isDragging ? "border-primary bg-primary/10" : "border-foreground/50 hover:border-foreground",
                    previewUrls.length > 0 ? "p-2" : "p-12"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {previewUrls.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img src={url} alt={`Upload ${index + 1}`} className="w-full h-32 object-cover border-2 border-foreground" />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                              className="absolute top-2 right-2 w-8 h-8 bg-background border-4 border-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                          Add More Images
                        </Button>
                        {selectedProjectId && projects.find(p => p.id === selectedProjectId)?.brandAssets && projects.find(p => p.id === selectedProjectId)!.brandAssets!.length > 0 && (
                          <Button
                            variant="default"
                            className="flex-1 font-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBrandAssetSelector(true);
                            }}
                          >
                            Select from Brand Assets
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-20 h-20 border-4 border-foreground flex items-center justify-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-lg">Drop your images here or click to upload</p>
                        <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or WebP • Multiple images supported</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand Assets Button (when empty) */}
                {previewUrls.length === 0 && selectedProjectId && projects.find(p => p.id === selectedProjectId)?.brandAssets && projects.find(p => p.id === selectedProjectId)!.brandAssets!.length > 0 && (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      className="w-full font-bold"
                      onClick={() => setShowBrandAssetSelector(true)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Select from Brand Assets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-4 border-foreground">
              <CardHeader>
                <CardTitle className="text-lg">Select Project (Required)</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">
                  Choose a project to save generated assets. If the project has brand data, it will be used automatically.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingProjects ? (
                  <div className="flex items-center justify-center py-8">
                    <FalSpinner className="w-8 h-8" />
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        name={project.name}
                        description={project.description}
                        brandAssets={project.brandAssets}
                        selected={selectedProjectId === project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-2">
                      No projects found.
                    </p>
                    <Link href="/projects/new">
                      <Button variant="outline" size="sm">
                        Create Your First Project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-4 border-foreground">
              <CardHeader>
                <CardTitle className="text-lg">Content Goal</CardTitle>
                <p className="text-sm text-muted-foreground font-normal">
                  Choose what kind of content you’re trying to create. This changes the “critical instructions” used for prompts.
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <Select
                  value={creativeDirectionId}
                  onValueChange={(value) =>
                    setCreativeDirectionId(value as CreativeDirectionId)
                  }
                >
                  <SelectTrigger className="border-4 border-foreground/20 focus:border-foreground h-12">
                    <SelectValue placeholder="Select a content goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATIVE_DIRECTIONS.map((dir) => (
                      <SelectItem key={dir.id} value={dir.id}>
                        {dir.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {getCreativeDirection(creativeDirectionId).description}
                </p>
              </CardContent>
            </Card>

            <Card className="border-4 border-foreground">
              <CardHeader>
                <CardTitle className="text-lg">Custom Instruction (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={userInstruction}
                  onChange={(e) => setUserInstruction(e.target.value)}
                  className="border-4 border-foreground/20 focus:border-foreground h-12"
                  placeholder="e.g., Create vibrant, energetic assets"
                />
                <p className="text-xs text-muted-foreground mt-2">Optional instruction to guide generation</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Asset Configuration */}
          <div className="space-y-6">
            <Card className="border-4 border-foreground">
              <CardHeader>
                <CardTitle>Asset Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Aspect Ratios</p>
                  
                  {/* Portrait 9:16 */}
                  <div className="flex items-center justify-between p-3 border-2 border-foreground/20">
                    <div className="flex items-center gap-3">
                      <Badge className={getAspectRatioBadge('9:16')}>9:16</Badge>
                      <span className="text-sm">Portrait</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPortraitCount(num)}
                          className={cn(
                            "w-8 h-8 text-xs font-medium border-2 transition-all",
                            portraitCount === num
                              ? "bg-purple-500/20 text-purple-600 border-purple-600"
                              : "bg-muted text-muted-foreground border-foreground/20 hover:border-foreground/40"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portrait 3:4 */}
                  <div className="flex items-center justify-between p-3 border-2 border-foreground/20">
                    <div className="flex items-center gap-3">
                      <Badge className={getAspectRatioBadge('3:4')}>3:4</Badge>
                      <span className="text-sm">Portrait</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPortrait34Count(num)}
                          className={cn(
                            "w-8 h-8 text-xs font-medium border-2 transition-all",
                            portrait34Count === num
                              ? "bg-orange-500/20 text-orange-600 border-orange-600"
                              : "bg-muted text-muted-foreground border-foreground/20 hover:border-foreground/40"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Square 1:1 */}
                  <div className="flex items-center justify-between p-3 border-2 border-foreground/20">
                    <div className="flex items-center gap-3">
                      <Badge className={getAspectRatioBadge('1:1')}>1:1</Badge>
                      <span className="text-sm">Square</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setSquareCount(num)}
                          className={cn(
                            "w-8 h-8 text-xs font-medium border-2 transition-all",
                            squareCount === num
                              ? "bg-blue-500/20 text-blue-600 border-blue-600"
                              : "bg-muted text-muted-foreground border-foreground/20 hover:border-foreground/40"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Landscape 16:9 */}
                  <div className="flex items-center justify-between p-3 border-2 border-foreground/20">
                    <div className="flex items-center gap-3">
                      <Badge className={getAspectRatioBadge('16:9')}>16:9</Badge>
                      <span className="text-sm">Landscape</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setLandscapeCount(num)}
                          className={cn(
                            "w-8 h-8 text-xs font-medium border-2 transition-all",
                            landscapeCount === num
                              ? "bg-green-500/20 text-green-600 border-green-600"
                              : "bg-muted text-muted-foreground border-foreground/20 hover:border-foreground/40"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video 16:9 */}
                  <div className="flex items-center justify-between p-3 border-2 border-foreground/20">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-pink-500/10 text-pink-600 border-pink-600">16:9</Badge>
                      <span className="text-sm">Video</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setVideoCount(num)}
                          className={cn(
                            "w-8 h-8 text-xs font-medium border-2 transition-all",
                            videoCount === num
                              ? "bg-pink-500/20 text-pink-600 border-pink-600"
                              : "bg-muted text-muted-foreground border-foreground/20 hover:border-foreground/40"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Estimated Credits</p>
                  <p className="text-2xl font-bold">{estimatedCredits}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalAssets} images + {totalVideos} videos (5 credits each)
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isProcessing || uploadedImages.length === 0 || (totalAssets + totalVideos === 0) || !selectedProjectId}
                  className="w-full h-12 border-4 border-foreground font-bold uppercase"
                  size="lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <FalSpinner className="w-5 h-5" />
                      Generating...
                    </span>
                  ) : !selectedProjectId ? (
                    "Select a Project"
                  ) : (
                    "Generate Assets"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Processing/Results Section */}
      {currentPhase !== 'idle' && (
        <div className="space-y-6">
          {/* Progress */}
          {currentPhase !== 'completed' && (
            <Card className="border-4 border-foreground">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{progressMessage}</p>
                    <p className="text-sm text-muted-foreground">{progress}%</p>
                  </div>
                  <div className="w-full bg-muted h-4 border-2 border-foreground">
                    <div
                      className="h-full bg-foreground transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Assets */}
          {generatedAssets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Generated Assets</h2>
                {brandContext && !isProcessing && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSingleAssetDialog(true)}
                    className="border-4 border-foreground"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Asset
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className={cn(
                      "border-4 border-foreground",
                      asset.status === 'completed' && asset.type === 'image' && "cursor-pointer hover:border-primary transition-colors"
                    )}
                    onClick={() => {
                      if (asset.status === 'completed' && asset.type === 'image' && asset.url) {
                        setSelectedAsset(asset);
                        setShowAssetVariantDialog(true);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={getAspectRatioBadge(asset.aspectRatio)}>
                            {asset.aspectRatio}
                          </Badge>
                          <Badge variant={asset.status === 'completed' ? 'default' : 'secondary'}>
                            {asset.status}
                          </Badge>
                        </div>
                        <div className={cn(
                          "bg-muted border-2 border-foreground",
                          asset.aspectRatio === '9:16' && "aspect-[9/16]",
                          asset.aspectRatio === '3:4' && "aspect-[3/4]",
                          asset.aspectRatio === '1:1' && "aspect-square",
                          asset.aspectRatio === '16:9' && "aspect-video"
                        )}>
                          {asset.status === 'generating' ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <FalSpinner className="w-12 h-12" />
                            </div>
                          ) : asset.url ? (
                            asset.type === 'image' ? (
                              <img src={asset.url} alt="Generated asset" className="w-full h-full object-cover" />
                            ) : (
                              <video src={asset.url} controls className="w-full h-full" />
                            )
                          ) : null}
                        </div>
                        {asset.status === 'completed' && asset.type === 'image' && (
                          <p className="text-xs text-muted-foreground italic text-center">Click to create variants</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ad Copy Section */}
          {adCopy && Object.keys(adCopy).length > 0 && (
            <Card className="border-4 border-foreground">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">Generated Ad Copy</CardTitle>
                  {!isProcessing && brandContext && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAdCopyDialog(true)}
                      className="border-4 border-foreground"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Headline */}
                  {adCopy.headline && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-bold">Headline</p>
                      <p className="text-xl font-bold">{adCopy.headline}</p>
                    </div>
                  )}

                  {/* Tagline */}
                  {adCopy.tagline && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-bold">Tagline</p>
                      <p className="text-lg font-medium italic">{adCopy.tagline}</p>
                    </div>
                  )}

                  {/* Description */}
                  {adCopy.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-bold">Description</p>
                      <p className="text-sm leading-relaxed">{adCopy.description}</p>
                    </div>
                  )}

                  {/* CTA */}
                  {adCopy.cta && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-bold">Call to Action</p>
                      <Badge className="bg-primary text-primary-foreground border-none px-4 py-2 text-sm font-bold">
                        {adCopy.cta}
                      </Badge>
                    </div>
                  )}

                  {/* Hashtags */}
                  {adCopy.hashtags && adCopy.hashtags.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-bold">Hashtags</p>
                      <div className="flex flex-wrap gap-2">
                        {adCopy.hashtags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="border-2 border-foreground">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Social Media Captions */}
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Social Media Captions</p>

                    {adCopy.instagramCaption && (
                      <div className="p-4 bg-muted border-2 border-foreground">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-purple-600 text-white border-none text-xs">
                            Instagram
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{adCopy.instagramCaption}</p>
                      </div>
                    )}

                    {adCopy.facebookCaption && (
                      <div className="p-4 bg-muted border-2 border-foreground">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600 text-white border-none text-xs">
                            Facebook
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{adCopy.facebookCaption}</p>
                      </div>
                    )}

                    {adCopy.twitterCaption && (
                      <div className="p-4 bg-muted border-2 border-foreground">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-black text-white border-none text-xs">
                            Twitter/X
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{adCopy.twitterCaption}</p>
                      </div>
                    )}

                    {adCopy.linkedinCaption && (
                      <div className="p-4 bg-muted border-2 border-foreground">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-700 text-white border-none text-xs">
                            LinkedIn
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{adCopy.linkedinCaption}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reset Button */}
          {currentPhase === 'completed' && (
            <Button onClick={handleReset} className="w-full border-4 border-foreground">
              Start Over
            </Button>
          )}
        </div>
      )}

      {/* Single Asset Generation Dialog */}
      <Dialog open={showSingleAssetDialog} onOpenChange={setShowSingleAssetDialog}>
        <DialogContent className="border-4 border-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Single Asset</DialogTitle>
            <DialogDescription>Create a new asset with custom settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Asset Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider">Asset Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSingleAssetType('image')}
                  className={cn(
                    "h-12 border-4 transition-all text-sm font-bold",
                    singleAssetType === 'image'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-foreground/20 hover:border-foreground"
                  )}
                >
                  Image
                </button>
                <button
                  onClick={() => setSingleAssetType('video')}
                  className={cn(
                    "h-12 border-4 transition-all text-sm font-bold",
                    singleAssetType === 'video'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-foreground/20 hover:border-foreground"
                  )}
                >
                  Video
                </button>
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {(['9:16', '3:4', '1:1', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSingleAssetAspectRatio(ratio)}
                    className={cn(
                      "h-12 border-4 transition-all text-xs font-bold",
                      singleAssetAspectRatio === ratio
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-foreground/20 hover:border-foreground"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider">
                Custom Instruction <span className="text-muted-foreground">(Optional)</span>
              </label>
              <Input
                value={singleAssetInstruction}
                onChange={(e) => setSingleAssetInstruction(e.target.value)}
                className="border-4 border-foreground/20 focus:border-foreground h-12"
                placeholder="Leave empty to use brand context automatically"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSingleAssetDialog(false);
                  setSingleAssetInstruction("");
                }}
                className="flex-1 border-4"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSingleAssetDialog(false);
                  const instruction = singleAssetInstruction.trim() || undefined;
                  setSingleAssetInstruction("");
                  generateSingleAssetVariant(singleAssetType, singleAssetAspectRatio, instruction);
                }}
                className="flex-1"
              >
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset Variant Generation Dialog */}
      <Dialog open={showAssetVariantDialog} onOpenChange={setShowAssetVariantDialog}>
        <DialogContent className="border-4 border-foreground max-w-6xl">
          <DialogHeader>
            <DialogTitle>Asset Options</DialogTitle>
            <DialogDescription>Download or create a variant based on this image</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Left: Source Image Preview */}
            {selectedAsset && (
              <div className="space-y-4">
                <div className="relative bg-muted overflow-hidden border-4 border-foreground flex items-center justify-center min-h-[400px]">
                  <img
                    src={selectedAsset.url}
                    alt="Source"
                    className="max-w-full max-h-[600px] object-contain"
                  />
                  <Badge className={cn("absolute top-2 left-2 border-2 font-bold", getAspectRatioBadge('aspectRatio' in selectedAsset ? selectedAsset.aspectRatio : '16:9'))}>
                    {'aspectRatio' in selectedAsset ? selectedAsset.aspectRatio : '16:9'}
                  </Badge>
                </div>

                {/* Download Button */}
                <Button
                  onClick={async () => {
                    if (selectedAsset?.url) {
                      try {
                        const response = await fetch(selectedAsset.url);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `asset-${'aspectRatio' in selectedAsset ? selectedAsset.aspectRatio : 'image'}-${Date.now()}.png`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Download failed:', error);
                      }
                    }
                  }}
                  className="w-full h-12 border-4 border-foreground font-bold"
                  variant="outline"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </Button>
              </div>
            )}

            {/* Right: Variant Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Create Variant</h3>
                <p className="text-sm text-muted-foreground">Generate a new version with different settings</p>
              </div>

              {/* Asset Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider">Output Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVariantType('image')}
                    className={cn(
                      "h-12 border-4 transition-all text-sm font-bold",
                      variantType === 'image'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-foreground/20 hover:border-foreground"
                    )}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setVariantType('video')}
                    className={cn(
                      "h-12 border-4 transition-all text-sm font-bold",
                      variantType === 'video'
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-foreground/20 hover:border-foreground"
                    )}
                  >
                    Video
                  </button>
                </div>
              </div>

              {/* Aspect Ratio - only for images */}
              {variantType === 'image' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['9:16', '3:4', '1:1', '16:9'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setVariantAspectRatio(ratio)}
                        className={cn(
                          "h-12 border-4 transition-all text-xs font-bold",
                          variantAspectRatio === ratio
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted border-foreground/20 hover:border-foreground"
                        )}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Instruction */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider">
                  Custom Instruction <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  value={variantInstruction}
                  onChange={(e) => setVariantInstruction(e.target.value)}
                  className="border-4 border-foreground/20 focus:border-foreground h-12"
                  placeholder={variantType === 'video' ? "This image will be the starting frame" : "e.g., More dramatic lighting..."}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssetVariantDialog(false);
                    setSelectedAsset(null);
                    setVariantInstruction("");
                  }}
                  className="flex-1 border-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedAsset) {
                      setShowAssetVariantDialog(false);
                      const instruction = variantInstruction.trim() || undefined;
                      const aspectRatio = variantType === 'video' ? '16:9' : variantAspectRatio;
                      generateVariantFromAsset(selectedAsset, variantType, aspectRatio, instruction);
                      setSelectedAsset(null);
                      setVariantInstruction("");
                    }
                  }}
                  disabled={!selectedAsset}
                  className="flex-1"
                >
                  {variantType === 'video' ? 'Generate Video' : 'Generate Image'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="border-4 border-foreground max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Generation History</span>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-destructive hover:text-destructive border-2"
                >
                  Clear All
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>Click on any image to create a new variant from it</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="w-12 h-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted-foreground text-sm">No history yet</p>
                <p className="text-muted-foreground text-xs mt-1">Generated assets will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-muted/30 border-4 border-foreground/10 overflow-hidden cursor-pointer hover:border-foreground transition-colors"
                    onClick={() => item.type === 'IMAGE' && generateVariantFromHistory(item)}
                  >
                    <div className={cn(
                      "relative",
                      item.aspectRatio === '9:16' && "aspect-[9/16]",
                      item.aspectRatio === '3:4' && "aspect-[3/4]",
                      item.aspectRatio === '1:1' && "aspect-square",
                      item.aspectRatio === '16:9' && "aspect-video",
                      !item.aspectRatio && "aspect-video"
                    )}>
                      {item.type === 'VIDEO' ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} alt={item.prompt || ''} className="w-full h-full object-cover" />
                      )}
                      {/* Hover overlay for images */}
                      {item.type === 'IMAGE' && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-white/80 font-bold">Create Variant</span>
                          </div>
                        </div>
                      )}
                      <Badge className={cn("absolute top-2 left-2 border-2 font-bold", getAspectRatioBadge(item.aspectRatio))}>
                        {item.aspectRatio}
                      </Badge>
                      {item.type === 'VIDEO' && (
                        <Badge className="absolute top-2 right-2 bg-pink-500/10 text-pink-600 border-2 border-pink-600 font-bold">
                          Video
                        </Badge>
                      )}
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-background/90 border-4 border-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-3 border-t-4 border-foreground/10">
                      <p className="text-xs font-bold truncate">{item.prompt || 'No description'}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ad Copy Generation Dialog */}
      <Dialog open={showAdCopyDialog} onOpenChange={setShowAdCopyDialog}>
        <DialogContent className="border-4 border-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Ad Copy</DialogTitle>
            <DialogDescription>Create compelling advertising copy</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider">
                Custom Instruction <span className="text-muted-foreground">(Optional)</span>
              </label>
              <Input
                value={adCopyInstruction}
                onChange={(e) => setAdCopyInstruction(e.target.value)}
                className="border-4 border-foreground/20 focus:border-foreground h-12"
                placeholder="e.g., Focus on luxury and exclusivity"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdCopyDialog(false);
                  setAdCopyInstruction("");
                }}
                className="flex-1 border-4"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await generateAdCopy(adCopyInstruction || undefined);
                  setShowAdCopyDialog(false);
                  setAdCopyInstruction("");
                }}
                disabled={isProcessing}
                className="flex-1"
              >
                Generate Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Brand Asset Selector Dialog */}
      <BrandAssetSelector
        open={showBrandAssetSelector}
        onOpenChange={setShowBrandAssetSelector}
        brandAssets={
          selectedProjectId
            ? projects.find(p => p.id === selectedProjectId)?.brandAssets || []
            : []
        }
        onSelect={handleBrandAssetsSelected}
      />
    </div>
  );
}
