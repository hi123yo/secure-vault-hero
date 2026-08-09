import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans & pricing — Ironclad Password Manager" },
      {
        name: "description",
        content:
          "Compare Ironclad plans: a free personal vault, Pro for power users, and Family for up to six people.",
      },
      { property: "og:title", content: "Plans & pricing — Ironclad Password Manager" },
      {
        property: "og:description",
        content: "A free personal vault, Pro for power users, and Family for up to six people.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Plans,
});

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    highlight: false,
    features: ["Unlimited passwords", "One device sync", "Password generator", "Security check"],
  },
  {
    name: "Pro",
    price: "$3",
    cadence: "per month",
    highlight: true,
    features: [
      "Everything in Free",
      "Unlimited device sync",
      "Breach monitoring",
      "Encrypted notes & files",
      "Priority support",
    ],
  },
  {
    name: "Family",
    price: "$6",
    cadence: "per month",
    highlight: false,
    features: ["Everything in Pro", "Up to 6 members", "Shared vaults", "Admin recovery"],
  },
];

function Plans() {
  return (
    <div className="min-h-screen bg-secondary">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={26} />
          <span className="font-display text-lg">Ironclad</span>
        </Link>
        <Button asChild className="rounded-full">
          <Link to="/auth">Start for free</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8">
        <h1 className="font-display text-center text-3xl sm:text-5xl">Simple, ironclad pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Start free and upgrade when you want breach monitoring, unlimited sync and shared vaults.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-3xl border bg-card p-7 ${
                plan.highlight ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              {plan.highlight && (
                <span className="mb-3 self-start rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-xl">{plan.name}</h2>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.cadence}</span>
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.highlight ? "default" : "secondary"}
                className="mt-7 w-full rounded-full py-6"
              >
                <Link to="/auth">{plan.name === "Free" ? "Get started" : `Choose ${plan.name}`}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}