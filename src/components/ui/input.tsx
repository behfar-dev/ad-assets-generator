import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          [
            "flex h-12 w-full",
            "border-4 border-foreground px-4 py-2",
            "bg-background text-foreground",
            "text-base font-medium transition-all duration-150",
            "file:border-0 file:bg-transparent file:text-sm file:font-bold file:uppercase file:text-foreground",
            "placeholder:text-muted-foreground",
            "hover:bg-accent/50",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted",
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
