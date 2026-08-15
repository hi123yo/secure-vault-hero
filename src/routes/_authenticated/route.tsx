import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { AppShell } from "@/components/app/AppShell";
import { LockContext } from "@/components/app/lock-context";
import { SmsUnlock } from "@/components/app/SmsUnlock";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UNLOCK_KEY = "ironclad:unlocked";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const value = useMemo(
    () => ({
      lock: () => {
        sessionStorage.removeItem(UNLOCK_KEY);
        setUnlocked(false);
      },
    }),
    [],
  );

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Logo size={36} />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <UnlockScreen
        email={session.user.email ?? ""}
        phone={session.user.phone ?? ""}
        onUnlock={() => {
          sessionStorage.setItem(UNLOCK_KEY, "1");
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <LockContext.Provider value={value}>
      <AppShell>
        <Outlet />
      </AppShell>
    </LockContext.Provider>
  );
}

function UnlockScreen({
  email,
  phone,
  onUnlock,
}: {
  email: string;
  phone: string;
  onUnlock: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"password" | "sms">("password");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) {
      setError("That master password doesn't match.");
      return;
    }
    onUnlock();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-5">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <LockKeyhole size={22} />
          </span>
          <h1 className="font-display text-2xl">Vault locked</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "password"
              ? `Enter your master password to unlock ${email}.`
              : "Verify the code we text you to unlock your vault."}
          </p>
        </div>
        {mode === "password" ? (
          <form onSubmit={submit}>
            <Label htmlFor="master">Master password</Label>
            <Input
              id="master"
              type="password"
              autoFocus
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="mt-5 w-full rounded-full py-6" disabled={busy}>
              {busy ? "Unlocking…" : "Unlock vault"}
            </Button>
          </form>
        ) : (
          <SmsUnlock phone={phone} onUnlock={onUnlock} />
        )}
        {phone ? (
          <button
            type="button"
            className="mt-4 w-full text-sm font-medium text-primary underline"
            onClick={() => {
              setError(null);
              setMode(mode === "password" ? "sms" : "password");
            }}
          >
            {mode === "password" ? "Unlock with a text message instead" : "Use master password instead"}
          </button>
        ) : (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Want SMS unlock? Add a mobile number in Settings.
          </p>
        )}
      </div>
    </div>
  );
}