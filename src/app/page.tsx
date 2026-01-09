"use client";

import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import { fal } from "@fal-ai/client";
import { ApiKeyStatus, ApiKeyDialog } from "@/components/api-key-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckIcon,
  InfoIcon,
  DownloadIcon,
  ImageIcon,
  XMarkIcon,
  SparklesIcon,
  VideoCameraIcon,
  PlusIcon,
  ClockIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { useUserFalKey, getUserFalKey } from "@/lib/use-user-fal-key";
import { cn } from "@/lib/utils";
import {
  CREATIVE_DIRECTIONS,
  DEFAULT_CREATIVE_DIRECTION_ID,
  type CreativeDirectionId,
  getCreativeDirection,
  buildImageGenerationPrompt,
  buildVideoGenerationPrompt,
} from "@/lib/creative-direction";

// Fal AI Logo Component
function FalLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={cn(className)}
      style={style}
      width="32"
      height="32"
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
};

// History item type
type HistoryItem = {
  id: string;
  type: 'image' | 'video';
  aspectRatio: '9:16' | '3:4' | '1:1' | '16:9';
  description: string;
  url: string;
  timestamp: number;
  brandName?: string;
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
    description: "Analyzes the image to extract brand colors, mood, and subject matter to inform the creative brief. Also detects brand elements like name and logo presence.",
    parameters: {
      type: "object",
      properties: {
        colors: {
          type: "array",
          items: { type: "string" },
          description: "Hex codes of dominant brand colors found in the image.",
        },
        mood: {
          type: "string",
          description: "The emotional tone of the image (e.g., Energetic, Serene, Luxury, Minimalist).",
        },
        subject: {
          type: "string",
          description: "The main subject of the image.",
        },
        brandName: {
          type: "string",
          description: "The brand name visible in the image, or inferred from context.",
        },
        slogan: {
          type: "string",
          description: "A potential marketing slogan derived from the visual context.",
        },
        hasLogo: {
          type: "boolean",
          description: "Whether a distinct brand logo is detected in this image.",
        }
      },
      required: ["colors", "mood", "subject"],
    },
  },
};

const generateImageSpecsTool = {
  type: "function" as const,
  function: {
    name: "generate_asset_specs",
    description: "Determines the prompts and aspect ratios for diverse assets.",
    parameters: {
      type: "object",
      properties: {
        socialPrompts: {
          type: "array",
          items: { type: "string" },
          description: "3 creative prompts for 9:16 social media stories. NO TEXT in images.",
        },
        portrait34Prompts: {
          type: "array",
          items: { type: "string" },
          description: "3 creative prompts for 3:4 portrait images. NO TEXT in images.",
        },
        videoPrompts: {
          type: "array",
          items: { type: "string" },
          description: "3 cinematic prompts for 16:9 videos. All for Kling.",
        },
        squarePrompts: {
          type: "array",
          items: { type: "string" },
          description: "3 distinct prompts for 1:1 feed posts. NO TEXT in images.",
        },
        landscapePrompts: {
          type: "array",
          items: { type: "string" },
          description: "3 cinematic prompts for 16:9 landscape images. NO TEXT in images.",
        },
      },
      required: ["socialPrompts", "portrait34Prompts", "videoPrompts", "squarePrompts", "landscapePrompts"],
    },
  },
};

const generateAdCopyTool = {
  type: "function" as const,
  function: {
    name: "generate_ad_copy",
    description: "Generates comprehensive advertising copy including headlines, descriptions, CTAs, hashtags, and social media captions.",
    parameters: {
      type: "object",
      properties: {
        headline: {
          type: "string",
          description: "Main advertising headline - short, punchy, attention-grabbing (max 10 words).",
        },
        tagline: {
          type: "string",
          description: "Brand tagline or slogan - memorable and brand-aligned.",
        },
        description: {
          type: "string",
          description: "Main ad description - compelling product/service description (2-3 sentences).",
        },
        cta: {
          type: "string",
          description: "Call-to-action text - action-oriented (e.g., 'Shop Now', 'Learn More', 'Get Started').",
        },
        hashtags: {
          type: "array",
          items: { type: "string" },
          description: "Relevant hashtags for social media (5-8 hashtags).",
        },
        instagramCaption: {
          type: "string",
          description: "Instagram post caption - engaging, emoji-friendly, includes hashtags.",
        },
        facebookCaption: {
          type: "string",
          description: "Facebook post caption - professional, informative, engaging.",
        },
        twitterCaption: {
          type: "string",
          description: "Twitter/X post caption - concise, punchy, within character limit.",
        },
        linkedinCaption: {
          type: "string",
          description: "LinkedIn post caption - professional, B2B focused, thought-leadership tone.",
        },
      },
      required: ["headline", "description", "cta", "hashtags"],
    },
  },
};

const generateUniquePromptTool = {
  type: "function" as const,
  function: {
    name: "generate_unique_prompt",
    description: "Generates a unique, creative, and original prompt for asset generation. Each call must produce a completely different and innovative prompt.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "A unique, creative, and original prompt for generating the asset. Must be completely different from any previous prompts. Should be highly creative, visually stunning, and aligned with brand identity.",
        },
      },
      required: ["prompt"],
    },
  },
};

