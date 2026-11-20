import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Badge */
/* -------------------------------------------------------------------------- */

type BadgeTone =
  | "neutral"
  | "brand"
  | "accent"
  | "urgent"
  | "success"
  | "outline"
  | "inverse";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-brand-900 text-white",
  urgent: "bg-ink-900 text-white",
  success: "bg-emerald-50 text-emerald-700",
  outline: "border border-line-strong text-content-muted",
  inverse: "bg-white/10 text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-medium",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * The small capsule used above headlines — a bordered pill with a status dot,
 * as on the reference layout.
 */
export function Capsule({
  className,
  children,
  inverse = false,
}: {
  className?: string;
  children: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-none border px-3.5 py-1.5",
        "text-[0.6875rem] font-semibold uppercase tracking-[0.14em]",
        inverse
          ? "border-white/20 bg-white/8 text-white/80 backdrop-blur-sm"
          : "border-line-strong bg-surface text-content-muted",
        className,
      )}
    >
      {/* The dot must contrast with whichever ground the capsule sits on. */}
      <span aria-hidden className="relative flex size-1.5">
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping opacity-70",
            inverse ? "bg-white" : "bg-brand-900",
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-1.5",
            inverse ? "bg-white" : "bg-brand-900",
          )}
        />
      </span>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Card */
/* -------------------------------------------------------------------------- */

export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-none border border-line bg-surface-raised shadow-soft",
        interactive &&
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Section scaffolding */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  className,
  children,
  inverse = false,
}: {
  className?: string;
  children: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]",
        inverse ? "text-brand-200" : "text-brand-600",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5", inverse ? "bg-brand-200" : "bg-brand-900")}
      />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
  inverse = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
  /** Set on navy bands so the type flips to white. */
  inverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow ? <Eyebrow inverse={inverse}>{eyebrow}</Eyebrow> : null}
        <h2
          className={cn(
            "mt-3.5 text-3xl sm:text-4xl",
            inverse ? "text-white" : "text-content",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3.5 text-base leading-relaxed",
              inverse ? "text-white/80" : "text-content-muted",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Section rhythm. The page is white, so bands alternate between:
 *   default — plain white
 *   muted   — a light grey band
 *   navy    — a deep navy band (white type, white cards sit on it at 14.5:1)
 *
 * `muted` is kept as a boolean for the existing call sites; `tone` wins when
 * both are given.
 */
export function Section({
  className,
  muted = false,
  tone,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  muted?: boolean;
  tone?: "default" | "muted" | "navy";
}) {
  const resolved = tone ?? (muted ? "muted" : "default");
  return (
    <section
      className={cn(
        "py-14 sm:py-16 lg:py-20",
        resolved === "muted" && "border-y border-line bg-surface-muted",
        resolved === "navy" && "bg-navy-panel",
        className,
      )}
      {...props}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

/**
 * A white card that sits on the tinted page background — the primary content
 * container in this layout system.
 */
export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-none border border-line bg-surface p-6 shadow-soft sm:p-8 lg:p-10",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty / error states */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  inverse = false,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Set on navy bands so the type stays legible. */
  inverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-none border border-dashed px-6 py-16 text-center",
        inverse ? "border-white/25 bg-white/5" : "border-line-strong bg-surface",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "mb-5 flex size-14 items-center justify-center rounded-none [&_svg]:size-6",
            inverse ? "bg-white/10 text-white" : "bg-brand-50 text-brand-600",
          )}
        >
          {icon}
        </div>
      ) : null}
      <h3 className={cn("text-lg", inverse ? "text-white" : "text-content")}>{title}</h3>
      {description ? (
        <p
          className={cn(
            "mt-2.5 max-w-md text-sm leading-relaxed",
            inverse ? "text-white/80" : "text-content-muted",
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
