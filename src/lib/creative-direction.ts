export type CreativeDirectionId =
  | "ecommerce_product_photography"
  | "social_performance_ads"
  | "ugc_creator_ads"
  | "recruiting_employer_brand"
  | "mobile_ua_gaming";

export type CreativeDirection = {
  id: CreativeDirectionId;
  label: string;
  description: string;
  /** Added in front of the final *image generation* prompt sent to fal nano-banana (not the spec generation prompt). */
  imageGenerationPrefix: string;
  /** Added in front of the final *video generation* prompt sent to Kling (not the spec generation prompt). */
  videoGenerationPrefix: string;
  /** Guidance injected into the asset spec prompt (Gemini toolcall) */
  assetSpecGuidelines: (args: { vCount: number }) => string;
  /** Guidance injected into the ad copy prompt (Gemini toolcall) */
  adCopyGuidelines: string;
};

export const DEFAULT_CREATIVE_DIRECTION_ID: CreativeDirectionId =
  "ecommerce_product_photography";

/**
 * Presets are intentionally framed around common, high-spend use-cases:
 * ecommerce/DTC, performance social, UGC, recruiting, mobile UA gaming.
 */
export const CREATIVE_DIRECTIONS: CreativeDirection[] = [
  {
    id: "ecommerce_product_photography",
    label: "Ecommerce (PDP / Catalog / DTC)",
    description:
      "Premium product visuals for ecommerce, marketplaces, PDPs, and catalog-style ads.",
    imageGenerationPrefix:
      "High-end product photography, premium ad shoot, studio lighting, crisp details,",
    videoGenerationPrefix:
      "Cinematic product cinematography, premium ad shoot lighting, smooth camera motion,",
    assetSpecGuidelines: ({ vCount }) => `CRITICAL GUIDELINES (Ecommerce / Product):
- Images: premium product photography / ad shoot style; studio or lifestyle sets are ok; emphasize material/detail/benefit.
- ALWAYS: ABSOLUTELY NO TEXT IN IMAGES. Pure visual storytelling.
- Prefer clear product readability, strong composition, and conversion-oriented scenes (feature callouts implied visually, not as text).
- High-spend inspiration categories (use if relevant): Beauty/Skincare, Fitness/Wellness, Food & Beverage, Apparel, Consumer Electronics, Home.

For Video Prompts:
- All ${vCount} will be for Kling.
- Focus on product cinematography: dynamic camera moves, lighting transitions, slow motion, satisfying macro details.
- Avoid actors delivering a scripted “commercial”. No people speaking unless explicitly requested.`,
    adCopyGuidelines: `COPY GUIDELINES (Ecommerce / DTC):
- Direct-response, benefit-led, conversion-focused.
- Mention key benefit, differentiator, and offer/urgency if appropriate.
- CTAs: Shop now, Get yours, Try it today, Learn more.`,
  },
  {
    id: "social_performance_ads",
    label: "Social Performance Ads (Meta / TikTok / Shorts)",
    description:
      "Scroll-stopping concepts optimized for paid social performance (without adding text overlays).",
    imageGenerationPrefix:
      "Scroll-stopping social ad creative, bold lighting, high contrast, dramatic composition,",
    videoGenerationPrefix:
      "Scroll-stopping social ad video, punchy pacing, dynamic camera motion, bold lighting,",
    assetSpecGuidelines: ({ vCount }) => `CRITICAL GUIDELINES (Performance Social):
- Images: designed to stop the scroll via strong hook visuals (surprise, contrast, motion cues, bold props, dramatic lighting).
- ALWAYS: ABSOLUTELY NO TEXT IN IMAGES. No captions, no UI, no typography.
- Prefer high-clarity subject + a single strong concept per asset.
- High-spend inspiration categories: DTC Ecommerce, Fintech, Subscription apps, Beauty, Fitness, Consumer electronics.

For Video Prompts:
- All ${vCount} will be for Kling.
- Focus on dynamic “hook-first” cinematography and quick visual beats.
- No people speaking unless explicitly requested.`,
    adCopyGuidelines: `COPY GUIDELINES (Performance Social):
- Hook-first, punchy, curiosity-driven.
- Short sentences. Strong verbs. Clear CTA.
- Generate platform-appropriate options for Meta + TikTok + Shorts.`,
  },
  {
    id: "ugc_creator_ads",
    label: "UGC / Creator-style Ads",
    description:
      "Creator-native visuals and copy concepts (handheld, authentic vibe) while staying brand-safe.",
    imageGenerationPrefix:
      "UGC creator-style ad, natural lighting, handheld feel, authentic candid moment,",
    videoGenerationPrefix:
      "UGC creator-style video, handheld camera feel, authentic pacing, natural lighting,",
    assetSpecGuidelines: ({ vCount }) => `CRITICAL GUIDELINES (UGC / Creator):
- Images: creator-native, candid, “real life” vibe; imperfect edges are ok (handheld framing, natural light).
- ALWAYS: ABSOLUTELY NO TEXT IN IMAGES. No subtitles, no on-screen captions, no app UI.
- Keep it believable and product-forward (product in-hand / in-use).
- High-spend inspiration categories: Beauty, Fitness, Supplements, DTC gadgets, Food & Beverage.

For Video Prompts:
- All ${vCount} will be for Kling.
- Emphasize handheld realism, quick cut energy, product-in-use shots.
- Avoid scripted “commercial film” acting; keep it creator-native. No people speaking unless explicitly requested.`,
    adCopyGuidelines: `COPY GUIDELINES (UGC / Creator):
- First-person framing (“I tried…”, “My favorite part…”), authentic tone.
- Specific before/after or problem/solution.
- CTA should feel natural, not corporate.`,
  },
  {
    id: "recruiting_employer_brand",
    label: "Recruiting / Employer Brand",
    description:
      "Culture-forward content concepts for hiring, team recruiting, and employer branding.",
    imageGenerationPrefix:
      "Employer brand content, modern workplace photography, candid team moments, warm lighting,",
    videoGenerationPrefix:
      "Employer brand video, candid workplace cinematography, warm lighting, human moments,",
    assetSpecGuidelines: ({ vCount }) => `CRITICAL GUIDELINES (Recruiting / Employer Brand):
- Images: culture, team energy, mission, values—show environment and vibe.
- ALWAYS: ABSOLUTELY NO TEXT IN IMAGES. No job titles or slogans in-frame.
- Avoid “stock photo” clichés; aim for specific, believable scenes.
- High-spend inspiration categories: Tech/SaaS, Fintech, Healthcare, Logistics, Retail, Hospitality.

For Video Prompts:
- All ${vCount} will be for Kling.
- Focus on cinematic workplace b-roll (office, makerspaces, on-site work), dynamic but tasteful.
- No people speaking unless explicitly requested.`,
    adCopyGuidelines: `COPY GUIDELINES (Recruiting):
- Mission + impact + role clarity.
- Benefits and growth opportunities.
- Strong CTA: Apply now, See open roles, Join the team.`,
  },
  {
    id: "mobile_ua_gaming",
    label: "Mobile UA (Gaming / App Install)",
    description:
      "Mobile user-acquisition creative angles for gaming/app installs (hook, rewards, progression).",
    imageGenerationPrefix:
      "Mobile UA ad creative, dynamic action, bold contrast, dramatic lighting,",
    videoGenerationPrefix:
      "Mobile UA ad video, high-energy pacing, dynamic motion, satisfying progression beats,",
    assetSpecGuidelines: ({ vCount }) => `CRITICAL GUIDELINES (Mobile UA / Gaming):
- Images: exaggerate the hook visually (reward, rarity, progression, challenge) without showing text/UI.
- ALWAYS: ABSOLUTELY NO TEXT IN IMAGES. No app UI screens, no buttons, no typography.
- Favor iconic symbols/metaphors of gameplay (tokens, gems, loot, levels) and dramatic, high-contrast shots.
- High-spend inspiration categories: Mobile games, subscription apps, fintech apps, shopping apps.

For Video Prompts:
- All ${vCount} will be for Kling.
- Focus on fast hooks, satisfying “reward” beats, dynamic camera, dramatic lighting.
- No people speaking unless explicitly requested.`,
    adCopyGuidelines: `COPY GUIDELINES (Mobile UA / Gaming):
- Hook + challenge + reward.
- Short, punchy lines. Clear install CTA.
- Examples of CTAs: Play now, Install now, Download free.`,
  },
];

