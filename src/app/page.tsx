import { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/landing-nav";

export const metadata: Metadata = {
  title: "Ad Assets Generator | AI-Powered Creative for Modern Brands",
  description:
    "Generate stunning ad creatives with AI. Images, videos, and copy that convert. Start creating in seconds.",
};

// Credit packages for pricing section
const PACKAGES = [
  {
    id: "starter",
    name: "STARTER",
    credits: 50,
    price: 9.99,
    description: "Perfect for trying out the platform",
    features: ["50 AI-generated images", "10 AI videos", "100 ad copy variations", "Project organization"],
  },
  {
    id: "pro",
    name: "PRO",
    credits: 200,
    price: 29.99,
    description: "Best value for regular users",
    popular: true,
    features: [
      "200 AI-generated images",
      "40 AI videos",
      "400 ad copy variations",
      "Brand extraction",
      "Priority generation",
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    credits: 500,
    price: 59.99,
    description: "For teams and power users",
    features: [
      "500 AI-generated images",
      "100 AI videos",
      "1000 ad copy variations",
      "Brand extraction",
      "Priority support",
      "API access (coming soon)",
    ],
  },
];

// Features data
const FEATURES = [
  {
    title: "AI IMAGE GENERATION",
    description:
      "Create stunning product images, lifestyle shots, and branded visuals in any aspect ratio. Perfect for social ads, display campaigns, and more.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "AI VIDEO CREATION",
    description:
      "Transform static images into eye-catching video ads. Motion graphics, product animations, and social video content at scale.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "AD COPY GENERATION",
    description:
      "Generate compelling headlines, body copy, and CTAs tailored to your brand voice. Multiple variations in seconds.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: "BRAND EXTRACTION",
    description:
      "Upload your existing brand assets and we'll extract colors, styles, and visual elements to ensure consistency across all generated content.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    title: "PROJECT ORGANIZATION",
    description:
      "Keep your campaigns organized with projects. Group assets by client, campaign, or product for easy access and management.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    title: "MULTIPLE FORMATS",
    description:
      "Generate assets in all major aspect ratios: 9:16 for Stories, 1:1 for feeds, 16:9 for YouTube, and 3:4 for Pinterest.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
];

// How it works steps
const STEPS = [
  {
    number: "01",
    title: "CREATE A PROJECT",
    description: "Start by creating a project for your campaign. Upload existing brand assets or start fresh.",
  },
  {
    number: "02",
    title: "EXTRACT YOUR BRAND",
    description: "Our AI analyzes your brand assets to understand colors, style, and visual language.",
  },
  {
    number: "03",
    title: "GENERATE ASSETS",
    description: "Describe what you need. Get professional images, videos, and copy in seconds.",
  },
  {
    number: "04",
    title: "DOWNLOAD & DEPLOY",
    description: "Download your assets and deploy them across all your advertising channels.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 border-4 border-foreground bg-card">
                  <span className="text-sm font-bold uppercase tracking-widest">AI-POWERED CREATIVE</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                  AD ASSETS
                  <br />
                  <span className="text-primary">THAT CONVERT</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Generate stunning images, videos, and ad copy in seconds.
                  AI-powered creative for modern brands that demand results.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide border-4 border-foreground hover:bg-primary/90 transition-colors text-center"
                >
                  Start Creating Free
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-card font-black text-lg uppercase tracking-wide border-4 border-foreground hover:bg-accent transition-colors text-center"
                >
                  See How It Works
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black">1M+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Assets Generated</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black">10K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">Active Users</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black">4.9★</div>
                  <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">User Rating</div>
                </div>
              </div>
            </div>
            {/* Hero Visual */}
            <div className="relative">
              <div className="aspect-square bg-card border-4 border-foreground p-8 relative">
                {/* Grid of sample assets */}
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-primary/20 border-2 border-foreground flex items-center justify-center">
                    <span className="text-6xl font-black text-primary/40">9:16</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-accent border-2 border-foreground h-1/2 flex items-center justify-center">
                      <span className="text-4xl font-black text-muted-foreground/40">1:1</span>
                    </div>
                    <div className="bg-muted border-2 border-foreground h-[calc(50%-1rem)] flex items-center justify-center">
                      <span className="text-3xl font-black text-muted-foreground/40">16:9</span>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 px-4 py-2 bg-primary text-primary-foreground border-4 border-foreground font-black uppercase tracking-wide text-sm rotate-3">
                  AI Generated
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-foreground -z-10" />
              <div className="absolute -top-4 -left-4 w-12 h-12 border-4 border-primary -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-foreground text-background border-y-4 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <span className="text-sm font-bold uppercase tracking-widest opacity-60">Trusted by teams at</span>
            {["AGENCY CO", "BRAND INC", "STARTUP X", "MEDIA GROUP", "CREATIVE LABS"].map((company) => (
              <span key={company} className="text-lg font-black tracking-tight opacity-80">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-4">
              EVERYTHING YOU NEED
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete toolkit for generating professional ad assets at scale.
              No design skills required.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 border-4 border-foreground bg-card hover:bg-accent transition-colors group"
              >
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-card border-y-4 border-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From brief to beautiful in four simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-foreground -z-10" />
                )}
                <div className="text-7xl font-black text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-4">
              SIMPLE PRICING
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pay for what you use. No subscriptions, no hidden fees.
              Credits never expire.
            </p>
            <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3 border-4 border-foreground bg-card text-sm sm:text-base">
              <span className="font-bold">Credit Costs:</span>
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                <span className="text-muted-foreground">1 image = 1 credit</span>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <span className="text-muted-foreground">1 video = 5 credits</span>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <span className="text-muted-foreground">Ad copy = 0.5 credits</span>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-8 border-4 ${
                  pkg.popular
                    ? "border-primary bg-primary/5 relative"
                    : "border-foreground bg-card"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground font-bold uppercase text-sm tracking-wide border-2 border-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{pkg.description}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">${pkg.price}</span>
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {pkg.credits} credits • ${(pkg.price / pkg.credits).toFixed(2)}/credit
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-4 text-center font-black uppercase tracking-wide border-4 transition-colors ${
                    pkg.popular
                      ? "bg-primary text-primary-foreground border-foreground hover:bg-primary/90"
                      : "bg-card border-foreground hover:bg-accent"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Need more? <span className="font-bold text-foreground">Enterprise plans</span> available.{" "}
              <a href="mailto:sales@adassets.io" className="text-primary hover:underline font-bold">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-6">
            READY TO CREATE?
          </h2>
          <p className="text-xl mb-8 opacity-80">
            Join thousands of marketers and designers generating professional ad assets with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide border-4 border-background hover:bg-primary/90 transition-colors"
            >
              Start Creating Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent font-black text-lg uppercase tracking-wide border-4 border-background hover:bg-background/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary" />
                <span className="text-lg font-black tracking-tight">AD ASSETS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered creative for modern brands that demand results.
              </p>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-wide mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-wide mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="mailto:support@adassets.io" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black uppercase tracking-wide mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log In</Link></li>
                <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ad Assets Generator. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
