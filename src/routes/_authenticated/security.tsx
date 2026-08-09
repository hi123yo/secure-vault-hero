import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, Copy, ShieldCheck } from "lucide-react";
import { vaultItemsQuery } from "@/lib/vault-queries";
import { buildSecurityReport, daysSince, type VaultItem } from "@/lib/vault";

export const Route = createFileRoute("/_authenticated/security")({
  component: SecurityPage,
});

function Section({
  title,
  description,
  icon,
  items,
  meta,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: VaultItem[];
  meta: (item: VaultItem) => string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-lg">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nothing to fix here. Nice work.</p>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-border">
          {items.map((item) => (
            <Link
              key={item.id}
              to="/vault/$itemId"
              params={{ itemId: item.id }}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="truncate font-medium">{item.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{meta(item)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SecurityPage() {
  const { data: items = [], isLoading } = useQuery(vaultItemsQuery);
  const report = buildSecurityReport(items);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display text-3xl">Security check</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A continuous audit of every credential in your vault.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-6 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent font-display text-xl text-accent-foreground">
            {isLoading ? "–" : report.healthScore}
          </span>
          <div>
            <p className="font-display text-lg">Vault health score</p>
            <p className="text-sm text-muted-foreground">
              {items.length} credentials audited locally
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap justify-end gap-6 text-sm">
          <div>
            <p className="font-display text-2xl">{report.weak.length}</p>
            <p className="text-muted-foreground">Weak</p>
          </div>
          <div>
            <p className="font-display text-2xl">{report.reused.length}</p>
            <p className="text-muted-foreground">Reused</p>
          </div>
          <div>
            <p className="font-display text-2xl">{report.stale.length}</p>
            <p className="text-muted-foreground">Ageing</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Section
          title="Weak passwords"
          description="Too short or too predictable to trust."
          icon={<AlertTriangle size={18} className="text-destructive" />}
          items={report.weak}
          meta={() => "Replace now"}
        />
        <Section
          title="Reused passwords"
          description="One breach would expose several accounts."
          icon={<Copy size={18} />}
          items={report.reused}
          meta={() => "Used more than once"}
        />
        <Section
          title="Ageing passwords"
          description="Unchanged for more than six months."
          icon={<Clock size={18} />}
          items={report.stale}
          meta={(item) => `${daysSince(item.password_updated_at)} days old`}
        />
        {!isLoading && report.healthScore === 100 && items.length > 0 && (
          <div className="flex items-center gap-3 rounded-3xl border border-border bg-accent p-6 text-accent-foreground">
            <ShieldCheck size={20} />
            <p className="text-sm font-medium">Every credential in your vault is ironclad.</p>
          </div>
        )}
      </div>
    </div>
  );
}