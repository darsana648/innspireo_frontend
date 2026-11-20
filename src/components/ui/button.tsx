import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "navy"
  | "secondary"
  | "outline"
  | "ghost"
  | "inverse"
  | "white";
type Size = "sm" | "md" | "lg";

// Joined with an explicit separator rather than `+`, so a missing trailing
// space can never silently glue two class names into one that Tailwind drops.
const base = [
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap",
  "rounded-none transition-all duration-200",
  "disabled:pointer-events-none disabled:opacity-50",
  "active:translate-y-px [&_svg]:shrink-0",
  // A trailing arrow slides a little on hover. Scoped to svg:last-child so a
  // leading icon (Save, Upload) stays put, and so buttons without an arrow
  // are untouched.
  "[&>svg:last-child]:transition-transform [&>svg:last-child]:duration-300",
  "hover:[&>svg:last-child]:translate-x-0.5",
].join(" ");

const variants: Record<Variant, string> = {
  /** Solid navy — the main conversion action. */
  primary:
    "btn-sweep bg-brand-900 text-white shadow-soft hover:bg-brand-800 hover:shadow-card",
  /** Same navy weight; kept as a distinct name for nav-bar and utility CTAs. */
  navy: "btn-sweep bg-ink-900 text-white shadow-soft hover:bg-ink-800 hover:shadow-card",
  secondary:
    "bg-brand-50 text-brand-700 hover:bg-brand-100",
  outline:
    "border border-line-strong bg-surface text-content hover:border-ink-900 hover:bg-ink-50",
  ghost: "text-content-muted hover:bg-ink-50 hover:text-content",
  /** On navy panels. */
  inverse:
    "bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm hover:bg-white/18",
  white: "bg-white text-ink-900 shadow-soft hover:bg-ink-50 hover:shadow-card",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm [&_svg]:size-4",
  md: "h-11 px-5 text-sm [&_svg]:size-4",
  lg: "h-13 px-7 text-base [&_svg]:size-4.5",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}
