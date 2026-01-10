import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | Ad Assets Generator",
  description:
    "Simple, transparent pricing. Pay for what you use with credits. No subscriptions, no hidden fees.",
};

// Credit packages with full details
const PACKAGES = [
  {
    id: "starter",
    name: "STARTER",
    credits: 50,
    price: 9.99,
    description: "Perfect for trying out the platform",
    features: [
      "50 credits",
      "~50 AI-generated images",
      "~10 AI videos",
      "~100 ad copy variations",
      "Project organization",
      "All aspect ratios",
      "Standard support",
    ],
    limitations: ["No priority generation"],
  },
  {
    id: "pro",
    name: "PRO",
    credits: 200,
    price: 29.99,
    description: "Best value for regular users",
    popular: true,
    features: [
      "200 credits",
      "~200 AI-generated images",
      "~40 AI videos",
      "~400 ad copy variations",
      "Project organization",
      "All aspect ratios",
      "Brand extraction",
      "Priority generation",
      "Priority support",
    ],
    limitations: [],
  },
  {
    id: "business",
    name: "BUSINESS",
    credits: 500,
    price: 59.99,
    description: "For teams and agencies",
    features: [
      "500 credits",
      "~500 AI-generated images",
      "~100 AI videos",
      "~1000 ad copy variations",
      "Project organization",
      "All aspect ratios",
      "Brand extraction",
      "Priority generation",
      "Priority support",
      "Bulk downloads",
      "API access (coming soon)",
    ],
    limitations: [],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    credits: 0,
    price: 0,
    description: "Custom solutions for large teams",
    isEnterprise: true,
    features: [
      "Custom credit volume",
      "Volume discounts",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees",
      "Team management",
      "Advanced analytics",
      "White-label options",
    ],
    limitations: [],
  },
];

// Credit costs for transparency
const CREDIT_COSTS = [
  { type: "AI Image", cost: 1, example: "Product shots, lifestyle images, ads" },
  { type: "AI Video", cost: 5, example: "Motion graphics, product animations" },
  { type: "Ad Copy", cost: 0.5, example: "Headlines, body copy, CTAs" },
  { type: "Brand Extraction", cost: 2, example: "Color palette, style analysis" },
];

// Feature comparison data
const FEATURE_COMPARISON = [
  { feature: "Credits", starter: "50", pro: "200", business: "500", enterprise: "Custom" },
  { feature: "Cost per Credit", starter: "$0.20", pro: "$0.15", business: "$0.12", enterprise: "Custom" },
  { feature: "AI Image Generation", starter: true, pro: true, business: true, enterprise: true },
  { feature: "AI Video Generation", starter: true, pro: true, business: true, enterprise: true },
  { feature: "Ad Copy Generation", starter: true, pro: true, business: true, enterprise: true },
  { feature: "Brand Extraction", starter: false, pro: true, business: true, enterprise: true },
  { feature: "Priority Generation", starter: false, pro: true, business: true, enterprise: true },
  { feature: "All Aspect Ratios", starter: true, pro: true, business: true, enterprise: true },
  { feature: "Project Organization", starter: true, pro: true, business: true, enterprise: true },
  { feature: "Bulk Downloads", starter: false, pro: false, business: true, enterprise: true },
  { feature: "API Access", starter: false, pro: false, business: "Coming Soon", enterprise: true },
  { feature: "Team Management", starter: false, pro: false, business: false, enterprise: true },
  { feature: "Dedicated Support", starter: false, pro: false, business: false, enterprise: true },
  { feature: "SLA Guarantee", starter: false, pro: false, business: false, enterprise: true },
];

