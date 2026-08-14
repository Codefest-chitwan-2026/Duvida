import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Placeholder in-memory session so the (auth) navigation gate has something
 * real to key off before Supabase auth is wired up. `isLoading` stands in for
 * an async `supabase.auth.getSession()` call so the splash screen has a real
 * moment to occupy. Swap the state source for a Supabase session check (see
 * docs/mobile-navigation.md) without touching the navigation structure in
 * app/_layout.tsx.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Placeholder for an async `supabase.auth.getSession()` call — kept
    // async-shaped so swapping in the real check later is a one-line change.
    Promise.resolve().then(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      signIn: () => setIsAuthenticated(true),
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated, isLoading]
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
