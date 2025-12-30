import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "font-bold uppercase tracking-wide transition-all duration-150",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "gap-2 [&>svg]:h-5 [&>svg]:w-5",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground border-4 border-foreground",
          "hover:bg-primary/90 hover:translate-x-[2px] hover:translate-y-[2px]",
          "shadow-brutal hover:shadow-none",
          "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground border-4 border-foreground",
          "hover:bg-secondary/80 hover:translate-x-[2px] hover:translate-y-[2px]",
          "shadow-brutal hover:shadow-none",
          "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground border-4 border-foreground",
          "hover:bg-destructive/90 hover:translate-x-[2px] hover:translate-y-[2px]",
          "shadow-brutal hover:shadow-none",
          "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ],
        outline: [
          "bg-background text-foreground border-4 border-foreground",
          "hover:bg-accent hover:translate-x-[2px] hover:translate-y-[2px]",
          "shadow-brutal hover:shadow-none",
          "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ],
        ghost: [
          "border-4 border-transparent bg-transparent text-foreground",
          "hover:bg-accent hover:border-foreground/20",
        ],
        link: [
          "text-primary underline-offset-4 hover:underline",
          "border-none bg-transparent",
        ],
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-xs [&>svg]:h-4 [&>svg]:w-4",
        lg: "h-14 px-8 text-base",
        xl: "h-16 px-10 text-lg",
        icon: "h-11 w-11 [&>svg]:w-5 [&>svg]:h-5",
        "icon-sm": "h-9 w-9 [&>svg]:w-4 [&>svg]:h-4",
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
