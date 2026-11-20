"use client";

import * as React from "react";
import { Upload, Save, FileText, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Card, Divider } from "@/components/ui/primitives";
import { Input, Label, Select, Textarea, Checkbox, FieldHint } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Loading, ErrorNotice } from "@/components/candidate/account-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { CATEGORIES, DESTINATIONS, EXPERIENCE_LEVELS } from "@/lib/constants";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  deleteCv,
  getProfile,
  updateProfile,
  uploadCv,
  type CandidateProfile,
  type ProfilePatch,
} from "@/lib/candidate";

const MAX_CV_BYTES = 10 * 1024 * 1024;
const CV_TYPES = [".pdf", ".doc", ".docx"];

/** A draft of the form, all strings, because that is what inputs hold. */
interface Draft {
  name: string;
  phone: string;
  location: string;
  nationality: string;
  passport_expiry: string;
  headline: string;
  experience_level_id: string;
  experience_years: string;
  summary: string;
  categories: number[];
  destinations: string[];
}

function toDraft(profile: CandidateProfile): Draft {
  return {
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    nationality: profile.nationality ?? "",
    passport_expiry: profile.passport_expiry ?? "",
    headline: profile.headline ?? "",
    experience_level_id: profile.experience_level_id
      ? String(profile.experience_level_id)
      : "",
    // 0 is the backend's default for "not said yet". Showing it as a literal
    // "0" would be a value the person has to delete before typing their own,
    // so an unset count stays blank and the placeholder does the talking.
    experience_years: profile.experience_years ? String(profile.experience_years) : "",
    summary: profile.summary ?? "",
    categories: [...(profile.preferred_category_ids ?? [])],
    destinations: [...(profile.preferred_destination_slugs ?? [])],
  };
}

