/**
 * Candidate authentication.
 *
 * NOT CONNECTED YET. The live Laravel backend has no JSON auth routes — its
 * /login and /register are Blade pages that take a session POST with a CSRF
 * field — so `authEnabled` is false and every function here returns
 * `not_configured`, which the UI renders as a plain "not connected" notice.
 * The exact endpoints this expects are listed in .env.example.
 *
 * The design is session-cookie auth: the browser holds the session and nothing
 * is kept in local storage, so there is no token for a script on the page to
 * steal.
 *
 * Every mutation ends by announcing that auth state changed, so the header and
 * any other subscriber re-read `/api/user` without being told about each call
 * site individually. See `AuthProvider`.
 */

import {
  ApiError,
  apiGet,
  apiSend,
  authEnabled as clientAuthEnabled,
  NOT_CONFIGURED_MESSAGE as CLIENT_NOT_CONFIGURED,
} from "./api-client";

export const authEnabled = clientAuthEnabled;

/** Copy shown when the backend endpoints are not reachable from this build. */
export const NOT_CONFIGURED_MESSAGE = [
  "Account sign-in is not connected to this new frontend yet — the backend",
  "needs its JSON auth routes and CORS enabled. Until then, please contact our",
  "team and we will process your application directly.",
].join(" ");

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
}

export type AuthResult =
  | { ok: true; user: AuthUser; message?: string }
  | { ok: false; code: "not_configured" }
  | {
      ok: false;
      code: "invalid_credentials" | "validation" | "network" | "server" | "rate_limited";
      errors?: Record<string, string[]>;
      message?: string;
    };

/* -------------------------------------------------------------------------- */
/*  Change notification                                                       */
/* -------------------------------------------------------------------------- */

export const AUTH_EVENT = "innspireo:auth-changed";

export function notifyAuthChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function toFailure(error: unknown): AuthResult {
  if (error instanceof ApiError) {
    if (error.code === "not_configured") return { ok: false, code: "not_configured" };
    if (error.code === "unauthenticated") {
      return { ok: false, code: "invalid_credentials", message: error.message };
    }
    if (error.code === "validation") {
      return {
        ok: false,
        code: "validation",
        errors: error.errors,
        message: error.message,
      };
    }
    if (error.code === "rate_limited") {
      return { ok: false, code: "rate_limited", message: error.message };
    }
    if (error.code === "network") return { ok: false, code: "network" };
  }
  return { ok: false, code: "server" };
}

interface UserEnvelope {
  user?: AuthUser;
  message?: string;
}

async function authPost(path: string, body: Record<string, unknown>): Promise<AuthResult> {
  try {
    const payload = await apiSend<UserEnvelope | AuthUser>("POST", path, body);
    const user =
      (payload as UserEnvelope)?.user ?? ((payload as AuthUser)?.email ? (payload as AuthUser) : null);
    if (!user) return { ok: false, code: "server" };
    notifyAuthChanged();
    return { ok: true, user, message: (payload as UserEnvelope)?.message };
  } catch (error) {
    return toFailure(error);
  }
}

/* -------------------------------------------------------------------------- */
/*  Public surface                                                            */
/* -------------------------------------------------------------------------- */

export function login(email: string, password: string, remember: boolean) {
  return authPost("/api/login", { email, password, remember });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  // Registration is candidate-only on the backend; the role is sent explicitly
  // so this still reads correctly if employer accounts are ever added.
  return authPost("/api/register", { ...input, role: "candidate" });
}

export function verifyEmail(token: string) {
  return authPost("/api/email/verify", { token });
}

export async function logout(): Promise<void> {
  try {
    await apiSend<void>("POST", "/api/logout");
  } catch {
    // A failed sign-out must not trap someone on the page. The next call to
    // /api/user settles the real state either way.
  } finally {
    notifyAuthChanged();
  }
}

/** Both of these always report success, so neither can be used to test an address. */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    await apiSend<{ message: string }>("POST", "/api/forgot-password", { email });
    // There is no user to return — the caller only needs "it went through".
    return { ok: true, user: { id: 0, name: "", email, role: "candidate", email_verified_at: null } };
  } catch (error) {
    return toFailure(error);
  }
}

export async function resendVerification(email?: string): Promise<AuthResult> {
  try {
    await apiSend<{ message: string }>(
      "POST",
      "/api/email/resend",
      email ? { email } : {},
    );
    return {
      ok: true,
      user: { id: 0, name: "", email: email ?? "", role: "candidate", email_verified_at: null },
    };
  } catch (error) {
    return toFailure(error);
  }
}

export async function resetPassword(input: {
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<AuthResult> {
  try {
    await apiSend<{ message: string }>("POST", "/api/reset-password", input);
    return {
      ok: true,
      user: { id: 0, name: "", email: "", role: "candidate", email_verified_at: null },
    };
  } catch (error) {
    return toFailure(error);
  }
}

/** Who is signed in, or null. Never throws. */
export async function currentUser(): Promise<AuthUser | null> {
  if (!authEnabled) return null;
  try {
    return await apiGet<AuthUser>("/api/user");
  } catch {
    return null;
  }
}

export { CLIENT_NOT_CONFIGURED };