export function getCreativeDirection(id?: string | null): CreativeDirection {
  const found = CREATIVE_DIRECTIONS.find((d) => d.id === id);
  return found ?? CREATIVE_DIRECTIONS[0];
}

export type BrandContextInfo = {
  colors?: string[];
  mood?: string;
  subject?: string;
  brandName?: string;
};

function formatBrandContextInstruction(
  brandContext?: BrandContextInfo | null
): string {
  if (!brandContext) return "";

  const parts: string[] = [];

  if (brandContext.brandName) {
    parts.push(`brand name ${brandContext.brandName}`);
  }

  if (brandContext.subject) {
    parts.push(`subject focus ${brandContext.subject}`);
  }

  if (brandContext.mood) {
    parts.push(`tone ${brandContext.mood}`);
  }

  if (brandContext.colors && brandContext.colors.length > 0) {
    parts.push(`color palette ${brandContext.colors.join(", ")}`);
  }

  return parts.length > 0
    ? `Stay on brand: ${parts.join("; ")}.`
    : "";
}

export function buildImageGenerationPrompt(args: {
  creativeDirectionId?: string | null;
  prompt: string;
  brandContext?: BrandContextInfo | null;
}): string {
  const dir = getCreativeDirection(args.creativeDirectionId);
  const brandInstruction = formatBrandContextInstruction(args.brandContext);
  return [dir.imageGenerationPrefix, args.prompt, brandInstruction]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function buildVideoGenerationPrompt(args: {
  creativeDirectionId?: string | null;
  prompt: string;
  brandContext?: BrandContextInfo | null;
}): string {
  const dir = getCreativeDirection(args.creativeDirectionId);
  const brandInstruction = formatBrandContextInstruction(args.brandContext);
  return [dir.videoGenerationPrefix, args.prompt, brandInstruction]
    .filter(Boolean)
    .join(" ")
    .trim();
}

