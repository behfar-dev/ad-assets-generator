import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "border",
    "font-sans font-medium transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20",
    "gap-1.5 [&>svg]:stroke-[1.5] [&>svg]:h-5 [&>svg]:w-5",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white/[0.03] text-white/90 border-white/[0.08]",
          "hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12]",
          "data-[state=open]:bg-white/[0.06]",
          "[&>svg]:text-white/50",
        ],
        primary: [
          "bg-purple-600 text-white hover:bg-purple-500 border-purple-700",
          "[&>svg]:text-white/70",
        ],
        ghost: [
          "border-transparent bg-transparent text-white/70",
          "hover:bg-white/[0.04] hover:text-white",
          "data-[state=open]:bg-white/[0.04]",
          "[&>svg]:text-white/40",
        ],
        outline: [
          "bg-transparent text-white/80 border-white/[0.12]",
          "hover:bg-white/[0.04] hover:text-white hover:border-white/[0.16]",
        ],
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-sm [&>svg]:h-4 [&>svg]:w-4",
        lg: "h-11 px-6",
        xl: "h-12 px-7 py-2 text-lg",
        xs: "h-8 px-2.5 text-xs [&>svg]:h-3.5 [&>svg]:w-3.5",
        icon: "h-10 w-10 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-current",
        "icon-sm": "h-9 w-9 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
