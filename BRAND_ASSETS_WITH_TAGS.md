# Brand Assets with Tags - Feature Summary

## Overview
Added the ability for users to manually upload brand assets with custom tags, allowing the LLM to intelligently select which assets to use during generation based on context.

## What Was Added

### 1. Database Schema Update ✅
**File**: `prisma/schema.prisma`
- Added `tags` field (String array) to `BrandAsset` model
- Allows multiple tags per asset for flexible categorization

### 2. Upload Asset Dialog ✅
**File**: `src/components/brand/upload-asset-dialog.tsx`
- **New comprehensive modal** for uploading brand assets
- Features:
  - Image file upload with preview
  - Asset type selector (Logo, Founder, Mascot, Product, Other)
  - Description input field
  - **Tag system** with:
    - Manual tag input (press Enter to add)
    - Quick-add suggested tags (hero, lifestyle, product-shot, detail, action, outdoor, studio)
    - Visual tag management (click to remove)
  - Upload progress indication

### 3. Enhanced BrandAssetCard ✅
**File**: `src/components/brand/brand-asset-card.tsx`
- Now displays tags below description
- Tags shown as small badges
- Visual distinction for different asset types

### 4. Updated BrandEditor ✅
**File**: `src/components/brand/brand-editor.tsx`
- Removed separate logo section (now part of assets grid)
- **"Upload Asset" button** always visible in header
- Empty state encourages uploading first asset
- Grid displays ALL brand assets with tags
- Delete functionality for each asset

### 5. API Endpoints ✅

**Upload Asset** - `POST /api/projects/[id]/upload-asset`
- Accepts: file, type, description, tags
- Uploads to Supabase: `brand-assets/{userId}/{projectId}/{type}-{timestamp}.{ext}`
- Creates BrandAsset with tags
- Returns created asset

**Delete Asset** - `DELETE /api/projects/[id]/delete-asset/[assetId]`
- Verifies ownership
- Deletes asset from database
- Returns success status

### 6. Auto-Tagging System ✅
**File**: `src/lib/brand-extraction.ts`
- When extracting brand assets, **automatically adds tags** based on type:
  - LOGO → `["brand-identity", "official"]`
  - FOUNDER → `["team", "people"]`
  - MASCOT → `["character", "brand-identity"]`
  - PRODUCT → `["product-shot"]`
  - OTHER → `["asset"]`

## How It Works

### Upload Flow
1. User clicks "Upload Asset" button
2. Upload dialog opens
3. User:
   - Selects image file (with preview)
   - Chooses asset type from dropdown
   - Adds description (optional)
   - Adds custom tags:
     - Type tags manually and press Enter
     - Or click suggested tags to quick-add
   - Clicks "Upload Asset"
4. File uploads to Supabase
5. BrandAsset created with tags
6. Asset appears in grid with type badge and tags

### Tag System
**Manual Tags**:
```
User types: "winter-campaign"
Presses Enter
Tag appears: [winter-campaign]
```

**Suggested Tags**:
```
Suggestions: [hero] [lifestyle] [product-shot] [detail]
User clicks [hero]
Tag added instantly
```

**Tag Display**:
```
┌─────────────────────────┐
│   [Image]               │
│   [PRODUCT Badge]       │
├─────────────────────────┤
│ Main product hero shot  │
│ [hero] [product-shot]   │
│ [studio]                │
└─────────────────────────┘
```

### LLM Integration (Future Use)
The tags enable intelligent asset selection:

```javascript
// Example: When generating social media content
const heroAssets = brandAssets.filter(a =>
  a.tags.includes("hero") || a.tags.includes("lifestyle")
);

// Example: When generating product-focused content
const productAssets = brandAssets.filter(a =>
  a.tags.includes("product-shot") || a.type === "PRODUCT"
);

// LLM can analyze tags to decide which asset fits the context
const prompt = `
  Available brand assets:
  ${brandAssets.map(a => `- ${a.type}: ${a.description} [${a.tags.join(', ')}]`)}

  For this ${generationType} generation, which asset should we use?
