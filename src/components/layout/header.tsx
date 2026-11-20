"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  LayoutDashboard,
  User as UserIcon,
  FileText,
  Bookmark,
  LogOut,
  MailWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClass } from "@/components/ui/button";
import { SITE, jobsUrl } from "@/lib/constants";
import { Logo } from "./logo";
import { useAuth } from "@/components/auth/auth-provider";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: jobsUrl("/jobs") },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  {
    label: "Resources",
    href: "/blogs",
    children: [
      { label: "Career Insights", href: "/blogs", description: "Guides and industry notes" },
      { label: "FAQs", href: "/faqs", description: "How placement works" },
      { label: "Contact", href: "/contact", description: "Talk to our team" },
    ],
  },
  { label: "Hire With Us", href: "/hire-with-us" },
];

/** Where a signed-in candidate can go. Shared by the desktop menu and drawer. */
const ACCOUNT_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/profile", label: "My profile", icon: <UserIcon /> },
  { href: "/applications", label: "Applications", icon: <FileText /> },
  { href: "/saved-jobs", label: "Saved jobs", icon: <Bookmark /> },
];

function initials(name: string, email: string): string {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/**
 * Desktop account menu. Replaces "Sign in / Create profile" once there is a
 * session, which is what tells a signed-in visitor the site knows who they are.
 */
function AccountMenu({ overlay }: { overlay: boolean }) {
  const { user, isVerified, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-2.5 rounded-none py-1.5 pl-1.5 pr-2.5 text-sm font-medium transition-colors",
          overlay
            ? "text-white hover:bg-white/10"
            : "text-content hover:bg-ink-50",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "grid size-8 shrink-0 place-items-center text-xs font-bold",
            overlay ? "bg-white text-ink-900" : "bg-brand-900 text-white",
          )}
        >
          {initials(user.name, user.email)}
        </span>
        <span className="max-w-[9rem] truncate">{user.name || user.email}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 border border-line bg-surface shadow-lift"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold text-content">
              {user.name || "Your account"}
            </p>
            <p className="mt-0.5 truncate text-xs text-content-subtle">{user.email}</p>
          </div>

          {!isVerified ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-start gap-2 border-b border-line bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900 hover:bg-amber-100"
            >
              <MailWarning aria-hidden className="mt-px size-3.5 shrink-0" />
              Confirm your email to apply and save roles.
            </Link>
          ) : null}

          <ul className="py-1.5">
            {ACCOUNT_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-content-muted transition-colors hover:bg-ink-50 hover:text-content [&_svg]:size-4"
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-line py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-content-muted transition-colors hover:bg-ink-50 hover:text-content [&_svg]:size-4"
            >
              <LogOut />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * A desktop nav item with a submenu.
 *
 * Opens on hover and on click, and closes on pointer-down outside, Escape,
 * mouse-leave, choosing a link, or navigating. The version this replaces was
 * pure CSS — `group-hover` plus `group-focus-within` — which looked fine until
 * someone clicked: focus stayed inside the panel, so it stayed open and sat on
 * top of whichever page they had just navigated to. It also never closed at
 * all on a touch device, where there is no hover to leave.
 *
 * Only one submenu can be open, so `openLabel` is held by the Header.
 */
function NavDropdown({
  item,
  overlay,
  active,
  openLabel,
  setOpenLabel,
  children,
}: {
  item: NavItem;
  overlay: boolean;
  active: boolean;
  openLabel: string | null;
  setOpenLabel: (label: string | null) => void;
  children: React.ReactNode;
}) {
  const isOpen = openLabel === item.label;
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const closeTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpenLabel(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenLabel(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, setOpenLabel]);

  React.useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  // A short grace period on leaving, so the pointer can cross the gap between
  // the trigger and the panel without the menu snapping shut.
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenLabel(null), 140);
  };
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpenLabel(item.label);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setOpenLabel(isOpen ? null : item.label)}
        className={cn(
          "flex items-center gap-1 rounded-none px-3.5 py-2 text-sm font-medium transition-colors",
          overlay
            ? active || isOpen
              ? "bg-white/15 text-white"
              : "text-white/85 hover:bg-white/10 hover:text-white"
            : active || isOpen
              ? "bg-ink-50 text-content"
              : "text-content-muted hover:bg-ink-50 hover:text-content",
        )}
      >
        {item.label}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full w-64 pt-3 transition-all duration-200 ease-out",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {children}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, status, isVerified, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const restoreFocus = React.useRef(false);

  /**
   * Is the page still at the top?
   *
   * Driven by an IntersectionObserver watching a sentinel pinned to the very
   * top of the document, not by a `window.scrollY > 8` check. Two reasons:
   *
   *   - 8px is close enough to zero that scroll restoration, a trackpad
   *     nudge or mobile rubber-banding flips the bar to white while the
   *     visitor is still looking at the top of the hero;
   *   - an observer recomputes on scroll, resize and layout change, so the
   *     state cannot get stuck the way a one-off listener can.
   *
   * The sentinel is 96px tall and absolutely positioned inside a zero-height
   * wrapper, so it occupies no space and shifts nothing.
   */
  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      // No observer: fall back to a plain scroll check rather than leaving
      // the bar stuck transparent over white content further down the page.
      const onScroll = () => setScrolled(window.scrollY > 64);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    setOpen(false);
    // The desktop dropdown has to close on navigation too. The previous
    // CSS-only version used :focus-within, which kept it open after a click
    // because focus stayed inside the panel — so it hung over the next page.
    setOpenMenu(null);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  /** Open the submenu that contains the current page, collapse the rest. */
  React.useEffect(() => {
    const match = NAV.find((item) => item.children?.some((child) => isActive(child.href)));
    setExpanded(match ? match.label : null);
    // isActive is derived from pathname, so pathname is the only real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /**
   * Dismiss on a pointer press outside the drawer, and on Escape. The backdrop
   * absorbs most outside presses on its own, but this also covers the sticky
   * header and anything else that might paint above it.
   */
  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      // Ignore the hamburger itself, or its own click would reopen the drawer
      // immediately after this handler closed it.
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /** Move focus into the drawer on open and hand it back to the trigger. */
  React.useEffect(() => {
    if (open) {
      restoreFocus.current = true;
      closeRef.current?.focus();
    } else if (restoreFocus.current) {
      restoreFocus.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  /**
   * The homepage hero carries a full-bleed photograph that runs to the very top
   * of the page (the hero pulls itself up under this header with a negative
   * margin). While we are at the top of that page the bar goes transparent so
   * the image shows through; as soon as it scrolls it becomes the solid white
   * bar used everywhere else, so nav text never sits on unpredictable pixels.
   */
  const overlay = pathname === "/" && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-none focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* Top-of-page sentinel for the header's transparent state. Zero-height
          wrapper + absolutely positioned child = no layout impact. */}
      <div aria-hidden className="relative h-0">
        <div ref={sentinelRef} className="pointer-events-none absolute inset-x-0 top-0 h-24" />
      </div>

      <header className="sticky top-0 z-50 pt-3 sm:pt-4">
        <div className="container-page">
          <div
            className={cn(
              "flex h-16 items-center justify-between gap-4 rounded-none border px-3 pl-5 transition-all duration-300 sm:px-4 sm:pl-7",
              overlay
                ? "border-white/20 bg-white/5 backdrop-blur-sm"
                : scrolled
                  ? "border-line bg-surface/85 shadow-card backdrop-blur-xl"
                  : "border-line bg-surface shadow-soft",
            )}
          >
            <Link href="/" className="shrink-0" aria-label="Innspireo Careers — home">
              <Logo inverse={overlay} />
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
              {NAV.map((item) =>
                item.children ? (
                  <NavDropdown
                    key={item.label}
                    item={item}
                    overlay={overlay}
                    active={isActive(item.href)}
                    openLabel={openMenu}
                    setOpenLabel={setOpenMenu}
                  >
                    <div className="overflow-hidden rounded-none border border-line bg-surface p-2 shadow-lift">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenMenu(null)}
                            className="flex flex-col gap-0.5 rounded-none px-3 py-2.5 transition-colors hover:bg-ink-50"
                          >
                            <span className="text-sm font-medium text-content">
                              {child.label}
                            </span>
                            {child.description ? (
                              <span className="text-xs text-content-subtle">
                                {child.description}
                              </span>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                  </NavDropdown>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-none px-3.5 py-2 text-sm font-medium transition-colors",
                      // Underline drawn from the left on hover.
                      "after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-px",
                      "after:origin-left after:scale-x-0 after:bg-current",
                      "after:transition-transform after:duration-300 after:ease-out",
                      "hover:after:scale-x-100",
                      overlay
                        ? isActive(item.href)
                          ? "bg-white/15 text-white"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                        : isActive(item.href)
                          ? "bg-ink-50 text-content"
                          : "text-content-muted hover:bg-ink-50 hover:text-content",
                    )}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              {status === "loading" ? (
                // Reserve the space rather than showing "Sign in" and swapping
                // it a moment later — the flicker reads as a bug.
                <div aria-hidden className="h-11 w-44" />
              ) : status === "signed-in" ? (
                <AccountMenu overlay={overlay} />
              ) : (
                <>
                  <Link
                    href={jobsUrl("/login")}
                    className={cn(
                      "rounded-none px-3 py-2 text-sm font-medium transition-colors",
                      overlay
                        ? "text-white/85 hover:text-white"
                        : "text-content-muted hover:text-content",
                    )}
                  >
                    Sign in
                  </Link>
                  <Link
                    href={jobsUrl("/register")}
                    className={buttonClass(overlay ? "white" : "navy", "sm", "pr-3.5")}
                  >
                    Create profile
                    <ArrowUpRight />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile trigger */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                className={cn(
                  "grid size-10 place-items-center rounded-none transition-colors",
                  overlay
                    ? "text-white hover:bg-white/10"
                    : "text-content hover:bg-ink-50",
                )}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile drawer                                                       */}
      {/* Sits above the sticky header (z-[60] vs z-50) so the backdrop also  */}
      {/* covers the bar — a press anywhere off the panel dismisses it.       */}
      {/* `inert` while closed keeps the links out of the tab order and away  */}
      {/* from screen readers without breaking the slide transition.          */}
      {/* ------------------------------------------------------------------ */}
      <div
        id="mobile-nav"
        className={cn("fixed inset-0 z-[60] lg:hidden", !open && "pointer-events-none")}
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink-950/55 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(21rem,86vw)] flex-col",
            "border-l border-line bg-surface shadow-panel",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Drawer header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line pl-5 pr-3">
            <Link href="/" aria-label="Innspireo Careers — home">
              <Logo />
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid size-10 place-items-center text-content-muted transition-colors hover:bg-ink-50 hover:text-content"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Links */}
          <nav
            aria-label="Mobile"
            className="flex-1 overflow-y-auto overscroll-contain px-5 py-6"
          >
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-content-subtle">
              Menu
            </p>

            <ul className="mt-2 flex flex-col">
              {NAV.map((item) => {
                const active = isActive(item.href);

                if (item.children) {
                  const isOpen = expanded === item.label;
                  const panelId = `mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                  return (
                    <li key={item.label} className="border-b border-line">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className={cn(
                          "relative flex w-full items-center justify-between gap-3 py-3.5 text-left",
                          "text-[0.9375rem] font-medium transition-colors",
                          active || isOpen
                            ? "text-brand-700"
                            : "text-content hover:text-brand-700",
                          active &&
                            "before:absolute before:-left-5 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:bg-brand-900",
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden
                          className={cn(
                            "size-4 shrink-0 text-content-subtle transition-transform duration-300",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>

                      <div
                        id={panelId}
                        className={cn(
                          "grid transition-all duration-300 ease-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <ul className="overflow-hidden">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex flex-col gap-0.5 border-l border-line py-2.5 pl-4 transition-colors",
                                  isActive(child.href)
                                    ? "border-brand-900 text-brand-700"
                                    : "text-content-muted hover:border-line-strong hover:text-content",
                                )}
                              >
                                <span className="text-sm font-medium">{child.label}</span>
                                {child.description ? (
                                  <span className="text-xs text-content-subtle">
                                    {child.description}
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          ))}
                          <li aria-hidden className="h-3" />
                        </ul>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.href} className="border-b border-line">
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex items-center justify-between gap-3 py-3.5",
                        "text-[0.9375rem] font-medium transition-colors",
                        active ? "text-brand-700" : "text-content hover:text-brand-700",
                        active &&
                          "before:absolute before:-left-5 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:bg-brand-900",
                      )}
                    >
                      {item.label}
                      <ArrowUpRight
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0",
                          active ? "text-brand-700" : "text-content-subtle",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions + how to reach a human */}
          <div className="shrink-0 border-t border-line bg-surface-muted px-5 py-5">
            {status === "signed-in" && user ? (
              <div>
                <div className="flex items-center gap-3 pb-4">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center bg-brand-900 text-sm font-bold text-white"
                  >
                    {initials(user.name, user.email)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-content">
                      {user.name || "Your account"}
                    </span>
                    <span className="block truncate text-xs text-content-subtle">
                      {user.email}
                    </span>
                  </span>
                </div>

                {!isVerified ? (
                  <p className="mb-3 flex items-start gap-2 border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                    <MailWarning aria-hidden className="mt-px size-3.5 shrink-0" />
                    Confirm your email to apply and save roles.
                  </p>
                ) : null}

                <ul className="grid gap-1 border-t border-line pt-3">
                  {ACCOUNT_NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2.5 py-2 text-sm font-medium text-content-muted transition-colors hover:text-brand-700 [&_svg]:size-4"
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        void signOut();
                      }}
                      className="flex w-full items-center gap-2.5 py-2 text-left text-sm font-medium text-content-muted transition-colors hover:text-brand-700 [&_svg]:size-4"
                    >
                      <LogOut />
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="grid gap-2.5">
                <Link href={jobsUrl("/register")} className={buttonClass("primary", "lg")}>
                  Create your profile
                  <ArrowRight />
                </Link>
                <Link href={jobsUrl("/login")} className={buttonClass("outline", "lg")}>
                  Sign in
                </Link>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4">
              <a
                href={`tel:${SITE.phoneHref}`}
                className="flex items-center gap-2.5 text-sm text-content-muted transition-colors hover:text-brand-700"
              >
                <Phone aria-hidden className="size-4 shrink-0 text-content-subtle" />
                {SITE.phone}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 break-all text-sm text-content-muted transition-colors hover:text-brand-700"
              >
                <Mail aria-hidden className="size-4 shrink-0 text-content-subtle" />
                {SITE.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
