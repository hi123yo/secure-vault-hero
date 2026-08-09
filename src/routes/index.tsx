import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ironclad — Lock Down Your Passwords" },
      {
        name: "description",
        content:
          "Unbreakable password storage, one-tap access, and pro-grade security tools for your non-stop world.",
      },
      { property: "og:title", content: "Ironclad — Lock Down Your Passwords" },
      {
        property: "og:description",
        content:
          "Unbreakable password storage, one-tap access, and pro-grade security tools for your non-stop world.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_131516_eca35265-ea66-4fbd-8d52-22aae6e1a503.mp4"
      />
      <Navbar />
      <Hero />
    </main>
  );
}