// FAQ data
const FAQS = [
  {
    question: "What are credits?",
    answer:
      "Credits are the currency you use to generate assets on our platform. Different types of generations cost different amounts: images cost 1 credit, videos cost 5 credits, and ad copy costs 0.5 credits. You purchase credits upfront and use them whenever you need.",
  },
  {
    question: "Do credits expire?",
    answer:
      "No, your credits never expire. Once purchased, they remain in your account until you use them. Generate assets at your own pace without worrying about deadlines.",
  },
  {
    question: "What if a generation fails?",
    answer:
      "If a generation fails due to a system error, your credits are automatically refunded to your account. You can check your credit history to see all transactions including refunds.",
  },
  {
    question: "Can I get a refund for unused credits?",
    answer:
      "We offer refunds for unused credits within 14 days of purchase, minus any credits already used. Contact our support team at support@adassets.io to request a refund.",
  },
  {
    question: "How does priority generation work?",
    answer:
      "Pro and Business users get priority generation, meaning your requests are processed before standard users during high-traffic periods. This ensures faster turnaround times when you need assets quickly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. We also support Apple Pay and Google Pay.",
  },
  {
    question: "Can I buy more credits anytime?",
    answer:
      "Yes! You can purchase additional credits at any time. Your new credits are added to your existing balance immediately after payment confirmation.",
  },
  {
    question: "What's included in Enterprise?",
    answer:
      "Enterprise plans include custom credit volumes with volume discounts, dedicated support, custom integrations, SLA guarantees, team management features, and white-label options. Contact us at sales@adassets.io for a custom quote.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b-4 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary" />
              <span className="text-xl font-black tracking-tight">AD ASSETS</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                Features
              </Link>
              <span className="text-sm font-bold uppercase tracking-wide text-primary">
                Pricing
              </span>
              <Link href="/#how-it-works" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/login" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-primary text-primary-foreground font-bold uppercase tracking-wide border-4 border-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <Link
                href="/signup"
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wide border-2 border-foreground"
              >
                Start
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-2 border-4 border-foreground bg-card mb-6">
            <span className="text-sm font-bold uppercase tracking-widest">TRANSPARENT PRICING</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
            PAY FOR WHAT
            <br />
            <span className="text-primary">YOU USE</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            No subscriptions. No hidden fees. Buy credits and use them whenever you need.
            Credits never expire.
          </p>
        </div>
      </section>

      {/* Credit Costs Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-card border-y-4 border-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">CREDIT COSTS</h2>
            <p className="text-muted-foreground">Know exactly what you&apos;re paying for</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_COSTS.map((item) => (
              <div key={item.type} className="p-4 border-4 border-foreground bg-background">
                <div className="text-3xl font-black text-primary mb-1">{item.cost}</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  credit{item.cost !== 1 ? "s" : ""}
                </div>
                <div className="font-bold uppercase tracking-tight">{item.type}</div>
                <div className="text-sm text-muted-foreground mt-1">{item.example}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 border-4 ${
                  pkg.popular
                    ? "border-primary bg-primary/5 relative"
                    : "border-foreground bg-card"
                } flex flex-col`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-wide border-2 border-foreground whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{pkg.description}</p>
                </div>
                <div className="mb-4">
                  {pkg.isEnterprise ? (
                    <>
                      <div className="text-3xl font-black">Custom</div>
                      <div className="text-sm text-muted-foreground">Contact for pricing</div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black">${pkg.price}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.credits} credits &bull; ${(pkg.price / pkg.credits).toFixed(2)}/credit
                      </div>
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary mt-1.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {pkg.limitations?.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-muted mt-1.5 flex-shrink-0" />
                      <span className="text-sm line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>
                {pkg.isEnterprise ? (
                  <a
                    href="mailto:sales@adassets.io"
                    className="block w-full py-3 text-center font-black uppercase tracking-wide border-4 border-foreground bg-card hover:bg-accent transition-colors text-sm"
                  >
                    Contact Sales
                  </a>
                ) : (
                  <Link
                    href="/signup"
                    className={`block w-full py-3 text-center font-black uppercase tracking-wide border-4 transition-colors text-sm ${
                      pkg.popular
                        ? "bg-primary text-primary-foreground border-foreground hover:bg-primary/90"
                        : "bg-card border-foreground hover:bg-accent"
                    }`}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-y-4 border-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">
              COMPARE PLANS
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See exactly what&apos;s included in each plan
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-foreground bg-background">
              <thead>
                <tr className="border-b-4 border-foreground">
                  <th className="p-4 text-left font-black uppercase tracking-wide">Feature</th>
                  <th className="p-4 text-center font-black uppercase tracking-wide border-l-2 border-foreground">Starter</th>
                  <th className="p-4 text-center font-black uppercase tracking-wide border-l-2 border-foreground bg-primary/10">Pro</th>
                  <th className="p-4 text-center font-black uppercase tracking-wide border-l-2 border-foreground">Business</th>
                  <th className="p-4 text-center font-black uppercase tracking-wide border-l-2 border-foreground">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_COMPARISON.map((row, index) => (
                  <tr key={row.feature} className={index < FEATURE_COMPARISON.length - 1 ? "border-b-2 border-foreground" : ""}>
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center border-l-2 border-foreground">
                      {renderComparisonValue(row.starter)}
                    </td>
                    <td className="p-4 text-center border-l-2 border-foreground bg-primary/5">
                      {renderComparisonValue(row.pro)}
                    </td>
                    <td className="p-4 text-center border-l-2 border-foreground">
                      {renderComparisonValue(row.business)}
                    </td>
                    <td className="p-4 text-center border-l-2 border-foreground">
                      {renderComparisonValue(row.enterprise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-4">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about credits and billing
            </p>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="border-4 border-foreground bg-card">
                <div className="p-4 sm:p-6">
                  <h3 className="font-black uppercase tracking-tight mb-3 text-lg">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-foreground text-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase mb-6">
            READY TO CREATE?
          </h2>
          <p className="text-xl mb-8 opacity-80">
            Start with any plan and generate professional ad assets in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide border-4 border-background hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
            <a
              href="mailto:sales@adassets.io"
              className="px-8 py-4 bg-transparent font-black text-lg uppercase tracking-wide border-4 border-background hover:bg-background/10 transition-colors"
            >
              Contact Sales
            </a>
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
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><span className="text-sm text-foreground font-medium">Pricing</span></li>
                <li><Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link></li>
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
              &copy; {new Date().getFullYear()} Ad Assets Generator. All rights reserved.
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

// Helper function to render comparison table values
function renderComparisonValue(value: boolean | string) {
  if (value === true) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 bg-primary">
        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="inline-flex items-center justify-center w-6 h-6 bg-muted">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  return <span className="font-bold">{value}</span>;
}
