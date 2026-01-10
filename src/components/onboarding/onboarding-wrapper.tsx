"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { OnboardingModal } from "./onboarding-modal";

export function OnboardingWrapper() {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (status !== "authenticated" || !session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/onboarding");
        if (response.ok) {
          const data = await response.json();
          setShowOnboarding(!data.onboardingCompleted);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [session, status]);

  // Don't render anything while checking status or if loading
  if (isLoading || status === "loading") {
    return null;
  }

  // Don't show onboarding if not authenticated
  if (status !== "authenticated") {
    return null;
  }

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onComplete={() => setShowOnboarding(false)}
    />
  );
}
