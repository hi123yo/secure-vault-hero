import { motion, type Variants } from "framer-motion";
import { ArrowRightCircle, Fingerprint, LockKeyhole, Zap } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const iconStyle = {
  color: "#192837",
  display: "inline",
  verticalAlign: "middle",
  position: "relative" as const,
  top: -2,
  margin: "0 4px",
};

export function Hero() {
  return (
    <section
      className="relative z-10"
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        paddingTop: "clamp(40px, 8vw, 72px)",
        paddingBottom: 48,
      }}
    >
      <div
        className="flex flex-col items-center px-5"
        style={{ maxWidth: 660, margin: "0 auto" }}
      >
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.65rem, 5vw, 3rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "var(--color-text)",
            textAlign: "center",
            margin: 0,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>
            Lock
            <Zap size={24} style={iconStyle} />
            Down Your
            <LockKeyhole size={24} style={iconStyle} />
            Passwords
          </span>
          <br />
          with Ironclad Security
          <Fingerprint size={24} style={{ ...iconStyle, margin: undefined, marginLeft: 6 }} />
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
            color: "var(--color-text)",
            opacity: 0.8,
            maxWidth: 560,
            lineHeight: 1.65,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Zero stress, total control. Unbreakable storage, one-tap access, and pro-grade tools for
          your non-stop world.
        </motion.p>

        <motion.button
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.04, filter: "brightness(1.1)" }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center justify-between"
          style={{
            marginTop: 32,
            borderRadius: 50,
            backgroundColor: "#7342E2",
            color: "#fff",
            fontSize: "clamp(0.9rem, 2vw, 1rem)",
            fontWeight: 600,
            padding: "17px 24px",
            minWidth: 210,
            gap: 32,
            boxShadow: "0 4px 24px rgba(115,66,226,0.28)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Get It Free
          <ArrowRightCircle size={20} />
        </motion.button>
      </div>
    </section>
  );
}