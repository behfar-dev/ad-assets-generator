"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "fal-user-api-key";

export interface UseUserFalKeyReturn {
  userKey: string | null;
  setUserKey: (key: string | null) => void;
  hasUserKey: boolean;
  clearUserKey: () => void;
}

/**
 * Hook to manage user's personal fal.ai API key in localStorage
 * When user provides their own key, they bypass rate limits and model restrictions
 */
export function useUserFalKey(): UseUserFalKeyReturn {
  const [userKey, setUserKeyState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserKeyState(stored);
      }
      setIsLoaded(true);
    }
  }, []);

  const setUserKey = useCallback((key: string | null) => {
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem(STORAGE_KEY, key);
        setUserKeyState(key);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setUserKeyState(null);
      }
    }
  }, []);

  const clearUserKey = useCallback(() => {
    setUserKey(null);
  }, [setUserKey]);

  return {
    userKey,
    setUserKey,
    hasUserKey: isLoaded && !!userKey,
    clearUserKey,
  };
}

/**
 * Get user key from localStorage (non-hook version for API calls)
 */
export function getUserFalKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Check if user has their own API key
 */
export function hasUserFalKey(): boolean {
  return !!getUserFalKey();
}
