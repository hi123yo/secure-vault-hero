import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { vaultItemsQuery } from "@/lib/vault-queries";
import { CATEGORIES, scorePassword, type VaultItem } from "@/lib/vault";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemDialog } from "@/components/app/ItemDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vault/")({
  component: VaultList,
});

function VaultList() {
  const { data: items = [], isLoading } = useQuery(vaultItemsQuery);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [creating, setCreating] = useState(false);

  const toggleFavorite = useMutation({
    mutationFn: async (item: VaultItem) => {
      const { error } = await supabase
        .from("vault_items")
        .update({ favorite: !item.favorite })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vault-items"] }),
    onError: () => toast.error("Couldn't update that item."),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.username ?? "").toLowerCase().includes(q) ||
        (item.website ?? "").toLowerCase().includes(q);
      const matchesCategory = category === "all" || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, category]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Your vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} stored and encrypted.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setCreating(true)}>
          <Plus size={16} /> New item
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, username or site"
            className="rounded-full pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                category === c
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {isLoading && <p className="text-sm text-muted-foreground">Opening vault…</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-lg">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first login and Ironclad keeps it locked down.
            </p>
            <Button className="mt-5 rounded-full" onClick={() => setCreating(true)}>
              <Plus size={16} /> Add a password
            </Button>
          </div>
        )}

        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-sm">
              {item.name.slice(0, 2).toUpperCase()}
            </span>
            <Link
              to="/vault/$itemId"
              params={{ itemId: item.id }}
              className="min-w-0 flex-1"
            >
              <p className="truncate font-medium">{item.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {item.username || item.website || item.category}
              </p>
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {scorePassword(item.password).label}
            </span>
            <button
              aria-label="Toggle favourite"
              onClick={() => toggleFavorite.mutate(item)}
              className="p-1 text-muted-foreground transition-opacity hover:opacity-70"
            >
              <Star size={18} className={item.favorite ? "fill-primary text-primary" : ""} />
            </button>
          </div>
        ))}
      </div>

      <ItemDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}