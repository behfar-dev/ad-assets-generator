# Ad Assets Generator

<p align="center">
  <a href="https://fal.ai">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/fal-logo-light.svg">
      <source media="(prefers-color-scheme: light)" srcset="./assets/fal-logo-dark.svg">
      <img alt="fal.ai" src="./assets/fal-logo-dark.svg" width="120">
    </picture>
  </a>
</p>

<p align="center">
  <strong>AI-powered creative asset generator</strong><br>
  Powered by <a href="https://fal.ai">fal.ai</a>
</p>

---

## Overview

Generate ad creatives from brand images using AI. Upload your assets, describe what you want, and get production-ready images and videos.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Brand Images  │────▶│   AI Agent       │────▶│  Final Assets   │
│   + Prompt      │     │  (OpenRouter)    │     │  Images/Videos  │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
           ┌───────────────┐         ┌───────────────┐
           │ Nano Banana   │         │ Kling Video   │
           │ Pro Edit      │         │ v2.6 Pro      │
           │ (Image Edit)  │         │ (I2V)         │
           └───────────────┘         └───────────────┘
```

## Models

| Model | Purpose |
|-------|---------|
| `fal-ai/nano-banana-pro/edit` | Image editing & generation |
| `fal-ai/kling-video/v2.6/pro/image-to-video` | Image to video |
| `openrouter/router` | AI agent orchestration |

## Setup

```bash
npm install
npm run dev
```

Enter your [fal.ai API key](https://fal.ai/dashboard/keys) when prompted.

## License

MIT
