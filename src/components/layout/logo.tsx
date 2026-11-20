import { cn } from "@/lib/utils";

/**
 * Compact mark for tight spaces (auth panel, favicons). An abstract doorway —
 * the welcome motif of hospitality — in the brand blue.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" fill="url(#innspireo-mark)" />
      <path
        d="M13 28.5V19a7 7 0 0 1 14 0v9.5"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M11 28.5h18" stroke="#93AACF" strokeWidth="2.6" strokeLinecap="round" />
      <defs>
        <linearGradient id="innspireo-mark" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#2A4A80" />
          <stop offset="1" stopColor="#0F1C33" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Primary wordmark: a tight navy lockup with the accent dot, over a micro
 * descriptor — the pattern used across premium service brands.
 */
export function Logo({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-[-0.045em]",
          inverse ? "text-white" : "text-content",
        )}
      >
        innspireo
        <span className="text-brand-600">.</span>
      </span>
      <span
        className={cn(
          "mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.2em]",
          inverse ? "text-white/55" : "text-content-subtle",
        )}
      >
        Hospitality Careers
      </span>
    </span>
  );
}