export default function AdAssetsGeneratorPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'analyzing' | 'generating' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [userInstruction, setUserInstruction] = useState("");
  // Aspect ratio counts
  const [portraitCount, setPortraitCount] = useState<number>(1); // 9:16
  const [portrait34Count, setPortrait34Count] = useState<number>(1); // 3:4
  const [squareCount, setSquareCount] = useState<number>(1); // 1:1
  const [landscapeCount, setLandscapeCount] = useState<number>(1); // 16:9
  const [videoCount, setVideoCount] = useState<number>(1); // 16:9 videos
  const [creativeDirectionId, setCreativeDirectionId] =
    useState<CreativeDirectionId>(DEFAULT_CREATIVE_DIRECTION_ID);
  const [brandContext, setBrandContext] = useState<{
    colors?: string[];
    mood?: string;
    subject?: string;
    brandName?: string;
  } | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { hasUserKey } = useUserFalKey();
  const [uploadedSourceUrls, setUploadedSourceUrls] = useState<string[]>([]);
  const [openaiClient, setOpenaiClient] = useState<OpenAI | null>(null);
  const [showSingleAssetDialog, setShowSingleAssetDialog] = useState(false);
  const [singleAssetType, setSingleAssetType] = useState<'image' | 'video'>('image');
  const [singleAssetAspectRatio, setSingleAssetAspectRatio] = useState<'9:16' | '3:4' | '1:1' | '16:9'>('16:9');
  const [singleAssetInstruction, setSingleAssetInstruction] = useState("");
  const [showAdCopyDialog, setShowAdCopyDialog] = useState(false);
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
  const [adCopyInstruction, setAdCopyInstruction] = useState("");
  const [isGeneratingAdCopy, setIsGeneratingAdCopy] = useState(false);
  // Asset variant modal state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetVariantDialog, setShowAssetVariantDialog] = useState(false);
  const [variantInstruction, setVariantInstruction] = useState("");
  const [variantAspectRatio, setVariantAspectRatio] = useState<'9:16' | '3:4' | '1:1' | '16:9'>('16:9');
  const [variantType, setVariantType] = useState<'image' | 'video'>('image');
  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ad-assets-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      }
    } catch (err) {
      console.error("Failed to load history from localStorage:", err);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('ad-assets-history', JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history to localStorage:", err);
    }
  }, [history]);

  // Initialize OpenAI client and configure fal
  useEffect(() => {
    const falKey = getUserFalKey();
    if (falKey) {
      // Configure fal client
      if (typeof fal.config === 'function') {
        fal.config({ credentials: falKey });
      }

      // Initialize OpenAI client
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
    }
  }, [hasUserKey]);

  // Helper to upload all source images once
  const uploadSourceImages = async (files: File[]): Promise<string[]> => {
    const falKey = getUserFalKey();
    if (!falKey) {
      throw new Error("FAL API key required for image upload");
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const base64 = await fileToBase64(file);
        const blob = base64ToBlob(base64);
        const url = await fal.storage.upload(blob);
        return url;
      } catch (e) {
        console.error("Failed to upload image to Fal storage:", e);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  };

  // Analyze image using Gemini 3 Pro
  const analyzeImage = async (base64Data: string): Promise<any> => {
    if (!openaiClient) {
      throw new Error("OpenAI client not initialized");
    }

    const model = "google/gemini-3-pro-preview";
    const imageUrl = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;

    try {
      const completion = await openaiClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and call the analyze_brand_identity function." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [analyzeBrandTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

      if (toolCall && 'function' in toolCall && toolCall.function.name === 'analyze_brand_identity') {
        return JSON.parse(toolCall.function.arguments);
      }

      // Fallback: try to extract from message content if no tool call
      const content = completion.choices[0]?.message?.content;
      if (content) {
        console.warn("No tool call, trying to parse from content");
        try {
          const parsed = JSON.parse(content);
          if (parsed.colors || parsed.mood || parsed.subject) {
            return parsed;
          }
        } catch {
          // Not JSON, continue to fallback
        }
      }

      console.warn("No tool call returned from analysis, using fallback");
      return { colors: ["#000000"], mood: "Modern", subject: "Unknown" };

    } catch (e) {
      console.error("Error in analyzeImage:", e);
      throw e;
    }
  };

  // Create specs using Gemini 3 Pro
  const createSpecs = async (context: any, userInstruction?: string, counts?: { portrait: number; portrait34: number; square: number; landscape: number; video: number }): Promise<any> => {
    if (!openaiClient) {
      throw new Error("OpenAI client not initialized");
    }

    const model = "google/gemini-3-pro-preview";
    const pCount = counts?.portrait ?? portraitCount;
    const p34Count = counts?.portrait34 ?? portrait34Count;
    const sCount = counts?.square ?? squareCount;
    const lCount = counts?.landscape ?? landscapeCount;
    const vCount = counts?.video ?? videoCount;
    const creativeDirection = getCreativeDirection(creativeDirectionId);

    let prompt = `Based on context: ${JSON.stringify(context)}, create:
    - ${pCount} prompts for social (9:16)
    - ${p34Count} prompts for portrait (3:4)
    - ${vCount} prompts for Video (16:9) [All for Kling]
    - ${sCount} prompts for Square (1:1)
    - ${lCount} prompts for Landscape (16:9)

    CONTENT GOAL: ${creativeDirection.label}
    ${creativeDirection.assetSpecGuidelines({ vCount })}

    Call generate_asset_specs.`;

    if (userInstruction) {
      prompt += `\n\nIMPORTANT USER INSTRUCTION: ${userInstruction}\nEnsure all prompts align with this instruction.`;
    }

    try {
      const completion = await openaiClient.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        tools: [generateImageSpecsTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

      if (toolCall && 'function' in toolCall && toolCall.function.name === 'generate_asset_specs') {
        return JSON.parse(toolCall.function.arguments);
      }

      // Fallback: try to extract from message content if no tool call
      const content = completion.choices[0]?.message?.content;
      if (content) {
        console.warn("No tool call for specs, trying to parse from content");
        try {
          const parsed = JSON.parse(content);
          if (parsed.socialPrompts || parsed.videoPrompts) {
            return parsed;
          }
        } catch {
          // Not JSON, continue to fallback
        }
      }

      console.warn("No tool call returned from specs generation, using fallback");
      // Fallback
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

  // Generate image asset
  const generateAsset = async (id: string, prompt: string, aspectRatio: Asset['aspectRatio'], sourceImageUrls: string[]) => {
    try {
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
        setGeneratedAssets(prev => prev.map(asset => {
          if (asset.id === id) {
            const updatedAsset = { ...asset, status: 'completed' as const, url: finalUrl };
            // Save to history
            saveToHistory(updatedAsset);
            return updatedAsset;
          }
          return asset;
        }));
      } else {
        throw new Error(`No image returned from Fal.`);
      }

    } catch (err: any) {
      console.error(err);
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  // Generate ad copy
  const generateAdCopy = async (customInstruction?: string, contextOverride?: typeof brandContext) => {
    const context = contextOverride || brandContext;

    if (!context) {
      setError("Please run initial generation first to analyze brand");
      return;
    }

    if (!openaiClient) {
      setError("OpenAI client not initialized");
      return;
    }

    setIsGeneratingAdCopy(true);

    const model = "google/gemini-3-pro-preview";
    const creativeDirection = getCreativeDirection(creativeDirectionId);

    let prompt = `Based on brand context: ${JSON.stringify(context)}, generate comprehensive advertising copy.

    Create:
    - A compelling headline (max 10 words, attention-grabbing)
    - A memorable tagline/slogan (brand-aligned)
    - A compelling description (2-3 sentences about the product/service)
    - A clear call-to-action (action-oriented)
    - Relevant hashtags (5-8 hashtags for social media)
    - Instagram caption (engaging, emoji-friendly, includes hashtags)
    - Facebook caption (professional, informative)
    - Twitter/X caption (concise, punchy, within character limit)
    - LinkedIn caption (professional, B2B focused)

    CRITICAL:
    - All copy must align with brand mood: ${context.mood}
    - Subject focus: ${context.subject}
    - Brand name: ${context.brandName || 'Brand'}
    - Tone should match the brand identity
    - Copy should be professional, engaging, and conversion-focused
    - Social media captions should be platform-appropriate
    
    Content goal: ${creativeDirection.label}
    ${creativeDirection.adCopyGuidelines}

    Call generate_ad_copy.`;

    if (customInstruction) {
      prompt += `\n\nIMPORTANT USER INSTRUCTION: ${customInstruction}\nEnsure all copy aligns with this instruction.`;
    }

    try {
      const completion = await openaiClient.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        tools: [generateAdCopyTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

      if (toolCall && 'function' in toolCall && toolCall.function.name === 'generate_ad_copy') {
        const adCopyResult = JSON.parse(toolCall.function.arguments);
        setAdCopy(adCopyResult);
        setShowAdCopyDialog(false);
        setAdCopyInstruction("");
      } else {
        // Fallback: try to extract from message content if no tool call
        const content = completion.choices[0]?.message?.content;
        if (content) {
          console.warn("No tool call for ad copy, trying to parse from content");
          try {
            const parsed = JSON.parse(content);
            if (parsed.headline || parsed.description) {
              setAdCopy(parsed);
              setShowAdCopyDialog(false);
              setAdCopyInstruction("");
              return;
            }
          } catch {
            // Not JSON, continue to fallback
          }
        }

        // Generate fallback ad copy
        console.warn("Using fallback ad copy");
        const fallbackAdCopy = {
          headline: `Discover ${context?.brandName || 'Excellence'}`,
          tagline: `${context?.mood || 'Premium'} Quality`,
          description: `Experience the ${context?.mood?.toLowerCase() || 'exceptional'} quality of ${context?.subject || 'our products'}. Crafted with care and designed for those who appreciate the finer things.`,
          cta: "Shop Now",
          hashtags: ["#premium", "#quality", "#lifestyle", "#brand", "#style"],
          instagramCaption: `✨ Discover ${context?.brandName || 'excellence'} ✨\n\n${context?.subject || 'Premium products'} that define ${context?.mood?.toLowerCase() || 'style'}.\n\n#premium #quality #lifestyle`,
          facebookCaption: `Introducing ${context?.brandName || 'our latest collection'}. ${context?.subject || 'Premium products'} crafted with exceptional attention to detail.`,
          twitterCaption: `Discover ${context?.mood?.toLowerCase() || 'premium'} ${context?.subject || 'quality'}. #NewArrivals`,
          linkedinCaption: `We're excited to present ${context?.brandName || 'our latest innovation'}. Setting new standards in ${context?.subject || 'quality and design'}.`,
        };
        setAdCopy(fallbackAdCopy);
        setShowAdCopyDialog(false);
        setAdCopyInstruction("");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate ad copy";
      setError(message);
      console.error("Ad copy generation error:", err);

      // Even on error, provide fallback ad copy
      const fallbackAdCopy = {
        headline: `Discover ${context?.brandName || 'Excellence'}`,
        tagline: `${context?.mood || 'Premium'} Quality`,
        description: `Experience exceptional quality. Crafted with care and designed for those who appreciate the finer things.`,
        cta: "Learn More",
        hashtags: ["#premium", "#quality", "#lifestyle"],
      };
      setAdCopy(fallbackAdCopy);
    } finally {
      setIsGeneratingAdCopy(false);
    }
  };

  // Generate unique prompt using AI
  const generateUniquePrompt = async (type: Asset['type'], aspectRatio: Asset['aspectRatio']): Promise<string> => {
    if (!openaiClient || !brandContext) {
      throw new Error("OpenAI client or brand context not initialized");
    }

    const model = "google/gemini-3-pro-preview";
    const assetType = type === 'video' ? 'video' : 'image';
    const aspectRatioText = aspectRatio === '9:16' ? 'vertical (9:16)' : aspectRatio === '1:1' ? 'square (1:1)' : 'landscape (16:9)';
    const creativeDirection = getCreativeDirection(creativeDirectionId);

    const prompt = `Based on brand context: ${JSON.stringify(brandContext)}, generate a UNIQUE, CREATIVE, and ORIGINAL prompt for generating a ${assetType} asset.

    Requirements:
    - Aspect ratio: ${aspectRatioText}
    - Asset type: ${assetType}
    - Brand mood: ${brandContext.mood}
    - Subject: ${brandContext.subject}
    - Brand name: ${brandContext.brandName || 'Brand'}
    - Content goal: ${creativeDirection.label}
    ${creativeDirection.assetSpecGuidelines({ vCount: videoCount })}
    
    CRITICAL:
    - This prompt MUST be completely unique and different from any previous prompts
    - Must be EXTREMELY creative, visually stunning, and innovative
    - ABSOLUTELY NO TEXT IN IMAGES
    - Must align with brand identity but be fresh and original
    - Each generation should feel like a completely new creative concept
    
    Generate a SINGLE, unique prompt that is creative, original, and aligned with the brand.
    Call generate_unique_prompt.`;

    try {
      const completion = await openaiClient.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        tools: [generateUniquePromptTool],
        tool_choice: "required",
      });

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

      if (toolCall && 'function' in toolCall && toolCall.function.name === 'generate_unique_prompt') {
        const result = JSON.parse(toolCall.function.arguments);
        return result.prompt;
      }

      // Fallback: try to extract from message content if no tool call
      const content = completion.choices[0]?.message?.content;
      if (content) {
        console.warn("No tool call for unique prompt, trying to parse from content");
        try {
          const parsed = JSON.parse(content);
          if (parsed.prompt) {
            return parsed.prompt;
          }
        } catch {
          // Not JSON, maybe plain text prompt
          if (content.length > 20 && content.length < 500) {
            return content.trim();
          }
        }
      }

      // Fallback to a timestamped unique prompt
      const timestamp = Date.now();
      if (type === 'video') {
        return `Cinematic ${brandContext.subject} showcase, ${brandContext.mood} atmosphere, dynamic camera movement, creative lighting, unique composition ${timestamp}, 4k quality, award-winning cinematography.`;
      } else {
        return `Creative ${creativeDirection.label} concept, ${brandContext.subject}, ${brandContext.mood} mood, unique composition ${timestamp}, professional quality, visually stunning.`;
      }
    } catch (err) {
      console.error("Unique prompt generation error:", err);
      // Fallback to a timestamped unique prompt
      const timestamp = Date.now();
      if (type === 'video') {
        return `Cinematic ${brandContext.subject} showcase, ${brandContext.mood} atmosphere, dynamic camera movement, creative lighting, unique composition ${timestamp}, 4k quality, award-winning cinematography.`;
      } else {
        return `Creative ${creativeDirection.label} concept, ${brandContext.subject}, ${brandContext.mood} mood, unique composition ${timestamp}, professional quality, visually stunning.`;
      }
    }
  };

  // Generate single asset variant
  const generateSingleAssetVariant = async (type: Asset['type'], aspectRatio: Asset['aspectRatio'], customInstruction?: string) => {
    if (!brandContext) {
      setError("Please run initial generation first to analyze brand");
      return;
    }

    if (uploadedSourceUrls.length === 0) {
      setError("No source images available");
      return;
    }

    if (!openaiClient) {
      setError("OpenAI client not initialized");
      return;
    }

    const id = `${type}-${aspectRatio}-${Date.now()}`;

    // Add skeleton asset immediately with placeholder description
    const placeholderDescription = customInstruction || `Generating ${type === 'video' ? 'video' : 'image'}...`;
    const newAsset: Asset = {
      id,
      type,
      aspectRatio,
      status: 'generating',
      description: placeholderDescription,
      url: ''
    };

    setGeneratedAssets(prev => [...prev, newAsset]);

    // Generate unique prompt in background and then generate asset
    try {
      let prompt = "";

      if (customInstruction) {
        prompt = customInstruction;
      } else {
        // Generate unique prompt using AI
        try {
          prompt = await generateUniquePrompt(type, aspectRatio);
        } catch (err) {
          console.error("Failed to generate unique prompt:", err);
          // Fallback with timestamp for uniqueness
          const timestamp = Date.now();
          if (type === 'video') {
            prompt = `Cinematic ${brandContext.subject} showcase, ${brandContext.mood} atmosphere, dynamic camera movement, creative lighting, unique composition ${timestamp}, 4k quality.`;
          } else {
            const creativeDirection = getCreativeDirection(creativeDirectionId);
            prompt = `Creative ${creativeDirection.label} concept, ${brandContext.subject}, ${brandContext.mood} mood, unique composition ${timestamp}, professional quality.`;
          }
        }
      }

      // Update asset description with actual prompt
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, description: prompt } : asset
      ));

      if (type === 'video') {
        await generateVideoWorkflow(id, prompt, uploadedSourceUrls);
      } else {
        await generateAsset(id, prompt, aspectRatio, uploadedSourceUrls);
      }
    } catch (err) {
      console.error("Single asset generation error:", err);
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  // Generate video workflow
  const generateVideoWorkflow = async (id: string, prompt: string, sourceImageUrls: string[]) => {
    try {
      setProgressMessage(`Generating video keyframe...`);

      // 1. Generate keyframe
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

      if (!imageUrl) throw new Error(`Failed to generate keyframe.`);

      // 2. Generate Video with Kling 2.6
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
        setGeneratedAssets(prev => prev.map(asset => {
          if (asset.id === id) {
            const updatedAsset = { ...asset, status: 'completed' as const, url: videoUrl };
            // Save to history
            saveToHistory(updatedAsset);
            return updatedAsset;
          }
          return asset;
        }));
      } else {
        console.error('Kling result structure:', JSON.stringify(result, null, 2));
        throw new Error(`No video returned from Kling.`);
      }

    } catch (err: any) {
      console.error(err);
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  // Generate variant from existing asset
  const generateVariantFromAsset = async (sourceAsset: Asset, type: 'image' | 'video', aspectRatio: Asset['aspectRatio'], customInstruction?: string) => {
    if (!sourceAsset.url) {
      setError("Source asset has no URL");
      return;
    }

    const id = `${type}-${aspectRatio}-variant-${Date.now()}`;
    const placeholderDescription = customInstruction || `Generating ${type === 'video' ? 'video' : 'image'} variant...`;

    const newAsset: Asset = {
      id,
      type,
      aspectRatio,
      status: 'generating',
      description: placeholderDescription,
      url: ''
    };

    setGeneratedAssets(prev => [...prev, newAsset]);

    try {
      let prompt = "";

      if (customInstruction) {
        prompt = customInstruction;
      } else if (brandContext) {
        // Generate unique prompt using AI
        try {
          prompt = await generateUniquePrompt(type, aspectRatio);
        } catch (err) {
          console.error("Failed to generate unique prompt:", err);
          const timestamp = Date.now();
          if (type === 'video') {
            prompt = `Cinematic ${brandContext.subject} showcase, ${brandContext.mood} atmosphere, dynamic camera movement, creative lighting, unique composition ${timestamp}, 4k quality.`;
          } else {
            const creativeDirection = getCreativeDirection(creativeDirectionId);
            prompt = `Creative ${creativeDirection.label} concept, ${brandContext.subject}, ${brandContext.mood} mood, unique composition ${timestamp}, professional quality.`;
          }
        }
      } else {
        const creativeDirection = getCreativeDirection(creativeDirectionId);
        prompt = `Creative variant for ${creativeDirection.label}, unique composition ${Date.now()}`;
      }

      // Update asset description with actual prompt
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, description: prompt } : asset
      ));

      if (type === 'video') {
        // For video, use source image as keyframe
        try {
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
            onQueueUpdate: (update) => {
              if (update.status === "IN_PROGRESS") {
                update.logs.map((log: any) => log.message).forEach(console.log);
              }
            },
          });

          const video = result.video || result.data?.video;
          const videoUrl = video?.url || result.data?.url || result.url;

          if (videoUrl) {
            setGeneratedAssets(prev => prev.map(asset => {
              if (asset.id === id) {
                const updatedAsset = { ...asset, status: 'completed' as const, url: videoUrl };
                saveToHistory(updatedAsset);
                return updatedAsset;
              }
              return asset;
            }));
          } else {
            throw new Error(`No video returned from Kling.`);
          }
        } catch (err) {
          console.error("Video variant generation error:", err);
          setGeneratedAssets(prev => prev.map(asset =>
            asset.id === id ? { ...asset, status: 'failed' } : asset
          ));
        }
      } else {
        // For image, use source image for img2img style generation
        try {
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
            setGeneratedAssets(prev => prev.map(asset => {
              if (asset.id === id) {
                const updatedAsset = { ...asset, status: 'completed' as const, url: finalUrl };
                saveToHistory(updatedAsset);
                return updatedAsset;
              }
              return asset;
            }));
          } else {
            throw new Error(`No image returned from Fal.`);
          }
        } catch (err) {
          console.error("Image variant generation error:", err);
          setGeneratedAssets(prev => prev.map(asset =>
            asset.id === id ? { ...asset, status: 'failed' } : asset
          ));
        }
      }
    } catch (err) {
      console.error("Variant generation error:", err);
      setGeneratedAssets(prev => prev.map(asset =>
        asset.id === id ? { ...asset, status: 'failed' } : asset
      ));
    }
  };

  // Handle asset click to open variant dialog
  const handleAssetClick = (asset: Asset) => {
    if (asset.status === 'completed' && asset.url && asset.type === 'image') {
      setSelectedAsset(asset);
      setVariantAspectRatio(asset.aspectRatio);
      setVariantType('image');
      setVariantInstruction("");
      setShowAssetVariantDialog(true);
    }
  };

  const handleGenerate = async () => {
    if (!hasUserKey) {
      setError("Please configure your FAL API key to use this feature");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Uploading images...");
    setError(null);
    setCurrentPhase('analyzing');
    setBrandContext(null);
    setGeneratedAssets([]);

    try {
      // Phase 1: Upload images
      setProgressMessage("Uploading source assets to secure storage...");
      setProgress(10);
      const uploadedUrls = await uploadSourceImages(uploadedImages);
      setUploadedSourceUrls(uploadedUrls);

      if (uploadedUrls.length === 0) {
        throw new Error("Failed to upload source images.");
      }

      // Phase 2: Analyze brand
      setProgressMessage("Analyzing brand identity...");
      setProgress(20);
      const primaryImageBase64 = await fileToBase64(uploadedImages[0]);
      const analysisResult = await analyzeImage(primaryImageBase64);

      if (!analysisResult) throw new Error("Failed to analyze image");

      setBrandContext(analysisResult);
      setProgress(30);

      // Phase 3: Create specs
      setProgressMessage("Formulating cross-platform strategy...");
      setProgress(40);
      const counts = { portrait: portraitCount, portrait34: portrait34Count, square: squareCount, landscape: landscapeCount, video: videoCount };
      const specs = await createSpecs({ mood: analysisResult.mood, subject: analysisResult.subject }, userInstruction, counts);

      // Phase 4: Generate assets
      setCurrentPhase('generating');
      setProgressMessage("Generating assets...");
      setProgress(50);

      const pendingTasks: Array<() => Promise<void>> = [];
      const assets: Asset[] = [];

      // Social (9:16) - portraitCount Assets
      if (portraitCount > 0) {
        specs.socialPrompts.slice(0, portraitCount).forEach((prompt: string, i: number) => {
          const id = `image-9:16-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '9:16', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '9:16', uploadedUrls));
        });
      }

      // Portrait (3:4) - portrait34Count Assets
      if (portrait34Count > 0) {
        const portrait34Prompts = specs.portrait34Prompts || Array(portrait34Count).fill("Elegant portrait product shot");
        portrait34Prompts.slice(0, portrait34Count).forEach((prompt: string, i: number) => {
          const id = `image-3:4-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '3:4', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '3:4', uploadedUrls));
        });
      }

      // Square (1:1) - squareCount Assets
      if (squareCount > 0) {
        specs.squarePrompts.slice(0, squareCount).forEach((prompt: string, i: number) => {
          const id = `image-1:1-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '1:1', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '1:1', uploadedUrls));
        });
      }

      // Landscape (16:9) - landscapeCount Assets
      if (landscapeCount > 0) {
        const landscapePrompts = specs.landscapePrompts || Array(landscapeCount).fill("Cinematic product shot");
        landscapePrompts.slice(0, landscapeCount).forEach((prompt: string, i: number) => {
          const id = `image-16:9-${Date.now()}-${i}`;
          assets.push({ id, type: 'image', aspectRatio: '16:9', status: 'generating', description: prompt, url: '' });
          pendingTasks.push(() => generateAsset(id, prompt, '16:9', uploadedUrls));
        });
      }

      // Video Workflow (16:9) - videoCount Assets (All Kling)
      if (videoCount > 0) {
        const videoPrompts = specs.videoPrompts || Array(videoCount).fill("Cinematic wide shot");
        videoPrompts.slice(0, videoCount).forEach((prompt: string, i: number) => {
          const id = `video-16:9-${Date.now()}-${i}`;
          const description = `[Kling] ${prompt}`;
          assets.push({ id, type: 'video', aspectRatio: '16:9', status: 'generating', description: description, url: '' });
          pendingTasks.push(() => generateVideoWorkflow(id, prompt, uploadedUrls));
        });
      }

      setGeneratedAssets(assets);
      setProgress(60);

      // Execute all tasks in parallel
      await Promise.all(pendingTasks.map(task => task()));

      // Phase 5: Auto-generate ad copy
      setIsGeneratingAdCopy(true);
      try {
        await generateAdCopy(userInstruction || undefined, analysisResult);
      } catch (err) {
        console.error("Auto ad copy generation error:", err);
        // Don't fail the whole process if ad copy fails
      } finally {
        setIsGeneratingAdCopy(false);
      }

      setCurrentPhase('completed');
      setProgress(100);
      setProgressMessage("All assets generated successfully!");

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate assets";
      setError(message);
      console.error("Generation error:", err);
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

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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

  const getAspectRatioBadge = (ratio: string) => {
    const colors: Record<string, string> = {
      '9:16': 'bg-purple-500/10 text-purple-400/80 border-purple-500/20',
      '3:4': 'bg-orange-500/10 text-orange-400/80 border-orange-500/20',
      '1:1': 'bg-blue-500/10 text-blue-400/80 border-blue-500/20',
      '16:9': 'bg-green-500/10 text-green-400/80 border-green-500/20',
    };
    return colors[ratio] || 'bg-white/5 text-white/60 border-white/10';
  };

  // Save asset to history
  const saveToHistory = (asset: Asset) => {
    if (asset.status === 'completed' && asset.url) {
      const historyItem: HistoryItem = {
        id: `history-${Date.now()}-${Math.random()}`,
        type: asset.type,
        aspectRatio: asset.aspectRatio,
        description: asset.description,
        url: asset.url,
        timestamp: Date.now(),
        brandName: brandContext?.brandName,
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 100)); // Keep max 100 items
    }
  };

  // Delete history item
  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
  };

  // Generate variant from history item
  const generateVariantFromHistory = (historyItem: HistoryItem) => {
    const mockAsset: Asset = {
      id: historyItem.id,
      type: historyItem.type,
      aspectRatio: historyItem.aspectRatio,
      status: 'completed',
      description: historyItem.description,
      url: historyItem.url,
    };
    setSelectedAsset(mockAsset);
    setVariantAspectRatio(historyItem.aspectRatio);
    setVariantType('image');
    setVariantInstruction("");
    setShowAssetVariantDialog(true);
    setShowHistory(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[#050505] dark:bg-[#050505]">
        {/* Header */}
        <header className="border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-md flex-shrink-0 z-50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-between h-14">
              {/* Left - Logo */}
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <FalLogo className="w-8 h-8 transition-transform duration-300 hover:scale-110" style={{ color: '#e7083e' }} />
                <div className="h-6 w-px bg-white/10" />
                <span className="text-sm font-semibold text-white/90 tracking-wide">Ad Assets Generator</span>
              </a>

              {/* Right - API Settings & Info */}
              <div className="flex items-center gap-3">
                {/* History Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-white/60 hover:text-white rounded-none border border-white/10 hover:border-white/20"
                >
                  <ClockIcon className="w-4 h-4 mr-2" />
                  History
                  {history.length > 0 && (
                    <Badge size="xs" className="ml-2 bg-white/10 text-white/70 border-none rounded-full">
                      {history.length}
                    </Badge>
                  )}
                </Button>
                <ApiKeyStatus />
                <ApiKeyDialog />
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="w-4 h-4 text-white/30 hover:text-white/50 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      {hasUserKey
                        ? "Using your API key - unlimited access"
                        : "API key required for this feature"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-10">
            <div className="space-y-10">
            {/* Upload & Generate Section */}
            {currentPhase === 'idle' && (
              <div className="grid grid-cols-2 gap-6 border border-white/[0.08] bg-[#0a0a0a] min-h-[600px]">
                {/* Left Column: Settings */}
                <div className="p-8 border-r border-white/[0.08] flex flex-col">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                        Generation Settings
                      </h2>
                      <p className="text-white/40 text-sm">
                        Configure asset generation parameters
                      </p>
                    </div>

                    {/* Aspect Ratio Counts */}
                    <div className="space-y-4">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" style={{ color: '#e7083e' }} />
                        Assets per Aspect Ratio
                      </label>

                      {/* Portrait 9:16 */}
                      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Badge size="xs" className="bg-purple-500/10 text-purple-400/80 border-purple-500/20 rounded-none">9:16</Badge>
                          <span className="text-sm text-white/70">Portrait</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              onClick={() => setPortraitCount(num)}
                              className={cn(
                                "w-8 h-8 text-xs font-medium transition-all rounded-none",
                                portraitCount === num
                                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                  : "bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Portrait 3:4 */}
                      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Badge size="xs" className="bg-orange-500/10 text-orange-400/80 border-orange-500/20 rounded-none">3:4</Badge>
                          <span className="text-sm text-white/70">Portrait</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              onClick={() => setPortrait34Count(num)}
                              className={cn(
                                "w-8 h-8 text-xs font-medium transition-all rounded-none",
                                portrait34Count === num
                                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                  : "bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Square 1:1 */}
                      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Badge size="xs" className="bg-blue-500/10 text-blue-400/80 border-blue-500/20 rounded-none">1:1</Badge>
                          <span className="text-sm text-white/70">Square</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              onClick={() => setSquareCount(num)}
                              className={cn(
                                "w-8 h-8 text-xs font-medium transition-all rounded-none",
                                squareCount === num
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Landscape 16:9 */}
                      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Badge size="xs" className="bg-green-500/10 text-green-400/80 border-green-500/20 rounded-none">16:9</Badge>
                          <span className="text-sm text-white/70">Landscape</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              onClick={() => setLandscapeCount(num)}
                              className={cn(
                                "w-8 h-8 text-xs font-medium transition-all rounded-none",
                                landscapeCount === num
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Video 16:9 */}
                      <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <Badge size="xs" className="bg-pink-500/10 text-pink-400/80 border-pink-500/20 rounded-none flex items-center gap-1">
                            <VideoCameraIcon className="w-3 h-3" />
                            16:9
                          </Badge>
                          <span className="text-sm text-white/70">Video</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3].map((num) => (
                            <button
                              key={num}
                              onClick={() => setVideoCount(num)}
                              className={cn(
                                "w-8 h-8 text-xs font-medium transition-all rounded-none",
                                videoCount === num
                                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                                  : "bg-white/[0.03] text-white/50 border border-white/[0.08] hover:bg-white/[0.06]"
                              )}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-white/30">
                        Total: {portraitCount + portrait34Count + squareCount + landscapeCount} images, {videoCount} videos
                      </p>
                    </div>

                    {/* Content Goal */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <SparklesIcon className="w-3.5 h-3.5" style={{ color: "#e7083e" }} />
                        Content Goal
                      </label>
                      <Select
                        value={creativeDirectionId}
                        onValueChange={(value) =>
                          setCreativeDirectionId(value as CreativeDirectionId)
                        }
                      >
                        <SelectTrigger className="h-12 bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.06] hover:border-white/[0.12] focus:bg-white/[0.06] transition-all duration-200 rounded-none">
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
                      <p className="text-[10px] text-white/30">
                        {getCreativeDirection(creativeDirectionId).description}
                      </p>
                    </div>

                    {/* User Instruction */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
                        <SparklesIcon className="w-3.5 h-3.5" style={{ color: '#e7083e' }} />
                        Custom Instruction (Optional)
                      </label>
                      <Input
                        value={userInstruction}
                        onChange={(e) => setUserInstruction(e.target.value)}
                        className="h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 hover:bg-white/[0.06] hover:border-white/[0.12] focus:bg-white/[0.06] transition-all duration-200 rounded-none"
                        placeholder="e.g., Create vibrant, energetic assets"
                      />
                      <p className="text-[10px] text-white/30">
                        Optional instruction to guide asset generation
                      </p>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-4">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full h-14 text-sm font-semibold uppercase tracking-wider rounded-none",
                          "text-white",
                          "transition-all duration-300 ease-out",
                          "disabled:opacity-40 disabled:cursor-not-allowed"
                        )}
                        style={{ backgroundColor: '#e7083e' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#d00735'}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#e7083e'}
                        onClick={handleGenerate}
                        disabled={isProcessing || uploadedImages.length === 0 || !hasUserKey || (portraitCount + portrait34Count + squareCount + landscapeCount + videoCount === 0)}
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-3">
                            <FalSpinner className="w-5 h-5" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <SparklesIcon className="w-5 h-5" />
                            Generate Assets
                          </span>
                        )}
                      </Button>
                      {!hasUserKey && (
                        <p className="text-xs text-red-400/80 mt-2 text-center">
                          API key required - Configure in settings
                        </p>
                      )}
                      {hasUserKey && (portraitCount + portrait34Count + squareCount + landscapeCount + videoCount === 0) && (
                        <p className="text-xs text-yellow-400/80 mt-2 text-center">
                          Select at least one asset to generate
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Upload Area */}
                <div className="p-8 flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
                        Upload Images
                      </h2>
                      <p className="text-white/40 text-sm">
                        Drag & drop or click to select brand images
                      </p>
                    </div>

                    {/* Upload Zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={cn(
                        "flex-1 relative border-2 border-dashed rounded-none transition-all duration-300 min-h-[400px]",
                        isDragging
                          ? "scale-[1.01]"
                          : "border-white/20 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]",
                        previewUrls.length > 0 && "border-white/10 bg-white/[0.01]"
                      )}
                      style={isDragging ? { borderColor: '#e7083e', backgroundColor: 'rgba(231, 8, 62, 0.1)' } : {}}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="file-upload"
                      />
                      
                      {previewUrls.length > 0 ? (
                        <div className="h-full flex flex-col p-4 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-40 object-contain rounded border border-white/10 bg-black/20"
                                />
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <XMarkIcon className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            className="text-white/40 hover:text-white/60 rounded-none mt-auto"
                          >
                            Add More Images
                          </Button>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center p-8">
                          <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2" style={{ backgroundColor: 'rgba(231, 8, 62, 0.1)', borderColor: 'rgba(231, 8, 62, 0.2)' }}>
                              <ImageIcon className="w-10 h-10" style={{ color: '#e7083e' }} />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-white">
                                Drop your images here
                              </p>
                              <p className="text-sm text-white/40">
                                or click to browse
                              </p>
                              <p className="text-xs text-white/30 mt-4">
                                Supports JPG, PNG, WEBP
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processing/Results View */}
            {(currentPhase === 'analyzing' || currentPhase === 'generating' || currentPhase === 'completed') && (
              <div className="space-y-6">
                {/* Progress Bar */}
                {(currentPhase === 'analyzing' || currentPhase === 'generating') && (
                  <div className="border border-white/[0.08] bg-[#0a0a0a] p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{progressMessage}</p>
                        <p className="text-xs text-white/40 font-mono">{progress}%</p>
                      </div>
                      <div className="h-2 bg-white/[0.08] overflow-hidden rounded-full">
                        <div
                          className="h-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%`, backgroundColor: '#e7083e' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand Context */}
                {(brandContext || isProcessing) && (
                  <Card className="bg-[#0a0a0a] border-white/[0.06] rounded-none">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold text-white mb-4">Brand Analysis</h3>
                      {brandContext ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {brandContext.colors && (
                            <div>
                              <p className="text-xs text-white/50 mb-2">Colors</p>
                              <div className="flex gap-2">
                                {brandContext.colors.map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-8 h-8 rounded border border-white/10"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {brandContext.mood && (
                            <div>
                              <p className="text-xs text-white/50 mb-2">Mood</p>
                              <p className="text-sm text-white">{brandContext.mood}</p>
                            </div>
                          )}
                          {brandContext.subject && (
                            <div>
                              <p className="text-xs text-white/50 mb-2">Subject</p>
                              <p className="text-sm text-white">{brandContext.subject}</p>
                            </div>
                          )}
                          {brandContext.brandName && (
                            <div>
                              <p className="text-xs text-white/50 mb-2">Brand</p>
                              <p className="text-sm text-white">{brandContext.brandName}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-white/50 mb-2">Colors</p>
                            <div className="flex gap-2">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded border border-white/10 bg-white/[0.05] animate-pulse" />
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-white/50 mb-2">Mood</p>
                            <div className="h-5 w-32 bg-white/[0.1] rounded-none animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs text-white/50 mb-2">Subject</p>
                            <div className="h-5 w-40 bg-white/[0.1] rounded-none animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs text-white/50 mb-2">Brand</p>
                            <div className="h-5 w-24 bg-white/[0.1] rounded-none animate-pulse" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Ad Copy and Assets Layout */}
                {(adCopy || isGeneratingAdCopy || generatedAssets.length > 0 || isProcessing) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ad Copy Section - Left */}
                    <div>
                      <Card className="bg-[#0a0a0a] border-white/[0.06] rounded-none">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <SparklesIcon className="w-5 h-5" style={{ color: '#e7083e' }} />
                              Ad Copy
                            </h3>
                            {brandContext && adCopy && !isProcessing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAdCopyDialog(true)}
                                className="text-white/60 hover:text-white rounded-none border border-white/10 hover:border-white/20"
                                disabled={!hasUserKey}
                              >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Regenerate
                              </Button>
                            )}
                          </div>

                          {(isGeneratingAdCopy || (isProcessing && !adCopy)) ? (
                              <div className="space-y-6">
                                {/* Skeleton Loaders */}
                                <div className="space-y-2">
                                  <div className="h-3 w-20 bg-white/[0.1] rounded-none animate-pulse" />
                                  <div className="h-6 w-full bg-white/[0.1] rounded-none animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                  <div className="h-3 w-16 bg-white/[0.1] rounded-none animate-pulse" />
                                  <div className="h-5 w-3/4 bg-white/[0.1] rounded-none animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                  <div className="h-3 w-24 bg-white/[0.1] rounded-none animate-pulse" />
                                  <div className="h-16 w-full bg-white/[0.1] rounded-none animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                  <div className="h-3 w-32 bg-white/[0.1] rounded-none animate-pulse" />
                                  <div className="h-8 w-32 bg-white/[0.1] rounded-none animate-pulse" />
                                </div>
                                <Separator className="bg-white/[0.06]" />
                                <div className="space-y-4">
                                  <div className="h-3 w-40 bg-white/[0.1] rounded-none animate-pulse" />
                                  {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-none">
                                      <div className="h-4 w-20 bg-white/[0.1] rounded-none animate-pulse mb-2" />
                                      <div className="h-12 w-full bg-white/[0.1] rounded-none animate-pulse" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : adCopy && (
                              <div className="space-y-6">
                                {/* Headline */}
                                {adCopy.headline && (
                                  <div>
                                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Headline</p>
                                    <p className="text-xl font-bold text-white">{adCopy.headline}</p>
                                  </div>
                                )}

                                {/* Tagline */}
                                {adCopy.tagline && (
                                  <div>
                                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Tagline</p>
                                    <p className="text-lg font-medium text-white/90 italic">{adCopy.tagline}</p>
                                  </div>
                                )}

                                {/* Description */}
                                {adCopy.description && (
                                  <div>
                                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Description</p>
                                    <p className="text-sm text-white/80 leading-relaxed">{adCopy.description}</p>
                                  </div>
                                )}

                                {/* CTA */}
                                {adCopy.cta && (
                                  <div>
                                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Call to Action</p>
                                    <Badge className="bg-[#e7083e] text-white border-none rounded-none px-4 py-2 text-sm font-semibold">
                                      {adCopy.cta}
                                    </Badge>
                                  </div>
                                )}

                                {/* Hashtags */}
                                {adCopy.hashtags && adCopy.hashtags.length > 0 && (
                                  <div>
                                    <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Hashtags</p>
                                    <div className="flex flex-wrap gap-2">
                                      {adCopy.hashtags.map((tag, i) => (
                                        <Badge key={i} className="bg-white/[0.05] text-white/70 border-white/[0.1] rounded-none">
                                          #{tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <Separator className="bg-white/[0.06]" />

                                {/* Social Media Captions */}
                                <div className="space-y-4">
                                  <p className="text-xs text-white/50 uppercase tracking-wider">Social Media Captions</p>

                                  {adCopy.instagramCaption && (
                                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-none">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-purple-600 text-white border-none rounded-none text-xs">
                                          Instagram
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-white/80 whitespace-pre-wrap">{adCopy.instagramCaption}</p>
                                    </div>
                                  )}

                                  {adCopy.facebookCaption && (
                                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-none">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-blue-600 text-white border-none rounded-none text-xs">
                                          Facebook
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-white/80 whitespace-pre-wrap">{adCopy.facebookCaption}</p>
                                    </div>
                                  )}

                                  {adCopy.twitterCaption && (
                                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-none">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-black text-white border-none rounded-none text-xs">
                                          Twitter/X
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-white/80 whitespace-pre-wrap">{adCopy.twitterCaption}</p>
                                    </div>
                                  )}

                                  {adCopy.linkedinCaption && (
                                    <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-none">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-blue-700 text-white border-none rounded-none text-xs">
                                          LinkedIn
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-white/80 whitespace-pre-wrap">{adCopy.linkedinCaption}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                    </div>

                    {/* Generated Assets Grid - Right */}
                    <div>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Generated Assets</h3>
                          <div className="flex items-center gap-2">
                            {brandContext && !isProcessing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSingleAssetDialog(true)}
                                className="text-white/60 hover:text-white rounded-none border border-white/10 hover:border-white/20"
                                disabled={!hasUserKey}
                              >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Asset
                              </Button>
                            )}
                            {currentPhase === 'completed' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleReset}
                                  className="text-white/40 hover:text-white/60 rounded-none"
                                >
                                  Generate New
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Show skeleton placeholders when processing but no assets yet */}
                            {isProcessing && generatedAssets.length === 0 ? (
                              <>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                  <Card key={`skeleton-${i}`} className="bg-[#0a0a0a] border-white/[0.06] rounded-none overflow-hidden">
                                    <CardContent className="p-0">
                                      <div className="aspect-video bg-black/30 flex items-center justify-center relative">
                                        <div className="w-full h-full bg-white/[0.03] animate-pulse" />
                                        <div className="absolute top-2 left-2 h-5 w-12 bg-white/[0.1] rounded-none animate-pulse" />
                                      </div>
                                      <div className="p-3">
                                        <div className="h-3 w-3/4 bg-white/[0.1] rounded-none animate-pulse" />
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </>
                            ) : (
                              <>
                                {generatedAssets.map((asset) => (
                                  <Card
                                    key={asset.id}
                                    className={cn(
                                      "bg-[#0a0a0a] border-white/[0.06] rounded-none overflow-hidden",
                                      asset.status === 'completed' && asset.type === 'image' && "cursor-pointer hover:border-white/20 transition-colors"
                                    )}
                                    onClick={() => handleAssetClick(asset)}
                                  >
                                    <CardContent className="p-0">
                                      <div className="aspect-video bg-black/30 flex items-center justify-center relative group">
                                        {asset.status === 'generating' ? (
                                          <FalSpinner className="w-8 h-8" style={{ color: '#e7083e' }} />
                                        ) : asset.status === 'completed' && asset.url ? (
                                          asset.type === 'video' ? (
                                            <video src={asset.url} className="w-full h-full object-cover" controls onClick={(e) => e.stopPropagation()} />
                                          ) : (
                                            <>
                                              <img src={asset.url} alt={asset.description} className="w-full h-full object-cover" />
                                              {/* Hover overlay for images */}
                                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="text-center">
                                                  <PlusIcon className="w-8 h-8 text-white mx-auto mb-2" />
                                                  <span className="text-xs text-white/80">Create Variant</span>
                                                </div>
                                              </div>
                                            </>
                                          )
                                        ) : (
                                          <XMarkIcon className="w-8 h-8 text-red-400" />
                                        )}
                                        <Badge
                                          size="xs"
                                          className={cn("absolute top-2 left-2 rounded-none", getAspectRatioBadge(asset.aspectRatio))}
                                        >
                                          {asset.aspectRatio}
                                        </Badge>
                                        {asset.type === 'video' && (
                                          <Badge
                                            size="xs"
                                            className="absolute top-2 right-2 rounded-none bg-purple-500/10 text-purple-400/80 border-purple-500/20"
                                          >
                                            Video
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="p-3">
                                        <p className="text-xs text-white/60 truncate">{asset.description}</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 rounded-none flex items-center gap-3">
                <XMarkIcon className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Ad Copy Generation Dialog */}
            <Dialog open={showAdCopyDialog} onOpenChange={setShowAdCopyDialog}>
              <DialogContent className="bg-[#0a0a0a] border-white/[0.08] rounded-none max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" style={{ color: '#e7083e' }} />
                    Generate Ad Copy
                  </DialogTitle>
                  <DialogDescription className="text-white/60">
                    Create compelling advertising copy including headlines, descriptions, CTAs, and social media captions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Custom Instruction */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
                      <SparklesIcon className="w-3.5 h-3.5" style={{ color: '#e7083e' }} />
                      Custom Instruction (Optional)
                    </label>
                    <Input
                      value={adCopyInstruction}
                      onChange={(e) => setAdCopyInstruction(e.target.value)}
                      className="h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 hover:bg-white/[0.06] hover:border-white/[0.12] focus:bg-white/[0.06] transition-all duration-200 rounded-none"
                      placeholder="e.g., Focus on luxury and exclusivity"
                    />
                    <p className="text-[10px] text-white/30">
                      Optional instruction to guide ad copy generation
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAdCopyDialog(false);
                        setAdCopyInstruction("");
                      }}
                      className="flex-1 text-white/60 hover:text-white rounded-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await generateAdCopy(adCopyInstruction || undefined);
                      }}
                      disabled={!hasUserKey || isProcessing}
                      className="flex-1 rounded-none text-white"
                      style={{ backgroundColor: '#e7083e' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#d00735'}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#e7083e'}
                    >
                      Generate Copy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Single Asset Generation Dialog */}
            <Dialog open={showSingleAssetDialog} onOpenChange={setShowSingleAssetDialog}>
              <DialogContent className="bg-[#0a0a0a] border-white/[0.08] rounded-none max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Generate Single Asset</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Create a new asset with custom settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Asset Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Asset Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSingleAssetType('image')}
                        className={cn(
                          "h-12 border transition-all rounded-none text-sm font-medium",
                          singleAssetType === 'image'
                            ? "bg-neutral-700 dark:bg-white/[0.12] border-neutral-600 dark:border-white/[0.2] text-white dark:text-white"
                            : "bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08] text-white/60 dark:text-white/60 hover:bg-white/[0.06] dark:hover:bg-white/[0.06]"
                        )}
                      >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Image
                      </button>
                      <button
                        onClick={() => setSingleAssetType('video')}
                        className={cn(
                          "h-12 border transition-all rounded-none text-sm font-medium",
                          singleAssetType === 'video'
                            ? "bg-neutral-700 dark:bg-white/[0.12] border-neutral-600 dark:border-white/[0.2] text-white dark:text-white"
                            : "bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08] text-white/60 dark:text-white/60 hover:bg-white/[0.06] dark:hover:bg-white/[0.06]"
                        )}
                      >
                        <VideoCameraIcon className="w-4 h-4 inline mr-2" />
                        Video
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['9:16', '3:4', '1:1', '16:9'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setSingleAssetAspectRatio(ratio)}
                          className={cn(
                            "h-12 border transition-all rounded-none text-xs font-medium",
                            singleAssetAspectRatio === ratio
                              ? "bg-neutral-700 dark:bg-white/[0.12] border-neutral-600 dark:border-white/[0.2] text-white dark:text-white"
                              : "bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08] text-white/60 dark:text-white/60 hover:bg-white/[0.06] dark:hover:bg-white/[0.06]"
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Instruction */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
                      <SparklesIcon className="w-3.5 h-3.5" style={{ color: '#e7083e' }} />
                      Custom Instruction
                      <Badge className="bg-white/[0.05] text-white/50 border-white/[0.1] rounded-none text-[9px] px-1.5 py-0">
                        Optional
                      </Badge>
                    </label>
                    <Input
                      value={singleAssetInstruction}
                      onChange={(e) => setSingleAssetInstruction(e.target.value)}
                      className="h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 hover:bg-white/[0.06] hover:border-white/[0.12] focus:bg-white/[0.06] transition-all duration-200 rounded-none"
                      placeholder="Leave empty to use brand context automatically"
                    />
                    <p className="text-[10px] text-white/30">
                      Optional: Provide custom instruction or leave empty for automatic generation
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSingleAssetDialog(false);
                        setSingleAssetInstruction("");
                      }}
                      className="flex-1 text-white/60 hover:text-white rounded-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Close dialog immediately
                        setShowSingleAssetDialog(false);
                        const instruction = singleAssetInstruction.trim() || undefined;
                        setSingleAssetInstruction("");

                        // Start generation in background (don't await)
                        generateSingleAssetVariant(
                          singleAssetType,
                          singleAssetAspectRatio,
                          instruction
                        );
                      }}
                      disabled={!hasUserKey || isProcessing}
                      className="flex-1 rounded-none text-white"
                      style={{ backgroundColor: '#e7083e' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#d00735'}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#e7083e'}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Asset Variant Generation Dialog */}
            <Dialog open={showAssetVariantDialog} onOpenChange={setShowAssetVariantDialog}>
              <DialogContent className="bg-[#0a0a0a] border-white/[0.08] rounded-none max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" style={{ color: '#e7083e' }} />
                    Create Variant
                  </DialogTitle>
                  <DialogDescription className="text-white/60">
                    Generate a new asset based on this image
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Source Image Preview */}
                  {selectedAsset && (
                    <div className="relative aspect-video bg-black/30 rounded-none overflow-hidden border border-white/[0.08]">
                      <img
                        src={selectedAsset.url}
                        alt="Source"
                        className="w-full h-full object-contain"
                      />
                      <Badge
                        size="xs"
                        className={cn("absolute top-2 left-2 rounded-none", getAspectRatioBadge(selectedAsset.aspectRatio))}
                      >
                        Source: {selectedAsset.aspectRatio}
                      </Badge>
                    </div>
                  )}

                  {/* Asset Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                      Output Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setVariantType('image')}
                        className={cn(
                          "h-12 border transition-all rounded-none text-sm font-medium",
                          variantType === 'image'
                            ? "bg-neutral-700 dark:bg-white/[0.12] border-neutral-600 dark:border-white/[0.2] text-white dark:text-white"
                            : "bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08] text-white/60 dark:text-white/60 hover:bg-white/[0.06] dark:hover:bg-white/[0.06]"
                        )}
                      >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Image
                      </button>
                      <button
                        onClick={() => setVariantType('video')}
                        className={cn(
                          "h-12 border transition-all rounded-none text-sm font-medium",
                          variantType === 'video'
                            ? "bg-neutral-700 dark:bg-white/[0.12] border-neutral-600 dark:border-white/[0.2] text-white dark:text-white"
                            : "bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08] text-white/60 dark:text-white/60 hover:bg-white/[0.06] dark:hover:bg-white/[0.06]"
                        )}
                      >
                        <VideoCameraIcon className="w-4 h-4 inline mr-2" />
                        Video
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio - only for images */}
                  {variantType === 'image' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                        Aspect Ratio
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['9:16', '3:4', '1:1', '16:9'] as const).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setVariantAspectRatio(ratio)}
                            className={cn(
                              "h-12 border transition-all rounded-none text-xs font-medium",
                              variantAspectRatio === ratio
                                ? "bg-neutral-700 dark:bg-white/[0.12] border-neutral-600 dark:border-white/[0.2] text-white dark:text-white"
                                : "bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08] text-white/60 dark:text-white/60 hover:bg-white/[0.06] dark:hover:bg-white/[0.06]"
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
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
                      <SparklesIcon className="w-3.5 h-3.5" style={{ color: '#e7083e' }} />
                      Custom Instruction
                      <Badge className="bg-white/[0.05] text-white/50 border-white/[0.1] rounded-none text-[9px] px-1.5 py-0">
                        Optional
                      </Badge>
                    </label>
                    <Input
                      value={variantInstruction}
                      onChange={(e) => setVariantInstruction(e.target.value)}
                      className="h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 hover:bg-white/[0.06] hover:border-white/[0.12] focus:bg-white/[0.06] transition-all duration-200 rounded-none"
                      placeholder="e.g., More dramatic lighting, different angle..."
                    />
                    <p className="text-[10px] text-white/30">
                      {variantType === 'video'
                        ? "This image will be used as the starting frame for the video"
                        : "Leave empty to generate a creative variant automatically"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAssetVariantDialog(false);
                        setSelectedAsset(null);
                        setVariantInstruction("");
                      }}
                      className="flex-1 text-white/60 hover:text-white rounded-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (selectedAsset) {
                          // Close dialog immediately
                          setShowAssetVariantDialog(false);
                          const instruction = variantInstruction.trim() || undefined;
                          const aspectRatio = variantType === 'video' ? '16:9' : variantAspectRatio;

                          // Start generation in background
                          generateVariantFromAsset(
                            selectedAsset,
                            variantType,
                            aspectRatio,
                            instruction
                          );

                          setSelectedAsset(null);
                          setVariantInstruction("");
                        }
                      }}
                      disabled={!hasUserKey || !selectedAsset}
                      className="flex-1 rounded-none text-white"
                      style={{ backgroundColor: '#e7083e' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#d00735'}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#e7083e'}
                    >
                      {variantType === 'video' ? 'Generate Video' : 'Generate Image'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogContent className="bg-[#0a0a0a] border-white/[0.08] rounded-none max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" style={{ color: '#e7083e' }} />
                      Generation History
                    </span>
                    {history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-red-400/70 hover:text-red-400 rounded-none"
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-white/60">
                    Click on any image to create a new variant from it
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto mt-4">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <ClockIcon className="w-12 h-12 text-white/20 mb-4" />
                      <p className="text-white/40 text-sm">No history yet</p>
                      <p className="text-white/30 text-xs mt-1">Generated assets will appear here</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="group relative bg-white/[0.02] border border-white/[0.06] rounded-none overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
                          onClick={() => item.type === 'image' && generateVariantFromHistory(item)}
                        >
                          <div className="aspect-video relative">
                            {item.type === 'video' ? (
                              <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.url} alt={item.description} className="w-full h-full object-cover" />
                            )}
                            {/* Hover overlay for images */}
                            {item.type === 'image' && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-center">
                                  <PlusIcon className="w-8 h-8 text-white mx-auto mb-2" />
                                  <span className="text-xs text-white/80">Create Variant</span>
                                </div>
                              </div>
                            )}
                            <Badge
                              size="xs"
                              className={cn("absolute top-2 left-2 rounded-none", getAspectRatioBadge(item.aspectRatio))}
                            >
                              {item.aspectRatio}
                            </Badge>
                            {item.type === 'video' && (
                              <Badge
                                size="xs"
                                className="absolute top-2 right-2 rounded-none bg-purple-500/10 text-purple-400/80 border-purple-500/20"
                              >
                                Video
                              </Badge>
                            )}
                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteHistoryItem(item.id);
                              }}
                              className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <TrashIcon className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-white/60 truncate">{item.description}</p>
                            <p className="text-[10px] text-white/30 mt-1">
                              {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
