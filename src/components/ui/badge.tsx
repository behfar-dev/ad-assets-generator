import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center border px-2.5 py-0.5 font-medium",
    "transition-colors duration-200",
  ],
  {
    variants: {
      variant: {
        default: "bg-white/[0.04] text-white/70 border-white/[0.08]",
        primary: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        secondary: "bg-white/[0.06] text-white/60 border-white/[0.1]",
        success: "bg-green-500/20 text-green-400 border-green-500/30",
        warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        error: "bg-red-500/20 text-red-400 border-red-500/30",
      },
      background: {
        default: "",
        outline: "bg-transparent",
        alpha: "",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px]",
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      },
    },
    compoundVariants: [
      {
        background: "alpha",
        variant: "success",
        className: "bg-green-500/10 border-transparent text-green-400",
      },
      {
        background: "alpha",
        variant: "warning",
        className: "bg-yellow-500/10 border-transparent text-yellow-400",
      },
    ],
    defaultVariants: {
      variant: "default",
      background: "default",
      size: "sm",
    },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, background, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, background, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
