"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FolderPlus,
  Palette,
  Wand2,
  Download,
  ChevronRight,
  ChevronLeft,
  Rocket,
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to Ad Assets",
    description:
      "Generate stunning ad creatives powered by AI. Let's show you around in 4 quick steps.",
    icon: Rocket,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Ad Assets Generator helps you create professional ad images, videos,
          and copy in minutes. No design skills required.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border-4 border-foreground/20 p-3">
            <div className="text-2xl font-black">AI</div>
            <div className="text-xs text-muted-foreground">Powered</div>
          </div>
          <div className="border-4 border-foreground/20 p-3">
            <div className="text-2xl font-black">1-Click</div>
            <div className="text-xs text-muted-foreground">Generation</div>
          </div>
          <div className="border-4 border-foreground/20 p-3">
            <div className="text-2xl font-black">Pro</div>
            <div className="text-xs text-muted-foreground">Quality</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "1. Create a Project",
    description:
      "Projects help you organize your brand assets and generated content.",
    icon: FolderPlus,
    content: (
      <div className="space-y-4">
        <div className="border-4 border-primary bg-primary/5 p-4">
          <p className="font-bold mb-2">Start by creating a project:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">→</span>
              Click &quot;New Project&quot; on your dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">→</span>
              Give it a name and optional description
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">→</span>
              Add your website URL to auto-extract brand info
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: Each project can have its own brand colors, logos, and generated
          assets.
        </p>
      </div>
    ),
  },
  {
    id: 3,
    title: "2. Extract Your Brand",
    description:
      "Let AI analyze your website and extract brand elements automatically.",
    icon: Palette,
    content: (
      <div className="space-y-4">
        <div className="border-4 border-primary bg-primary/5 p-4">
          <p className="font-bold mb-2">Brand extraction captures:</p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary" />
              <span className="text-sm">Colors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-foreground font-bold text-xs flex items-center justify-center">
                A
              </div>
              <span className="text-sm">Typography</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-foreground" />
              <span className="text-sm">Logos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted-foreground/30" />
              <span className="text-sm">Images</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          You can also manually upload brand assets like logos and product
          images.
        </p>
      </div>
    ),
  },
  {
    id: 4,
    title: "3. Generate Assets",
    description:
      "Create AI-powered images, videos, and ad copy with a single click.",
    icon: Wand2,
    content: (
      <div className="space-y-4">
        <div className="border-4 border-primary bg-primary/5 p-4">
          <p className="font-bold mb-2">What you can generate:</p>
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ad Images</span>
              <span className="text-xs font-mono bg-foreground text-background px-2 py-0.5">
                1 credit
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ad Videos</span>
              <span className="text-xs font-mono bg-foreground text-background px-2 py-0.5">
                5 credits
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ad Copy</span>
              <span className="text-xs font-mono bg-foreground text-background px-2 py-0.5">
                0.5 credits
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose from multiple aspect ratios: 9:16 (Stories), 1:1 (Feed), 16:9
          (YouTube), and more.
        </p>
      </div>
    ),
  },
  {
    id: 5,
    title: "4. Download & Use",
    description: "Export your assets and use them across all platforms.",
    icon: Download,
    content: (
      <div className="space-y-4">
        <div className="border-4 border-primary bg-primary/5 p-4">
          <p className="font-bold mb-2">Export options:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">→</span>
              Download individual assets
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">→</span>
              Bulk download as ZIP
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-primary">→</span>
              Copy ad text directly
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          All generated assets are saved to your project for easy access later.
        </p>
      </div>
    ),
  },
];

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      onComplete();
      router.refresh();
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      onComplete();
      router.refresh();
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIcon = step.icon;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 border-4 border-primary bg-primary/10 flex items-center justify-center">
              <StepIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg sm:text-xl">
                {step.title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {step.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">{step.content}</div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2.5 h-2.5 border-2 border-foreground transition-colors ${
                index === currentStep
                  ? "bg-primary border-primary"
                  : index < currentStep
                    ? "bg-foreground"
                    : "bg-transparent"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <div>
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={isSubmitting}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-muted-foreground"
            >
              Skip tour
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? (
                "Saving..."
              ) : isLastStep ? (
                <>
                  Get Started
                  <Rocket className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
