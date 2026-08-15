import { useState } from "react";
import { Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PhoneSettings({ currentPhone }: { currentPhone: string }) {
  const [phone, setPhone] = useState(currentPhone ? `+${currentPhone}` : "");
  const [saved, setSaved] = useState(currentPhone);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);

  async function startChange() {
    const value = phone.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(value)) {
      toast.error("Enter your number in international format, e.g. +14155550123.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ phone: value });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("provider") ||
          error.message.toLowerCase().includes("sms")
          ? "SMS delivery isn't available yet — enable phone sign-in for this project."
          : error.message,
      );
      return;
    }
    setPending(true);
    toast.success("We texted you a confirmation code.");
  }

  async function confirm() {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: "phone_change",
    });
    setBusy(false);
    if (error) {
      toast.error("That code isn't valid or has expired.");
      return;
    }
    setPending(false);
    setCode("");
    setSaved(phone.trim().replace("+", ""));
    toast.success("SMS unlock is enabled.");
  }

  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-lg">SMS unlock</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {saved
          ? "Your vault can be unlocked with a code texted to your phone."
          : "Add a mobile number to unlock your vault with a text message code."}
      </p>
      <div className="mt-4 max-w-xs">
        <Label htmlFor="phone">Mobile number</Label>
        <Input
          id="phone"
          className="mt-1.5"
          placeholder="+14155550123"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      {pending ? (
        <div className="mt-4 max-w-xs">
          <Label htmlFor="phone-code">Confirmation code</Label>
          <Input
            id="phone-code"
            className="mt-1.5"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <Button className="mt-4 rounded-full" disabled={busy} onClick={confirm}>
            Confirm number
          </Button>
        </div>
      ) : (
        <Button className="mt-4 rounded-full" disabled={busy} onClick={startChange}>
          <Smartphone size={16} /> {saved ? "Update number" : "Enable SMS unlock"}
        </Button>
      )}
    </div>
  );
}
