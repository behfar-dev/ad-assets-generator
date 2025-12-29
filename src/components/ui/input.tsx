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
            "flex h-10 w-full",
            "border px-3 py-2",
            "border-white/[0.08] bg-white/[0.03] text-white",
            "text-sm font-medium transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white/70",
            "placeholder:text-white/30",
            "hover:bg-white/[0.05] hover:border-white/[0.12]",
            "focus:bg-white/[0.05] focus:border-white/[0.16] focus:outline-none focus:ring-1 focus:ring-white/10",
            "disabled:cursor-not-allowed disabled:opacity-40",
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
