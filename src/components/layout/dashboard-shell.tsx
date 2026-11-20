import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, User, FileText, Bookmark } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/profile", label: "My profile", icon: <User /> },
  { href: "/applications", label: "Applications", icon: <FileText /> },
  { href: "/saved-jobs", label: "Saved jobs", icon: <Bookmark /> },
];

/**
 * Chrome for the signed-in candidate area.
 *
 * Auth state is not handled here — each page wraps its own content in
 * `AccountGate`, so the heading and side nav stay visible while the gate
 * explains why the content below it is empty.
 */
export function DashboardShell({
  title,
  description,
  active,
  children,
}: {
  title: string;
  description?: string;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-10 sm:py-12">
          <h1 className="text-3xl text-content sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-2.5 max-w-2xl text-base leading-relaxed text-content-muted">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <div className="container-page py-8 sm:py-10">
        {/* grid-cols-1 and minmax(0,...) on both sides. A bare `grid` leaves its
            implicit column at `auto`, so the horizontally-scrolling side nav's
            min-content width (457px) became the page width and every dashboard
            screen scrolled sideways on a phone. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <aside className="min-w-0">
            <nav aria-label="Candidate area" className="lg:sticky lg:top-24">
              <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                {NAV.map((item) => {
                  const isActive = item.href === active;
                  return (
                    <li key={item.href} className="shrink-0 lg:shrink">
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex w-full items-center gap-2.5 rounded-none px-3.5 py-2.5",
                          "text-sm font-medium transition-colors [&_svg]:size-4",
                          isActive
                            ? "bg-brand-900 text-white shadow-soft"
                            : "text-content-muted hover:bg-surface-muted hover:text-content",
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </>
  );
}
