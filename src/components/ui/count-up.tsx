"use client";

import * as React from "react";

/** useLayoutEffect on the client, useEffect on the server (which warns otherwise). */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Ease-out-expo: fast off the mark, long settle. Reads as deliberate, not frantic. */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Counts a number up when it scrolls into view.
 *
 * Takes the raw display string so the surrounding words survive: "Nearly 30
 * years" animates only the 30, and "500+" keeps its plus. If there is no
 * number at all it just renders the string.
 *
 * The server renders the FINAL value, so the page is correct before any
 * JavaScript runs and there is no layout shift when the digits grow. The reset
 * to zero happens in a layout effect — before paint — so nobody sees the final
 * number flash first.
 */
export function CountUp({
  value,
  duration = 1600,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const match = React.useMemo(() => value.match(/\d[\d,]*\.?\d*/), [value]);
  const target = match ? Number(match[0].replace(/,/g, "")) : null;

  const ref = React.useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = React.useState<number | null>(target);
  const started = React.useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (target === null || prefersReducedMotion()) return;
    setCurrent(0);
  }, [target]);

  React.useEffect(() => {
    if (target === null || prefersReducedMotion()) return;
    const node = ref.current;
    if (!node) return;

    const run = () => {
      if (started.current) return;
      started.current = true;

      const start = performance.now();
      let frame = 0;

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setCurrent(Math.round(target * easeOutExpo(progress)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    // If the observer never fires — an element that is never quite 40% visible,
    // say — show the real number rather than leaving a zero on the page.
    const failsafe = window.setTimeout(() => {
      if (!started.current) setCurrent(target);
    }, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [target, duration]);

  if (target === null || current === null) {
    return <span className={className}>{value}</span>;
  }

  // Put the animated digits back where they came from in the original string.
  const rendered = match ? value.replace(match[0], current.toLocaleString("en-IN")) : value;

  return (
    <span ref={ref} className={className}>
      {rendered}
    </span>
  );
}
