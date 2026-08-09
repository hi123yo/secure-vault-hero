import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Lock, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/vault-queries";
import { useLock } from "@/components/app/lock-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

const LOCK_OPTIONS = [1, 5, 15, 60];

function SettingsPage() {
  const { data } = useQuery(profileQuery);
  const queryClient = useQueryClient();
  const { lock } = useLock();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (data?.profile?.display_name) setDisplayName(data.profile.display_name);
  }, [data]);

  const saveProfile = useMutation({
    mutationFn: async (patch: { display_name?: string; auto_lock_minutes?: number }) => {
      let update: { display_name?: string; auto_lock_minutes?: number } = patch;
      if (patch.display_name !== undefined) {
        const name = patch.display_name.trim();
        if (!name || name.length > 80) {
          throw new Error("Enter a name between 1 and 80 characters.");
        }
        update = { display_name: name };
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expired.");
      const { error } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const autoLock = data?.profile?.auto_lock_minutes ?? 15;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account, plan and vault protection.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              className="mt-1.5"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" className="mt-1.5" value={data?.email ?? ""} disabled />
          </div>
        </div>
        <Button
          className="mt-4 rounded-full"
          disabled={saveProfile.isPending}
          onClick={() => saveProfile.mutate({ display_name: displayName })}
        >
          Save profile
        </Button>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg">Auto-lock</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Lock the vault automatically after a period of inactivity.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LOCK_OPTIONS.map((minutes) => (
            <button
              key={minutes}
              onClick={() => saveProfile.mutate({ auto_lock_minutes: minutes })}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                autoLock === minutes
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {minutes === 60 ? "1 hour" : `${minutes} min`}
            </button>
          ))}
        </div>
        <Button variant="secondary" className="mt-5 rounded-full" onClick={lock}>
          <Lock size={16} /> Lock vault now
        </Button>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg">Plan</h2>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          You're on the {data?.profile?.plan ?? "free"} plan.
        </p>
        <Button
          variant="ghost"
          className="mt-5 rounded-full text-destructive"
          onClick={signOut}
        >
          <LogOut size={16} /> Sign out
        </Button>
      </div>
    </div>
  );
}