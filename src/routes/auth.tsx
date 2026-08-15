import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Ironclad Password Manager" },
      {
        name: "description",
        content: "Sign in or create your Ironclad account to unlock your encrypted password vault.",
      },
      { property: "og:title", content: "Sign in — Ironclad Password Manager" },
      {
        property: "og:description",
        content: "Sign in or create your Ironclad account to unlock your encrypted password vault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/vault", replace: true });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/vault",
          data: { display_name: name },
        },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.session) {
        toast.success("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
        toast.error(error.message);
        return;
      }
    sessionStorage.setItem("ironclad:unlocked", "1");
    navigate({ to: "/vault" });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/vault",
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    sessionStorage.setItem("ironclad:unlocked", "1");
    navigate({ to: "/vault" });
  }

  async function forgotPassword() {
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) {
        toast.error(error.message);
        return;
      }
    toast.success("Password reset link sent.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <Logo size={28} />
          <span className="font-display text-xl">Ironclad</span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl">
            {mode === "signin" ? "Welcome back" : "Create your vault"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to unlock your passwords."
              : "One account, every password, everywhere."}
          </p>

          <Button variant="secondary" className="mt-6 w-full rounded-full py-6" onClick={google}>
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  className="mt-1.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">
                {mode === "signin" ? "Master password" : "Choose a master password"}
              </Label>
              <Input
                id="password"
                type="password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full py-6" disabled={busy}>
              {busy ? "Working…" : mode === "signin" ? "Unlock vault" : "Create account"}
            </Button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2 text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:opacity-70"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "No account yet? Create one"
                : "Already have an account? Sign in"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                className="text-muted-foreground hover:opacity-70"
                onClick={forgotPassword}
              >
                Forgot your master password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}