import FirecrawlApp from "@mendable/firecrawl-js";
import OpenAI from "openai";
import { uploadToStorage, deleteFromStorage } from "./supabase";

// Initialize clients
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

// Initialize OpenAI client - use OpenRouter via fal.run if FAL_API_KEY is set, otherwise use direct OpenAI
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (openaiClient) return openaiClient;
  
  const falKey = process.env.FAL_API_KEY || process.env.NEXT_PUBLIC_FAL_API_KEY;
  
  if (falKey) {
    // Use OpenRouter via fal.run (same as rest of the app)
    openaiClient = new OpenAI({
      baseURL: "https://fal.run/openrouter/router/openai/v1",
      apiKey: "not-needed",
      defaultHeaders: {
        "Authorization": `Key ${falKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Fal Brand Extractor",
      },
    });
    return openaiClient;
  }
  
  // Fallback to direct OpenAI API
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Either FAL_API_KEY or OPENAI_API_KEY must be set. " +
      "FAL_API_KEY is recommended as it works with OpenRouter (supports multiple models)."
    );
  }
  
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
  return openaiClient;
};

// Brand data types
export interface BrandData {
  colors: string[];
  brandName: string;
  tagline?: string;
  description: string;
  voice: string;
  industry: string;
  productCategories: string[];
}

export interface BrandImage {
  url: string;
  type: "LOGO" | "FOUNDER" | "MASCOT" | "PRODUCT" | "OTHER";
  description?: string;
  tags?: string[];
}

export interface BrandExtractionResult {
  brandData: BrandData;
  images: BrandImage[];
}

// OpenAI tool definitions for brand extraction
const extractBrandIdentityTool = {
  type: "function" as const,
  function: {
    name: "extract_brand_identity",
    description:
      "Extracts comprehensive brand identity information from website content",
    parameters: {
      type: "object",
      properties: {
        colors: {
          type: "array",
          items: { type: "string" },
          description:
            "Hex codes of dominant brand colors (e.g., #FF5733, #3498DB)",
        },
        brandName: {
          type: "string",
          description: "Official brand/company name",
        },
        tagline: {
          type: "string",
          description: "Brand tagline or slogan if present",
        },
        description: {
          type: "string",
          description:
            "Concise brand description (2-3 sentences about what they do)",
        },
        voice: {
          type: "string",
          description:
            "Brand voice and tone (e.g., 'Professional and innovative', 'Playful and energetic')",
        },
        industry: {
          type: "string",
          description:
            "Industry or sector (e.g., 'Technology', 'Healthcare', 'E-commerce')",
        },
        productCategories: {
          type: "array",
          items: { type: "string" },
          description:
            "Main product or service categories (e.g., ['Software', 'SaaS', 'Analytics'])",
        },
      },
      required: [
        "colors",
        "brandName",
        "description",
        "voice",
        "industry",
        "productCategories",
      ],
    },
  },
};

const classifyBrandImagesTool = {
  type: "function" as const,
  function: {
    name: "classify_brand_images",
    description:
      "Classifies images from a website into brand asset categories",
    parameters: {
      type: "object",
      properties: {
        classifications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              imageUrl: {
                type: "string",
                description: "URL of the image",
              },
              type: {
                type: "string",
                enum: ["LOGO", "FOUNDER", "MASCOT", "PRODUCT", "OTHER"],
                description: "Classification of the image",
              },
              description: {
                type: "string",
                description: "Brief description of the image",
              },
              confidence: {
                type: "string",
                enum: ["high", "medium", "low"],
                description: "Confidence level of the classification",
              },
            },
            required: ["imageUrl", "type", "confidence"],
          },
          description: "Array of image classifications",
        },
      },
      required: ["classifications"],
    },
  },
};

/**
 * Downloads an image from a URL and uploads it to Supabase storage
 */
async function downloadAndUploadImage(
  imageUrl: string,
  userId: string,
  projectId: string,
  type: string,
  index?: number
): Promise<string | null> {
  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image from ${imageUrl}: ${response.status} ${response.statusText}`);
      return null;
    }

    // Validate content type is an image
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.error(`Invalid content type for ${imageUrl}: ${contentType}`);
      return null;
    }

    const blob = await response.blob();

    // Determine file extension
    const extension = contentType.split("/")[1] || "png";

    // Create filename
    const filename =
      index !== undefined
        ? `${type.toLowerCase()}-${index}.${extension}`
        : `${type.toLowerCase()}.${extension}`;

    // Upload to Supabase
    const path = `brand-assets/${userId}/${projectId}/${filename}`;
    const publicUrl = await uploadToStorage("brand-assets", path, blob);

    return publicUrl;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Extracts brand data from a website URL using Firecrawl and OpenAI
 */
export async function extractBrandFromWebsite(
  websiteUrl: string,
  userId: string,
  projectId: string
): Promise<BrandExtractionResult> {
  try {
    // Step 1: Scrape website with Firecrawl
    console.log(`Scraping website: ${websiteUrl}`);
    const scrapeResult = await firecrawl.scrape(websiteUrl, {
      formats: ["markdown", "html", "links"],
      includeTags: ["img"],
      onlyMainContent: true,
    });

    const { markdown, html, metadata } = scrapeResult;

    // Extract image URLs from the scraped content
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    const imageUrls: string[] = [];
    let match;
    while ((match = imageRegex.exec(html || "")) !== null) {
      imageUrls.push(match[1]);
    }

    // Step 2: Analyze brand identity with OpenAI
    console.log("Analyzing brand identity...");
    const openai = getOpenAIClient();
    const brandAnalysis = await openai.chat.completions.create({
      model: "google/gemini-3-pro-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a brand analysis expert. Extract comprehensive brand identity information from website content.",
        },
        {
          role: "user",
          content: `Analyze this website and extract brand identity information:

Website URL: ${websiteUrl}
Title: ${metadata?.title || "N/A"}
Description: ${metadata?.description || "N/A"}

Content:
${markdown?.substring(0, 4000)}

Extract the brand colors, name, tagline, description, voice/tone, industry, and product categories.`,
        },
      ],
      tools: [extractBrandIdentityTool],
      tool_choice: { type: "function", function: { name: "extract_brand_identity" } },
    });

    const toolCall = brandAnalysis.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_brand_identity") {
      throw new Error("Failed to extract brand identity");
    }

    const brandData: BrandData = JSON.parse(toolCall.function.arguments);

    // Step 3: Classify images
    console.log(`Classifying ${imageUrls.length} images...`);
    let classifiedImages: BrandImage[] = [];

    if (imageUrls.length > 0) {
      const imageClassification = await openai.chat.completions.create({
        model: "google/gemini-3-pro-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at identifying and classifying brand assets in images. Classify images as LOGO, FOUNDER (founder/owner photo), MASCOT, PRODUCT, or OTHER.",
          },
          {
            role: "user",
            content: `Classify these images from ${websiteUrl}:

Brand Name: ${brandData.brandName}
Industry: ${brandData.industry}

Image URLs:
${imageUrls.slice(0, 20).join("\n")}

Classify each image and provide confidence level. Focus on finding the logo first, then other relevant brand assets.`,
          },
        ],
        tools: [classifyBrandImagesTool],
        tool_choice: { type: "function", function: { name: "classify_brand_images" } },
      });

      const classificationCall =
        imageClassification.choices[0]?.message?.tool_calls?.[0];
      if (
        classificationCall &&
        classificationCall.function.name === "classify_brand_images"
      ) {
        const classifications = JSON.parse(classificationCall.function.arguments);

        // Filter high confidence classifications and add default tags
        classifiedImages = classifications.classifications
          .filter((img: any) => img.confidence === "high" || img.confidence === "medium")
          .map((img: any) => {
            // Auto-generate tags based on type
            const autoTags: string[] = [];
            if (img.type === "LOGO") autoTags.push("brand-identity", "official");
            if (img.type === "FOUNDER") autoTags.push("team", "people");
            if (img.type === "MASCOT") autoTags.push("character", "brand-identity");
            if (img.type === "PRODUCT") autoTags.push("product-shot");
            if (img.type === "OTHER") autoTags.push("asset");

            return {
              url: img.imageUrl,
              type: img.type,
              description: img.description,
              tags: autoTags,
            };
          });
      }
    }

    // Step 4: Download and upload images to Supabase
    console.log(`Uploading ${classifiedImages.length} images to Supabase...`);
    const uploadedImages: BrandImage[] = [];

    for (let index = 0; index < classifiedImages.length; index++) {
      const image = classifiedImages[index];
      const uploadedUrl = await downloadAndUploadImage(
        image.url,
        userId,
        projectId,
        image.type,
        image.type === "PRODUCT" || image.type === "OTHER" ? index : undefined
      );

      if (uploadedUrl) {
        uploadedImages.push({
          ...image,
          url: uploadedUrl,
        });
      }
    }

    console.log("Brand extraction completed successfully");
    return {
      brandData,
      images: uploadedImages,
    };
  } catch (error) {
    console.error("Brand extraction error:", error);
    throw error;
  }
}

/**
 * Cleanup brand assets for a project
 */
export async function cleanupBrandAssets(
  userId: string,
  projectId: string
): Promise<void> {
  try {
    // List all files in the project's brand assets folder
    const path = `brand-assets/${userId}/${projectId}/`;

    // Delete all files (Supabase client handles deletion)
    await deleteFromStorage("brand-assets", path);

    console.log(`Cleaned up brand assets for project ${projectId}`);
  } catch (error) {
    console.error("Error cleaning up brand assets:", error);
    // Don't throw - cleanup is best effort
  }
}
