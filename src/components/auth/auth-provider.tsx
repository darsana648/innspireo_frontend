"use client";

import * as React from "react";
import { AUTH_EVENT, authEnabled, currentUser, logout, type AuthUser } from "@/lib/auth";

type Status = "loading" | "signed-in" | "signed-out";

interface AuthState {
  user: AuthUser | null;
  status: Status;
  /** True once signed in AND the email address is confirmed. */
  isVerified: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

/**
 * Holds "who is signed in" for the whole app.
 *
 * It re-reads `/api/user` whenever anything announces an auth change, so the
 * header updates after a sign-in that happened on a different route without
 * every call site having to know the header exists.
 *
 * It also re-checks when the tab regains focus: the session can expire, or be
 * ended in another tab, while this one sits idle — and a header that still
 * says "signed in" after that is worse than no header state at all.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [status, setStatus] = React.useState<Status>(
    authEnabled ? "loading" : "signed-out",
  );

  const refresh = React.useCallback(async () => {
    if (!authEnabled) {
      setUser(null);
      setStatus("signed-out");
      return;
    }
    const next = await currentUser();
    setUser(next);
    setStatus(next ? "signed-in" : "signed-out");
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    if (!authEnabled) return;

    const onChange = () => void refresh();
    const onFocus = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    window.addEventListener(AUTH_EVENT, onChange);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener(AUTH_EVENT, onChange);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  const signOut = React.useCallback(async () => {
    // Clear locally first so the header responds immediately; `logout()`
    // announces the change, which re-reads the real state a moment later.
    setUser(null);
    setStatus("signed-out");
    await logout();
  }, []);

  const value = React.useMemo<AuthState>(
    () => ({
      user,
      status,
      isVerified: Boolean(user?.email_verified_at),
      refresh,
      signOut,
    }),
    [user, status, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
