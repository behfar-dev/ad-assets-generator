"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { KeyIcon, CheckIcon, SettingsIcon } from "@/components/ui/icons";
import { useUserFalKey } from "@/lib/use-user-fal-key";

export function ApiKeyStatus() {
  const { hasUserKey } = useUserFalKey();

  if (hasUserKey) {
    return (
      <Badge variant="success" size="xs" className="gap-1">
        <CheckIcon className="h-3 w-3" />
        API Key Active
      </Badge>
    );
  }

  return (
    <Badge variant="warning" size="xs" className="gap-1">
      <KeyIcon className="h-3 w-3" />
      Rate Limited
    </Badge>
  );
}

export function ApiKeyDialog() {
  const { userKey, setUserKey, hasUserKey, clearUserKey } = useUserFalKey();
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (inputValue.trim()) {
      setUserKey(inputValue.trim());
      setInputValue("");
    }
  };

  const handleClear = () => {
    clearUserKey();
  };

  const maskedKey = userKey
    ? showKey
      ? userKey
      : `${userKey.slice(0, 8)}${"•".repeat(20)}${userKey.slice(-4)}`
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          <span>API Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>fal.ai API Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {hasUserKey ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Your API Key</span>
                <Badge variant="success" size="xs">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-mono text-white/50 break-all">
                  {maskedKey}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Hide" : "Show"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="flex-1 text-red-400 hover:text-red-300"
                >
                  Remove Key
                </Button>
              </div>
              <p className="text-xs text-white/40">
                Using your own API key - no rate limits, all models available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-white/60">
                Add your fal.ai API key to bypass rate limits and access all models.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="Enter your fal.ai API key..."
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={handleSave}
                  disabled={!inputValue.trim()}
                  size="sm"
                >
                  Save
                </Button>
              </div>
              <div className="border border-white/[0.08] bg-white/[0.02] p-3 space-y-2">
                <p className="text-xs text-white/40">
                  Without an API key:
                </p>
                <ul className="text-xs text-white/40 space-y-1 ml-4 list-disc">
                  <li>Limited to 10 requests per day</li>
                  <li>Only FLUX models available</li>
                </ul>
              </div>
              <p className="text-xs text-white/40">
                Get your API key from{" "}
                <a
                  href="https://fal.ai/dashboard/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  fal.ai/dashboard/keys
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickApiKeyPopover() {
  const { userKey, setUserKey, hasUserKey, clearUserKey } = useUserFalKey();
  const [inputValue, setInputValue] = useState("");

  const handleSave = () => {
    if (inputValue.trim()) {
      setUserKey(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <ApiKeyStatus />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-white">API Key</span>
            {hasUserKey && (
              <Badge variant="success" size="xs">
                Active
              </Badge>
            )}
          </div>
          {hasUserKey ? (
            <div className="space-y-2">
              <p className="text-xs text-white/40">
                Your API key is active. No rate limits apply.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearUserKey}
                className="w-full text-red-400 hover:text-red-300"
              >
                Remove Key
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="Paste your API key..."
                className="font-mono text-xs"
              />
              <Button
                onClick={handleSave}
                disabled={!inputValue.trim()}
                size="sm"
                className="w-full"
              >
                Save Key
              </Button>
              <p className="text-xs text-white/40">
                Add your key to remove rate limits
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