`;
```

## User Experience

### Before (Screenshot Context)
```
BRAND ASSETS
┌─────────────┐
│ [Logo]      │
│             │
│ Brand logo  │
└─────────────┘
```

### After (Full Feature)
```
BRAND ASSETS                    [Upload Asset]
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ [Logo]      │  │ [Product]   │  │ [Founder]   │
│ LOGO        │  │ PRODUCT     │  │ FOUNDER     │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ Brand logo  │  │ Hero shot   │  │ CEO photo   │
│ [official]  │  │ [hero]      │  │ [team]      │
│ [brand-id]  │  │ [studio]    │  │ [people]    │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Tag Use Cases

### Marketing Campaign Tags
- `holiday-2024` - For seasonal campaigns
- `summer-sale` - For promotional periods
- `launch` - For product launches

### Style Tags
- `lifestyle` - Lifestyle photography
- `studio` - Studio shots
- `outdoor` - Outdoor photography
- `action` - Action/dynamic shots
- `detail` - Close-up detail shots

### Usage Context Tags
- `hero` - Primary/hero images
- `background` - Background use
- `thumbnail` - Thumbnail use
- `banner` - Banner/header use

### Audience Tags
- `b2b` - Business audience
- `b2c` - Consumer audience
- `enterprise` - Enterprise clients

## Benefits

✅ **Flexible Organization** - Tag assets any way that makes sense for your brand
✅ **Smart Selection** - LLM can use tags to pick appropriate assets
✅ **Easy Management** - Visual tag display and removal
✅ **Quick Upload** - Streamlined dialog with suggested tags
✅ **Auto-Tagging** - Extracted assets come with default tags
✅ **Scalable** - Add unlimited tags per asset
✅ **Searchable** - Tags enable future search/filter functionality

## Database Migration Required

Run this to add the `tags` field:
```bash
npx prisma db push
```

## Files Modified/Created

### New Files (2)
- `src/components/brand/upload-asset-dialog.tsx` - Upload modal
- `src/app/api/projects/[id]/delete-asset/[assetId]/route.ts` - Delete endpoint

### Modified Files (6)
- `prisma/schema.prisma` - Added tags field
- `src/components/brand/brand-asset-card.tsx` - Display tags
- `src/components/brand/brand-editor.tsx` - Upload button & dialog integration
- `src/app/(dashboard)/projects/[id]/page.tsx` - Upload & delete handlers
- `src/app/api/projects/[id]/upload-asset/route.ts` - Renamed from upload-logo, supports tags
- `src/lib/brand-extraction.ts` - Auto-tag extracted assets
- `src/app/api/projects/[id]/extract-brand/route.ts` - Save tags

## Next Steps for LLM Integration

To make the LLM use tags intelligently:

1. **Pass tags to generation context**:
```typescript
const brandAssetContext = brandAssets.map(asset => ({
  type: asset.type,
  description: asset.description,
  tags: asset.tags,
  url: asset.url
}));

// Include in generation prompt
const enhancedPrompt = `
  ${basePrompt}

  Available brand assets:
  ${JSON.stringify(brandAssetContext)}

  Select appropriate assets based on their tags and the generation context.
`;
```

2. **Create tag-based selection logic**:
```typescript
// For hero/featured content
const heroAssets = brandAssets.filter(a =>
  a.tags.some(tag => ["hero", "featured", "primary"].includes(tag))
);

// For product-focused content
const productAssets = brandAssets.filter(a =>
  a.type === "PRODUCT" || a.tags.includes("product-shot")
);
```

3. **Enhance generation with asset URLs**:
- Include selected asset URLs in generation settings
- LLM can reference specific images
- Maintain brand consistency across outputs

---

**Status**: ✅ Complete - Ready to Use
**Migration Required**: Yes (`npx prisma db push`)
