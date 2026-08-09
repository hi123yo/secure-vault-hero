import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Copy, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { vaultItemsQuery } from "@/lib/vault-queries";
import { daysSince } from "@/lib/vault";
import { StrengthBar } from "@/components/app/StrengthBar";
import { ItemDialog } from "@/components/app/ItemDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vault/$itemId")({
  component: ItemDetail,
});

function ItemDetail() {
  const { itemId } = Route.useParams();
  const { data: items = [], isLoading } = useQuery(vaultItemsQuery);
  const item = items.find((i) => i.id === itemId);
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vault_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault-items"] });
      toast.success("Item deleted.");
      navigate({ to: "/vault" });
    },
    onError: () => toast.error("Couldn't delete that item."),
  });

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading item…</p>;

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-xl">Item not found</p>
        <Button asChild variant="secondary" className="mt-4 rounded-full">
          <Link to="/vault">Back to vault</Link>
        </Button>
      </div>
    );
  }

  const rows: { label: string; value: string; secret?: boolean }[] = [
    { label: "Username", value: item.username ?? "—" },
    { label: "Password", value: item.password, secret: true },
    { label: "Website", value: item.website ?? "—" },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        to="/vault"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:opacity-70"
      >
        <ArrowLeft size={16} /> Vault
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">{item.name}</h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {item.category} · password changed {daysSince(item.password_updated_at)} days ago
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-full" onClick={() => setEditing(true)}>
            <Pencil size={16} /> Edit
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-destructive"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
          >
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </p>
                <p className="truncate font-medium">
                  {row.secret && !revealed ? "•".repeat(Math.min(14, row.value.length || 8)) : row.value}
                </p>
              </div>
              {row.secret && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={revealed ? "Hide password" : "Show password"}
                  onClick={() => setRevealed((v) => !v)}
                >
                  {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Copy ${row.label}`}
                onClick={() => copy(row.value, row.label)}
              >
                <Copy size={16} />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <StrengthBar password={item.password} />
        </div>

        {item.notes && (
          <div className="mt-6 rounded-2xl bg-secondary p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{item.notes}</p>
          </div>
        )}
      </div>

      <ItemDialog open={editing} onOpenChange={setEditing} item={item} />
    </div>
  );
}