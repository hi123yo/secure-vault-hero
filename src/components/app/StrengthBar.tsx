import { scorePassword } from "@/lib/vault";

const TONE = [
  "bg-destructive",
  "bg-destructive",
  "bg-chart-5",
  "bg-chart-2",
  "bg-primary",
] as const;

export function StrengthBar({ password }: { password: string }) {
  const { score, label } = scorePassword(password);
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-1.5 flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`flex-1 rounded-full ${i < score ? TONE[score] : "bg-border"}`}
          />
        ))}
      </div>
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}