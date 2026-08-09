import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, generatePassword, type VaultItem } from "@/lib/vault";
import { StrengthBar } from "./StrengthBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Draft = {
  name: string;
  website: string;
  username: string;
  password: string;
  notes: string;
  category: string;
};

const EMPTY: Draft = {
  name: "",
  website: "",
  username: "",
  password: "",
  notes: "",
  category: "login",
};

export function ItemDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: VaultItem;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setDraft(
      item
        ? {
            name: item.name,
            website: item.website ?? "",
            username: item.username ?? "",
            password: item.password,
            notes: item.notes ?? "",
            category: item.category,
          }
        : EMPTY,
    );
  }, [open, item]);

  const save = useMutation({
    mutationFn: async () => {
      const name = draft.name.trim();
      if (!name) throw new Error("Give this item a name.");
      if (name.length > 120) throw new Error("Name is too long.");

      const payload = {
        name,
        website: draft.website.trim().slice(0, 300) || null,
        username: draft.username.trim().slice(0, 200) || null,
        password: draft.password.slice(0, 500),
        notes: draft.notes.trim().slice(0, 2000) || null,
        category: draft.category,
      };

      if (item) {
        const changed = item.password !== payload.password;
        const { error } = await supabase
          .from("vault_items")
          .update(
            changed
              ? { ...payload, password_updated_at: new Date().toISOString() }
              : payload,
          )
          .eq("id", item.id);
        if (error) throw error;
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expired.");
      const { error } = await supabase
        .from("vault_items")
        .insert({ ...payload, user_id: auth.user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-items"] });
      toast.success(item ? "Item updated." : "Item saved to your vault.");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {item ? "Edit item" : "New vault item"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              className="mt-1.5"
              value={draft.name}
              maxLength={120}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="item-username">Username or email</Label>
              <Input
                id="item-username"
                className="mt-1.5"
                value={draft.username}
                maxLength={200}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="item-website">Website</Label>
              <Input
                id="item-website"
                className="mt-1.5"
                placeholder="example.com"
                value={draft.website}
                maxLength={300}
                onChange={(e) => setDraft({ ...draft, website: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="item-password">Password</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="item-password"
                value={draft.password}
                maxLength={500}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              />
              <Button
                type="button"
                variant="secondary"
                aria-label="Generate password"
                onClick={() =>
                  setDraft({
                    ...draft,
                    password: generatePassword({
                      length: 20,
                      upper: true,
                      digits: true,
                      symbols: true,
                    }),
                  })
                }
              >
                <RefreshCw size={16} />
              </Button>
            </div>
            <div className="mt-2">
              <StrengthBar password={draft.password} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDraft({ ...draft, category: c })}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize ${
                    draft.category === c
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="item-notes">Notes</Label>
            <Textarea
              id="item-notes"
              className="mt-1.5"
              rows={3}
              maxLength={2000}
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? "Saving…" : "Save item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}