import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center font-bold uppercase tracking-wide",
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        default: "bg-card text-foreground border-4 border-foreground",
        primary: "bg-primary text-primary-foreground border-4 border-foreground",
        secondary: "bg-secondary text-secondary-foreground border-4 border-foreground",
        success: "bg-green-500 text-white border-4 border-foreground",
        warning: "bg-yellow-500 text-black border-4 border-foreground",
        info: "bg-blue-500 text-white border-4 border-foreground",
        error: "bg-destructive text-destructive-foreground border-4 border-foreground",
        outline: "bg-transparent text-foreground border-4 border-foreground",
      },
      size: {
        xs: "px-2 py-0.5 text-[10px] border-2",
        sm: "px-2.5 py-1 text-xs border-3",
        md: "px-3 py-1.5 text-sm border-4",
        lg: "px-4 py-2 text-base border-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