function toPatch(draft: Draft): ProfilePatch {
  const years = Number.parseInt(draft.experience_years, 10);
  return {
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    location: draft.location.trim(),
    nationality: draft.nationality.trim(),
    passport_expiry: draft.passport_expiry ? draft.passport_expiry : null,
    headline: draft.headline.trim(),
    experience_level_id: draft.experience_level_id
      ? Number(draft.experience_level_id)
      : null,
    experience_years: Number.isFinite(years) && years >= 0 ? years : 0,
    summary: draft.summary.trim(),
    preferred_category_ids: draft.categories,
    preferred_destination_slugs: draft.destinations,
  } as ProfilePatch;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ProfileForm() {
  const { refresh: refreshAuth } = useAuth();

  const [profile, setProfile] = React.useState<CandidateProfile | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});

  const [cvBusy, setCvBusy] = React.useState(false);
  const [cvError, setCvError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // -- load ------------------------------------------------------------
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProfile();
        if (cancelled) return;
        setProfile(data);
        setDraft(toDraft(data));
      } catch (error) {
        if (!cancelled) setLoadError(errorMessage(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = React.useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setSaved(false);
  }, []);

  // -- save ------------------------------------------------------------
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;

    setSaving(true);
    setSaveError(null);
    setFieldErrors({});
    setSaved(false);

    try {
      const updated = await updateProfile(toPatch(draft));
      setProfile(updated);
      setDraft(toDraft(updated));
      setSaved(true);
      // The name shown in the header lives on the user record, so a rename
      // here has to reach the auth context too.
      void refreshAuth();
    } catch (error) {
      if (error instanceof ApiError && error.errors) setFieldErrors(error.errors);
      setSaveError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  // -- CV --------------------------------------------------------------
  async function onFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately so choosing the same file twice still fires onChange.
    event.target.value = "";
    if (!file) return;

    setCvError(null);

    const extension = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!CV_TYPES.includes(extension)) {
      setCvError("Upload a PDF or Word document (.pdf, .doc or .docx).");
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setCvError("That file is larger than 10 MB. Please upload a smaller one.");
      return;
    }

    setCvBusy(true);
    try {
      const updated = await uploadCv(file);
      setProfile(updated);
    } catch (error) {
      setCvError(errorMessage(error));
    } finally {
      setCvBusy(false);
    }
  }

  async function onRemoveCv() {
    setCvBusy(true);
    setCvError(null);
    try {
      await deleteCv();
      const updated = await getProfile();
      setProfile(updated);
    } catch (error) {
      setCvError(errorMessage(error));
    } finally {
      setCvBusy(false);
    }
  }

  if (loadError) return <ErrorNotice>{loadError}</ErrorNotice>;
  if (!draft || !profile) return <Loading label="Loading your profile…" />;

  const err = (field: string) => fieldErrors[field]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Completeness */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg text-content">Profile completeness</h2>
            <p className="mt-1 text-sm text-content-muted">
              A fuller profile is what lets our team match you without chasing details.
            </p>
          </div>
          <p className="font-display text-3xl font-bold text-brand-900">
            {profile.completeness}%
          </p>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden bg-ink-200"
          role="progressbar"
          aria-valuenow={profile.completeness}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completeness"
        >
          <div
            className="h-full bg-brand-900 transition-all duration-700"
            style={{ width: `${profile.completeness}%` }}
          />
        </div>
      </Card>

      {/* Personal details */}
      <Card className="p-6">
        <h2 className="text-lg text-content">Personal details</h2>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-name">Full name</Label>
            <Input
              id="p-name"
              name="name"
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="As it appears on your passport"
              autoComplete="name"
            />
            {err("name") ? <FieldHint tone="error">{err("name")}</FieldHint> : null}
          </div>

          <div>
            <Label htmlFor="p-email" hint="Cannot be changed here">
              Email
            </Label>
            <Input id="p-email" type="email" value={profile.email} readOnly disabled />
            <FieldHint>
              Your email is the address we verified. Contact us if it needs changing.
            </FieldHint>
          </div>

          <div>
            <Label htmlFor="p-phone">Phone / WhatsApp</Label>
            <Input
              id="p-phone"
              name="phone"
              type="tel"
              value={draft.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 90000 00000"
              autoComplete="tel"
            />
            {err("phone") ? <FieldHint tone="error">{err("phone")}</FieldHint> : null}
          </div>

          <div>
            <Label htmlFor="p-location">Current location</Label>
            <Input
              id="p-location"
              name="location"
              value={draft.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Kochi, India"
            />
          </div>

          <div>
            <Label htmlFor="p-nationality">Nationality</Label>
            <Input
              id="p-nationality"
              name="nationality"
              value={draft.nationality}
              onChange={(e) => update("nationality", e.target.value)}
              placeholder="Indian"
            />
          </div>

          <div>
            <Label htmlFor="p-passport" hint="Needed before visa processing">
              Passport expiry
            </Label>
            <Input
              id="p-passport"
              name="passport_expiry"
              type="date"
              value={draft.passport_expiry}
              onChange={(e) => update("passport_expiry", e.target.value)}
            />
            {err("passport_expiry") ? (
              <FieldHint tone="error">{err("passport_expiry")}</FieldHint>
            ) : (
              <FieldHint>Most Gulf roles need at least six months validity.</FieldHint>
            )}
          </div>
        </div>
      </Card>

      {/* Experience */}
      <Card className="p-6">
        <h2 className="text-lg text-content">Experience</h2>
        <div className="mt-5 space-y-5">
          <div>
            <Label htmlFor="p-headline">Headline</Label>
            <Input
              id="p-headline"
              name="headline"
              value={draft.headline}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Chef de Partie — Continental"
            />
            <FieldHint>Your current or most recent role, in a few words.</FieldHint>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-level">Experience level</Label>
              <Select
                id="p-level"
                name="experience_level_id"
                value={draft.experience_level_id}
                onChange={(e) => update("experience_level_id", e.target.value)}
              >
                <option value="">Select a level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.id} value={String(level.id)}>
                    {level.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="p-years">Years of experience</Label>
              <Input
                id="p-years"
                name="experience_years"
                type="number"
                min={0}
                max={50}
                inputMode="numeric"
                value={draft.experience_years}
                onChange={(e) => update("experience_years", e.target.value)}
                placeholder="4"
              />
              {err("experience_years") ? (
                <FieldHint tone="error">{err("experience_years")}</FieldHint>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="p-summary">Summary</Label>
            <Textarea
              id="p-summary"
              name="summary"
              rows={5}
              value={draft.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="Properties you have worked at, cuisines or service styles you specialise in, and the kind of role you are looking for next."
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-lg text-content">What you are looking for</h2>
        <p className="mt-1.5 text-sm text-content-muted">
          We use this to tell you first when a matching vacancy opens.
        </p>

        <Divider className="my-5" />

        <fieldset>
          <legend className="text-sm font-medium text-content">Departments</legend>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <Checkbox
                key={category.id}
                id={`cat-${category.id}`}
                label={category.name}
                checked={draft.categories.includes(category.id)}
                onChange={() => update("categories", toggle(draft.categories, category.id))}
              />
            ))}
          </div>
        </fieldset>

        <Divider className="my-5" />

        <fieldset>
          <legend className="text-sm font-medium text-content">Destinations</legend>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {DESTINATIONS.map((destination) => (
              <Checkbox
                key={destination.slug}
                id={`dest-${destination.slug}`}
                label={destination.name}
                checked={draft.destinations.includes(destination.slug)}
                onChange={() =>
                  update("destinations", toggle(draft.destinations, destination.slug))
                }
              />
            ))}
          </div>
        </fieldset>
      </Card>

      {/* CV */}
      <Card className="p-6">
        <h2 className="text-lg text-content">CV and documents</h2>
        <p className="mt-1.5 text-sm text-content-muted">
          PDF or Word, up to 10 MB. Upload once and it is attached to every application
          you make.
        </p>

        {/* The real input. Hidden, driven by the button below, because a bare
            file input cannot be styled to match the rest of the form. */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={onFileChosen}
          aria-label="Choose a CV file"
        />

        {profile.cv_file_name ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border border-line bg-surface-muted px-5 py-4">
            <span className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center bg-brand-900 text-white"
              >
                <FileText className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-content">
                  {profile.cv_file_name}
                </span>
                {profile.cv_updated_at ? (
                  <span className="block text-xs text-content-subtle">
                    Uploaded {new Date(profile.cv_updated_at).toLocaleDateString()}
                  </span>
                ) : null}
              </span>
            </span>

            <span className="flex flex-wrap items-center gap-2">
              {profile.cv_url ? (
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-brand-700 underline underline-offset-2"
                >
                  View
                </a>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cvBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={cvBusy}
                onClick={onRemoveCv}
              >
                <Trash2 />
                Remove
              </Button>
            </span>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center justify-center border border-dashed border-line-strong bg-surface-muted px-6 py-10 text-center">
            <div className="grid size-12 place-items-center bg-brand-50 text-brand-600">
              {cvBusy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Upload className="size-5" />
              )}
            </div>
            <p className="mt-4 text-sm font-medium text-content">No CV uploaded yet</p>
            <p className="mt-1 text-xs text-content-subtle">PDF or Word, up to 10 MB</p>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="mt-5"
              disabled={cvBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              {cvBusy ? "Uploading…" : "Choose file"}
            </Button>
          </div>
        )}

        {cvError ? <FieldHint tone="error">{cvError}</FieldHint> : null}
      </Card>

      {/* Save */}
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-surface/95 px-4 py-4 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saveError ? (
            <p className="text-sm text-rose-700 sm:mr-auto">{saveError}</p>
          ) : saved ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 sm:mr-auto">
              <CheckCircle2 className="size-4" />
              Saved
            </p>
          ) : null}

          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
