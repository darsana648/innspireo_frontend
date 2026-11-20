"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Fades a block up as it scrolls into view.
 *
 * Deliberately restrained: one short movement, once, never on the way out.
 * Anything livelier reads as a template rather than a company that places
 * people in five-star hotels.
 *
 * SAFETY: the element starts hidden, so three separate things make sure it
 * cannot stay that way —
 *   1. no IntersectionObserver (very old browsers) reveals immediately;
 *   2. a timeout reveals everything after 1.2s whatever the observer did;
 *   3. a <noscript> rule in the root layout unhides all of them when
 *      JavaScript never runs at all.
 * `prefers-reduced-motion` is honoured by the stylesheet, not here.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in milliseconds. Keep under ~240 or it feels sluggish. */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = React.useRef<HTMLElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Fire slightly before the block reaches the bottom edge, so the motion
      // has finished by the time it is properly in view.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);

    const failsafe = window.setTimeout(() => setShown(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      // One ref type for four possible tags; the cast keeps the call sites
      // clean without widening the public prop type.
      ref={ref as React.Ref<never>}
      data-reveal={shown ? "in" : "out"}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("reveal", className)}
    >
      {children}
    </Tag>
  );
}
