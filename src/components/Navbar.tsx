import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = ["Vault", "Plans", "Install", "News", "Help"];

function PrimaryButton({ className = "" }: { className?: string }) {
  return (
    <button
      className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-shadow hover:shadow-lg active:scale-95 ${className}`}
      style={{ backgroundColor: "#7342E2", color: "#fff" }}
    >
      Start For Free
    </button>
  );
}

function SecondaryButton({ className = "" }: { className?: string }) {
  return (
    <button
      className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-shadow hover:shadow-lg active:scale-95 ${className}`}
      style={{ backgroundColor: "#F2F2EE", color: "var(--color-text)" }}
    >
      Sign In
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5"
        style={{ maxWidth: 1280, margin: "0 auto" }}
      >
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text)" }}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <PrimaryButton />
          <SecondaryButton />
        </div>

        <button
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          style={{ color: "var(--color-text)" }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{
                backgroundColor: "rgba(25,40,55,0.35)",
                backdropFilter: "blur(4px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed top-0 right-0 z-50 flex flex-col"
              style={{
                width: "min(88vw, 360px)",
                height: "100dvh",
                backgroundColor: "#CFC8C5",
                boxShadow: "-12px 0 48px rgba(25,40,55,0.18)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ x: "100%", transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] } }}
            >
              <div className="flex items-center justify-between px-6 py-5">
                <Logo />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "rgba(25,40,55,0.1)",
                    color: "var(--color-text)",
                  }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div style={{ height: 1, backgroundColor: "rgba(25,40,55,0.12)", margin: "0 24px" }} />

              <div className="flex flex-col gap-1 px-6 py-6">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link}
                    href="#"
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: 0.18 + i * 0.07, duration: 0.4 },
                    }}
                    className="rounded-xl px-3 py-3 font-medium transition-colors hover:bg-black/10"
                    style={{ fontSize: "1.1rem", color: "var(--color-text)" }}
                  >
                    {link}
                  </motion.a>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 px-6 pb-8">
                <button
                  className="w-full py-3.5 rounded-full font-semibold transition-shadow hover:shadow-lg active:scale-95"
                  style={{ backgroundColor: "#7342E2", color: "#fff", fontSize: "0.95rem" }}
                >
                  Start For Free
                </button>
                <button
                  className="w-full py-3.5 rounded-full font-semibold transition-shadow hover:shadow-lg active:scale-95"
                  style={{
                    backgroundColor: "#F2F2EE",
                    color: "var(--color-text)",
                    fontSize: "0.95rem",
                  }}
                >
                  Sign In
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}