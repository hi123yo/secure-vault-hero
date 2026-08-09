import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new master password — Ironclad" },
      { name: "description", content: "Choose a new master password for your Ironclad vault." },
      { property: "og:title", content: "Set a new master password — Ironclad" },
      {
        property: "og:description",
        content: "Choose a new master password for your Ironclad vault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Master password updated.");
    sessionStorage.setItem("ironclad:unlocked", "1");
    navigate({ to: "/vault", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-sm"
      >
        <Logo size={28} />
        <h1 className="mt-4 font-display text-2xl">New master password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick something long and unique — this key opens everything.
        </p>
        <Label htmlFor="new-password" className="mt-6 block">
          Master password
        </Label>
        <Input
          id="new-password"
          type="password"
          className="mt-1.5"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="mt-5 w-full rounded-full py-6" disabled={busy}>
          {busy ? "Saving…" : "Save and unlock"}
        </Button>
      </form>
    </div>
  );
}