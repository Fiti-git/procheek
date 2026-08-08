import * as React from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-white border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-ink focus:ring-4 focus:ring-ink/10 transition-colors disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block mb-1.5 text-[13px] font-medium text-ink-700",
        className,
      )}
      {...props}
    />
  );
}

export function HelperText({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-xs text-ink-500", className)} {...props} />
  );
}
