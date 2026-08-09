import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Lock, LogOut, Settings, Shield, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useLock } from "./lock-context";
import type { ReactNode } from "react";

const NAV = [
  { to: "/vault", label: "Vault", icon: KeyRound },
  { to: "/generator", label: "Generator", icon: Wand2 },
  { to: "/security", label: "Security", icon: Shield },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lock } = useLock();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
        <Link to="/vault" className="mb-8 flex items-center gap-2">
          <Logo size={26} />
          <span className="font-display text-lg">Ironclad</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Button variant="secondary" className="justify-start rounded-xl" onClick={lock}>
            <Lock size={16} /> Lock vault
          </Button>
          <Button variant="ghost" className="justify-start rounded-xl" onClick={signOut}>
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link to="/vault" className="flex items-center gap-2">
            <Logo size={22} />
            <span className="font-display">Ironclad</span>
          </Link>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={lock} aria-label="Lock vault">
              <Lock size={18} />
            </Button>
            <Button size="icon" variant="ghost" onClick={signOut} aria-label="Sign out">
              <LogOut size={18} />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-sidebar md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-sidebar-foreground"
              activeProps={{ className: "text-sidebar-accent-foreground" }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}