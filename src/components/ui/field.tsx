import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Joined with an explicit separator rather than `+`, so a missing trailing
// space can never silently glue two class names into one that Tailwind drops.
const fieldBase = [
  "w-full rounded-none border border-line-strong bg-surface text-content",
  "placeholder:text-content-subtle transition-colors duration-200",
  "hover:border-ink-400 focus:border-brand-700 focus:outline-none",
  "focus:ring-4 focus:ring-brand-500/12 disabled:opacity-60",
].join(" ");

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label
      className={cn("mb-1.5 flex items-baseline justify-between gap-2", className)}
      {...props}
    >
      <span className="text-sm font-medium text-content">{children}</span>
      {hint ? <span className="text-xs text-content-subtle">{hint}</span> : null}
    </label>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon, ...props },
  ref,
) {
  if (icon) {
    return (
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle [&_svg]:size-4.5"
        >
          {icon}
        </span>
        <input
          ref={ref}
          className={cn(fieldBase, "h-11 pl-11 pr-3.5 text-sm", className)}
          {...props}
        />
      </div>
    );
  }
  return (
    <input ref={ref} className={cn(fieldBase, "h-11 px-3.5 text-sm", className)} {...props} />
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 5, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldBase, "resize-y px-3.5 py-3 text-sm", className)}
      {...props}
    />
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          fieldBase,
          "h-11 cursor-pointer appearance-none pl-3.5 pr-10 text-sm",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-content-subtle"
      />
    </div>
  );
});

export function Checkbox({
  className,
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-none border-line-strong",
          "text-brand-600 accent-brand-500 focus:ring-2 focus:ring-brand-500/25",
          className,
        )}
        {...props}
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-content-muted">
        {label}
      </label>
    </div>
  );
}

/** Inline validation / helper text under a field. */
export function FieldHint({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <p
      className={cn(
        "mt-1.5 text-xs",
        tone === "error" ? "text-rose-600" : "text-content-subtle",
      )}
    >
      {children}
    </p>
  );
}
