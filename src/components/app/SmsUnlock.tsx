import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 4 ? `••• ••• ${digits.slice(-4)}` : phone;
}

export function SmsUnlock({
  phone,
  onUnlock,
}: {
  phone: string;
  onUnlock: () => void;
}) {
  const [stage, setStage] = useState<"idle" | "sent">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true);
    setError(null);
    const { error: sendError } = await supabase.auth.reauthenticate();
    setBusy(false);
    if (sendError) {
      setError(
        sendError.message.toLowerCase().includes("sms") ||
          sendError.message.toLowerCase().includes("provider")
          ? "SMS delivery isn't available yet — enable phone sign-in for this project."
          : sendError.message,
      );
      return;
    }
    setStage("sent");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code.trim(),
      type: "phone_change",
    });
    setBusy(false);
    if (verifyError) {
      setError("That code isn't valid or has expired.");
      return;
    }
    onUnlock();
  }

  if (stage === "idle") {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          We'll text a 6-digit code to {maskPhone(phone)}.
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <Button className="mt-5 w-full rounded-full py-6" disabled={busy} onClick={sendCode}>
          <MessageSquare size={16} /> {busy ? "Sending…" : "Text me a code"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={verify}>
      <Label htmlFor="sms-code">6-digit code</Label>
      <Input
        id="sms-code"
        autoFocus
        inputMode="numeric"
        maxLength={6}
        placeholder="123456"
        className="mt-1.5 text-center text-lg tracking-[0.4em]"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        required
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" className="mt-5 w-full rounded-full py-6" disabled={busy}>
        {busy ? "Verifying…" : "Unlock vault"}
      </Button>
      <button
        type="button"
        className="mt-3 w-full text-sm text-muted-foreground underline"
        onClick={sendCode}
        disabled={busy}
      >
        Resend code
      </button>
    </form>
  );
}
