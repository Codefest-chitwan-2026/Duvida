import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { mapProfileRow, type Profile } from "@/types/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toErrorMessage(err: unknown): string {
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message ?? "")
      : "";

  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password.";
  }
  if (/already registered|user already exists/i.test(message)) {
    return "An account with this email already exists.";
  }
  if (/password/i.test(message)) {
    return message;
  }
  if (/network|fetch/i.test(message)) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/**
 * Real Supabase-backed session. Keeps the same external shape
 * (`useAuth()` + `isAuthenticated`) that app/_layout.tsx already gates
 * navigation on, so the navigation structure itself doesn't change.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_path, role, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (profileError || !data) {
      setProfile(null);
      return;
    }
    setProfile(mapProfileRow(data));
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      if (nextSession) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(toErrorMessage(signInError));
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(toErrorMessage(signUpError));
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(toErrorMessage(signOutError));
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!session,
      loading,
      user: session?.user ?? null,
      profile,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [session, loading, profile, error, signIn, signUp, signOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
