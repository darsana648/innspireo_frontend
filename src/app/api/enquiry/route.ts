import { NextResponse } from "next/server";

/**
 * Enquiry intake for the employer-brief and contact forms.
 *
 * There is no endpoint on the Laravel backend for either of these yet (the
 * live site's `/contact` is a session+CSRF Blade POST that cannot be called
 * cross-origin). Rather than fake a success, this handler forwards the payload
 * to whatever intake URL is configured and tells the client honestly when none
 * is, so the UI can offer a mailto/WhatsApp fallback instead.
 *
 * TO GO LIVE: set ENQUIRY_WEBHOOK_URL in .env.local to any of
 *   - a Laravel API route the backend team adds (preferred)
 *   - a Zapier / Make / n8n catch hook
 *   - a Formspree / Resend-backed function
 * The body below is posted to it as JSON.
 */

const MAX_FIELD = 5_000;

type EnquiryType = "employer" | "contact";

interface Payload {
  type: EnquiryType;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  roles?: string;
  headcount?: string;
  subject?: string;
  message: string;
}

function str(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(body: Record<string, unknown>): {
  data?: Payload;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const type: EnquiryType = body.type === "employer" ? "employer" : "contact";
  const name = str(body.name, 120);
  const email = str(body.email, 180);
  const message = str(body.message, MAX_FIELD);

  if (name.length < 2) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  if (message.length < 10) errors.message = "Please give us a little more detail.";

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors: {},
    data: {
      type,
      name,
      email,
      message,
      phone: str(body.phone, 40) || undefined,
      company: str(body.company, 160) || undefined,
      country: str(body.country, 80) || undefined,
      roles: str(body.roles, 500) || undefined,
      headcount: str(body.headcount, 40) || undefined,
      subject: str(body.subject, 200) || undefined,
    },
  };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: a filled hidden field means a bot.
  if (str(body.website_url)) {
    return NextResponse.json({ ok: true, delivered: true });
  }

  const { data, errors } = validate(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const target = process.env.ENQUIRY_WEBHOOK_URL;

  if (!target) {
    // Nothing configured yet. Say so plainly so the form can show a fallback.
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        message:
          "Enquiry delivery is not configured yet. Set ENQUIRY_WEBHOOK_URL to enable it.",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        source: "jobs.innspireo.com",
        submitted_at: new Date().toISOString(),
      }),
      // Do not let a slow intake hang the request.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "upstream_failed", status: res.status },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}
