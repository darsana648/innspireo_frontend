import Link from "next/link";
import { ShieldCheck, FileCheck2, Bell, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { LogoMark } from "./logo";

const BENEFITS = [
  {
    icon: <FileCheck2 />,
    title: "Apply once, stay on file",
    body: "Your CV and documents are reused for every future vacancy — no re-uploading.",
  },
  {
    icon: <Bell />,
    title: "First to know",
    body: "Get told when a role opens in your department and preferred destination.",
  },
  {
    icon: <ShieldCheck />,
    title: "Never a fee",
    body: "Candidates are never charged to apply or to be placed through Innspireo.",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link
            href="/jobs"
            className="-my-1.5 inline-flex min-h-11 items-center gap-1.5 py-1.5 text-sm text-content-muted transition-colors hover:text-content"
          >
            <ArrowLeft className="size-4" />
            Back to jobs
          </Link>

          <h1 className="mt-7 text-3xl text-content">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-7 border-t border-line pt-6 text-sm text-content-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-navy-panel lg:block">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 size-[28rem] rounded-none bg-white/5 blur-3xl"
        />

        <div className="relative flex h-full flex-col justify-center px-12 py-16 xl:px-16">
          <LogoMark className="size-12" />
          <Badge tone="inverse" className="mt-8 w-fit">
            For candidates
          </Badge>
          <h2 className="mt-5 max-w-md font-display text-3xl font-bold text-white text-balance-tight xl:text-4xl">
            One profile. Every hospitality vacancy we place.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Innspireo places chefs, F&amp;B, front office and housekeeping professionals with
            hotels and catering groups across the Gulf and Europe.
          </p>

          <ul className="mt-10 max-w-md space-y-6">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-none bg-white/10 text-brand-300 ring-1 ring-inset ring-white/15 [&_svg]:size-5">
                  {b.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{b.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{b.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
