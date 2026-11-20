/**
 * Low-level browser client for the account API.
 *
 * NOTHING HERE IS LIVE YET. The API this is written against does not exist on
 * the current backend, so `authEnabled` is false and every call returns
 * `not_configured` rather than failing in some less obvious way. The contract
 * it expects is listed in .env.example; when a backend provides it, flipping
 * NEXT_PUBLIC_API_AUTH_ENABLED to "true" turns the whole candidate area on.
 *
 * Every call runs from the browser with `credentials: "include"`, because a
 * session lives in a cookie set by the API origin. A Next.js server component
 * cannot read that cookie — it belongs to a different origin — so the whole
 * signed-in area is client-rendered by design, not by accident.
 *
 * SAME-SITE WARNING for whoever wires this up: a SameSite=Lax session cookie
 * treats "localhost" and "127.0.0.1" as different sites, so the frontend and
 * the API must agree on the hostname or the browser silently drops the cookie
 * and the user looks signed out with no error anywhere.
 */

import { SITE } from "./constants";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? SITE.apiBase;
export const authEnabled = process.env.NEXT_PUBLIC_API_AUTH_ENABLED === "true";

export type ApiErrorCode =
  | "not_configured"
  | "unauthenticated"
  | "unverified"
  | "validation"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "network"
  | "server";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly errors?: Record<string, string[]>;

  constructor(
    code: ApiErrorCode,
    message: string,
    status = 0,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.errors = errors;
  }

  /** The first message for a field, for inline display next to the input. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

export const NOT_CONFIGURED_MESSAGE = [
  "Account features are not connected to this new frontend yet — the backend",
  "needs its JSON routes and CORS enabled. Please contact our team and we will",
  "help you directly in the meantime.",
].join(" ");

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Fetch a CSRF token before any unsafe request.
 *
 * Run before every write rather than once at startup: most frameworks rotate
 * the CSRF token on sign-in, so a token captured before login is already stale
 * immediately afterwards.
 */
export async function primeCsrf(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/csrf-cookie`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    // Reported by the request that follows, which produces a better message.
  }
}

interface ErrorBody {
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

function codeFor(status: number): ApiErrorCode {
  if (status === 401) return "unauthenticated";
  if (status === 403) return "unverified";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422 || status === 400) return "validation";
  if (status === 429) return "rate_limited";
  return "server";
}

async function toError(response: Response): Promise<ApiError> {
  let body: ErrorBody | null = null;
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    body = null;
  }

  const code = codeFor(response.status);
  const fallback: Record<ApiErrorCode, string> = {
    not_configured: NOT_CONFIGURED_MESSAGE,
    unauthenticated: "Please sign in to continue.",
    unverified: "Please confirm your email address first.",
    validation: "Please check the details you entered.",
    not_found: "We could not find that.",
    conflict: "That has already been done.",
    rate_limited: "Too many attempts. Please wait a few minutes and try again.",
    network: "We could not reach the server.",
    server: "Something went wrong at our end. Please try again.",
  };

  return new ApiError(
    code,
    body?.message ?? body?.detail ?? fallback[code],
    response.status,
    body?.errors,
  );
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!authEnabled) {
    throw new ApiError("not_configured", NOT_CONFIGURED_MESSAGE);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "network",
      "We could not reach the server. Check your connection and try again.",
    );
  }

  if (!response.ok) throw await toError(response);
  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

/** GET. */
export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}

/** POST / PATCH / PUT / DELETE with a JSON body. Primes CSRF first. */
export async function apiSend<T>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  if (!authEnabled) {
    throw new ApiError("not_configured", NOT_CONFIGURED_MESSAGE);
  }
  await primeCsrf();
  const xsrf = readCookie("XSRF-TOKEN");

  return request<T>(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Multipart upload. Content-Type is left to the browser so it sets the boundary. */
export async function apiUpload<T>(
  path: string,
  form: FormData,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  if (!authEnabled) {
    throw new ApiError("not_configured", NOT_CONFIGURED_MESSAGE);
  }
  await primeCsrf();
  const xsrf = readCookie("XSRF-TOKEN");

  return request<T>(path, {
    method,
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    },
    body: form,
  });
}

/** Turn any thrown value into something safe to render. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
