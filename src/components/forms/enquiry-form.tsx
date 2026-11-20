"use client";

import * as React from "react";
import { Send, CheckCircle2, AlertTriangle, Mail, MessageCircle } from "lucide-react";
import { Input, Label, Select, Textarea, FieldHint } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { SITE, DESTINATIONS } from "@/lib/constants";

type Mode = "employer" | "contact";
type Status = "idle" | "submitting" | "sent" | "fallback" | "error";

interface Fields {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  roles: string;
  headcount: string;
  subject: string;
  message: string;
}

const EMPTY: Fields = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  roles: "",
  headcount: "",
  subject: "",
  message: "",
};

export function EnquiryForm({ mode }: { mode: Mode }) {
  const [fields, setFields] = React.useState<Fields>(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [honeypot, setHoneypot] = React.useState("");

  const set = <K extends keyof Fields>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };

  /** Prefilled email as the fallback when no intake webhook is configured. */
  const mailtoHref = React.useMemo(() => {
    const subject =
      mode === "employer"
        ? `Hiring enquiry — ${fields.company || fields.name || "New enquiry"}`
        : fields.subject || `Enquiry from ${fields.name || "a candidate"}`;

    const lines =
      mode === "employer"
        ? [
          `Name: ${fields.name}`,
          `Company: ${fields.company}`,
          `Email: ${fields.email}`,
          `Phone: ${fields.phone}`,
          `Hiring for: ${fields.country}`,
          `Roles needed: ${fields.roles}`,
          `Headcount: ${fields.headcount}`,
          "",
          fields.message,
        ]
        : [
          `Name: ${fields.name}`,
          `Email: ${fields.email}`,
          `Phone: ${fields.phone}`,
          "",
          fields.message,
        ];

    return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }, [fields, mode]);

  const whatsappHref = React.useMemo(() => {
    const text =
      mode === "employer"
        ? `Hello Innspireo, I would like to discuss hiring. Company: ${fields.company || "—"}. Roles: ${fields.roles || "—"}.`
        : `Hello Innspireo, ${fields.message || "I have a question about a vacancy."}`;
    return `https://wa.me/${SITE.phoneHref.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }, [fields, mode]);

  function validateLocally(): boolean {
    const next: Record<string, string> = {};
    if (fields.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (fields.message.trim().length < 10) {
      next.message = "Please give us a little more detail.";
    }
    if (mode === "employer" && fields.company.trim().length < 2) {
      next.company = "Please tell us the company name.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateLocally()) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, type: mode, website_url: honeypot }),
      });

      if (res.ok) {
        setStatus("sent");
        setFields(EMPTY);
        return;
      }

      const payload = (await res.json().catch(() => null)) as
        | { error?: string; errors?: Record<string, string> }
        | null;

      if (res.status === 422 && payload?.errors) {
        setErrors(payload.errors);
        setStatus("idle");
        return;
      }

      // 503 not_configured, or an upstream failure: offer the direct channels.
      setStatus("fallback");
    } catch {
      setStatus("fallback");
    }
  }

  if (status === "sent") {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-none bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-5 text-xl text-content">Thank you — we have it</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-content-muted">
          {mode === "employer"
            ? "Our team will review your brief and come back to you within one working day."
            : "We will reply to your message within one working day."}
        </p>
        <Button variant="outline" size="md" className="mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {status === "fallback" ? (
        <div className="rounded-none border border-amber-300 bg-amber-50 p-5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
            <AlertTriangle className="size-4" />
            We could not submit that automatically
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/85">
            Online submission is not switched on for this form yet. Your details are still in
            the fields below — use one of these and they will come straight to our team.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={mailtoHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-none bg-brand-900 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              <Mail className="size-4" />
              Email it to us
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-none border border-line-strong bg-surface px-4 text-sm font-medium text-content transition-colors hover:border-brand-700 hover:text-brand-600"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="eq-name">
            {mode === "employer" ? "Your name" : "Full name"}
          </Label>
          <Input
            id="eq-name"
            value={fields.name}
            onChange={set("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
            required
          />
          {errors.name ? <FieldHint tone="error">{errors.name}</FieldHint> : null}
        </div>

        <div>
          <Label htmlFor="eq-email">Email</Label>
          <Input
            id="eq-email"
            type="email"
            value={fields.email}
            onChange={set("email")}
            autoComplete="email"
            aria-invalid={!!errors.email}
            required
          />
          {errors.email ? <FieldHint tone="error">{errors.email}</FieldHint> : null}
        </div>

        <div>
          <Label htmlFor="eq-phone" hint="Optional">
            Phone / WhatsApp
          </Label>
          <Input
            id="eq-phone"
            type="tel"
            value={fields.phone}
            onChange={set("phone")}
            autoComplete="tel"
            placeholder="+91…"
          />
        </div>

        {mode === "employer" ? (
          <>
            <div>
              <Label htmlFor="eq-company">Company / property</Label>
              <Input
                id="eq-company"
                value={fields.company}
                onChange={set("company")}
                autoComplete="organization"
                aria-invalid={!!errors.company}
                required
              />
              {errors.company ? <FieldHint tone="error">{errors.company}</FieldHint> : null}
            </div>

            <div>
              <Label htmlFor="eq-country">Hiring for</Label>
              <Select id="eq-country" value={fields.country} onChange={set("country")}>
                <option value="">Select a country</option>
                {DESTINATIONS.map((d) => (
                  <option key={d.slug} value={d.name}>
                    {d.name}
                  </option>
                ))}
                <option value="Other">Somewhere else</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="eq-headcount">Approximate headcount</Label>
              <Select id="eq-headcount" value={fields.headcount} onChange={set("headcount")}>
                <option value="">Select a range</option>
                <option value="1-2">1–2 people</option>
                <option value="3-10">3–10 people</option>
                <option value="11-25">11–25 people</option>
                <option value="26-50">26–50 people</option>
                <option value="50+">50+ / pre-opening brigade</option>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="eq-roles" hint="Comma separated">
                Roles you need
              </Label>
              <Input
                id="eq-roles"
                value={fields.roles}
                onChange={set("roles")}
                placeholder="Sous chef, CDP continental, service crew…"
              />
            </div>
          </>
        ) : (
          <div className="sm:col-span-2">
            <Label htmlFor="eq-subject">Subject</Label>
            <Input
              id="eq-subject"
              value={fields.subject}
              onChange={set("subject")}
              placeholder="What is this about?"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="eq-message">
          {mode === "employer" ? "Tell us about the requirement" : "Message"}
        </Label>
        <Textarea
          id="eq-message"
          value={fields.message}
          onChange={set("message")}
          rows={6}
          aria-invalid={!!errors.message}
          placeholder={
            mode === "employer"
              ? "Property type, cuisine, start dates, package range, accommodation and anything else that helps us shortlist accurately."
              : "How can we help?"
          }
          required
        />
        {errors.message ? <FieldHint tone="error">{errors.message}</FieldHint> : null}
      </div>

      {/* Honeypot — hidden from humans and from assistive tech. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website_url">Website</label>
        <input
          id="website_url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "submitting"}
          className="sm:w-auto"
        >
          {status === "submitting" ? (
            "Sending…"
          ) : (
            <>
              <Send />
              {mode === "employer" ? "Send hiring brief" : "Send message"}
            </>
          )}
        </Button>
        <p className="text-xs leading-relaxed text-content-subtle">
          We reply within one working day. Your details are used only to respond to this
          enquiry.
        </p>
      </div>
    </form>
  );
}
