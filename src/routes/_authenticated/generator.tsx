import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { generatePassword, type GeneratorOptions } from "@/lib/vault";
import { StrengthBar } from "@/components/app/StrengthBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/generator")({
  component: Generator,
});

function Generator() {
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 20,
    upper: true,
    digits: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");

  useEffect(() => {
    setPassword(generatePassword(options));
  }, [options]);

  const toggles: { key: keyof GeneratorOptions; label: string }[] = [
    { key: "upper", label: "Uppercase letters" },
    { key: "digits", label: "Numbers" },
    { key: "symbols", label: "Symbols" },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-3xl">Password generator</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Random, unguessable passwords generated on your device.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="break-all rounded-2xl bg-secondary p-4 font-mono text-lg">{password}</p>
        <div className="mt-4">
          <StrengthBar password={password} />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            className="rounded-full"
            onClick={async () => {
              await navigator.clipboard.writeText(password);
              toast.success("Password copied.");
            }}
          >
            <Copy size={16} /> Copy
          </Button>
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => setPassword(generatePassword(options))}
          >
            <RefreshCw size={16} /> Regenerate
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <Label>Length</Label>
          <span className="font-display text-lg">{options.length}</span>
        </div>
        <Slider
          className="mt-4"
          min={8}
          max={48}
          step={1}
          value={[options.length]}
          onValueChange={([value]) => setOptions((o) => ({ ...o, length: value ?? o.length }))}
        />

        <div className="mt-6 flex flex-col divide-y divide-border">
          {toggles.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={Boolean(options[key])}
                onCheckedChange={(checked) => setOptions((o) => ({ ...o, [key]: checked }))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}