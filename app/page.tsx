"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ALL_METHODS, METHOD_CONFIGS } from "@/lib/auth";

/** Bordered cards on black — fill stays near-black; accent is the border */
const METHOD_CARD_BORDER: Record<string, string> = {
  "magic-link": "#fdba74",
  social: "#7dd3fc",
  passkey: "#86efac",
};

const FLOW_FEATURES = [
  {
    icon: "①",
    title: "Live auth flow",
    desc: "Authenticate for real using Descope and see the actual UX your users experience",
    accent: "#fdba74",
  },
  {
    icon: "②",
    title: "Session inspector",
    desc: "Inspect every claim in your JWT with annotations so you understand each field instantly",
    accent: "#7dd3fc",
  },
  {
    icon: "③",
    title: "Decision matrix",
    desc: "Green / yellow / red ratings across 6 product contexts: consumer, fintech, B2B, and more",
    accent: "#86efac",
  },
  {
    icon: "④",
    title: "Failure simulator",
    desc: "Break each flow intentionally: expired links, missing passkeys, denied OAuth",
    accent: "#fdba74",
  },
] as const;

const LINK_BLUE = "#7dd3fc";
const LINK_BLUE_HOVER = "#bae6fd";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center bg-black text-white box-border w-full"
      style={{
        padding:
          "clamp(2rem, 6vh, 4rem) clamp(1.5rem, 8vw, 5rem) clamp(2.5rem, 7vh, 4.5rem)",
      }}
    >
      {/* Hero + methods: centered column; items-center on main prevents full-width stretch */}
      <div className="flex flex-1 flex-col items-center justify-center w-full max-w-5xl text-center">
        <motion.span
          className="font-mono text-xs tracking-widest uppercase px-3 py-1.5 rounded-full mb-10"
          style={{
            color: LINK_BLUE,
            border: "1px solid rgba(125, 211, 252, 0.45)",
            background: "rgba(125, 211, 252, 0.12)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Built with Descope
        </motion.span>

        <motion.h1
          className="font-display font-800 leading-none tracking-tight mb-8 whitespace-nowrap"
          style={{
            color: "#ffffff",
            fontSize: "clamp(1.65rem, 6vw, 4rem)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          Auth Decision Kit
        </motion.h1>

        <motion.p
          className="text-base md:text-lg leading-relaxed mb-4 max-w-2xl mx-auto px-1"
          style={{ color: "#ffffff" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          A demo of three auth methods. Real flows. 
        </motion.p>

        <motion.p
          className="font-mono text-sm mb-12"
          style={{ color: LINK_BLUE }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.28 }}
        >
          Pick a method and try it live
        </motion.p>

        {/* One row: fixed-width cards, horizontal scroll on very narrow viewports */}
        <div
          className="flex flex-row flex-nowrap justify-center gap-4 sm:gap-5 md:gap-6 w-full max-w-4xl mx-auto overflow-x-auto pb-1 [scrollbar-width:thin]"
          style={{ scrollbarColor: `${LINK_BLUE}33 transparent` }}
        >
          {ALL_METHODS.map((method, i) => {
            const config = METHOD_CONFIGS[method];
            const border =
              METHOD_CARD_BORDER[method] ?? "rgba(255,255,255,0.35)";

            return (
              <motion.div
                key={method}
                className="shrink-0 w-[min(100%,11.5rem)] sm:w-52 md:w-56"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 * i + 0.35 }}
              >
                <Link href={`/flow/${method}`} className="block group h-full">
                  <div
                    className="h-full rounded-xl px-4 py-4 sm:px-5 sm:py-5 text-center transition-colors duration-200 cursor-pointer"
                    style={{
                      background: "#0a0a0a",
                      border: `2px solid ${border}`,
                      boxShadow: `0 0 0 1px ${border}22`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#141414";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#0a0a0a";
                    }}
                  >
                    <h2
                      className="font-display text-sm sm:text-base font-700 leading-tight"
                      style={{ color: "#ffffff" }}
                    >
                      {config.label}
                    </h2>
                    <p
                      className="mt-2 text-xs sm:text-sm leading-snug font-body"
                      style={{ color: "#ffffff" }}
                    >
                      {config.tagline}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <section
        className="w-full max-w-2xl text-center mt-20 pt-14 border-t self-center"
        style={{ borderColor: "rgba(125, 211, 252, 0.28)" }}
      >
        <motion.h2
          className="font-display text-xs font-600 tracking-widest uppercase mb-10"
          style={{ color: LINK_BLUE }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          What each flow shows you
        </motion.h2>
        <div className="flex flex-col items-center gap-10 sm:gap-11">
          {FLOW_FEATURES.map((item, i) => (
            <motion.div
              key={item.title}
              className="max-w-xl text-center px-2"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="text-xl sm:text-2xl mb-2" style={{ color: item.accent }}>
                {item.icon}
              </div>
              <h3
                className="font-display text-sm font-700 mb-2"
                style={{ color: "#ffffff" }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "#ffffff" }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer
        className="w-full max-w-2xl mt-14 pt-10 border-t flex flex-col items-center gap-6 text-center self-center"
        style={{ borderColor: "rgba(125, 211, 252, 0.28)" }}
      >
        <span className="font-mono text-xs" style={{ color: "#86efac" }}>
          auth-decision-kit
        </span>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-xs"
          aria-label="External links"
        >
          <a
            href="https://www.descope.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: LINK_BLUE }}
            onMouseEnter={(e) => (e.currentTarget.style.color = LINK_BLUE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.color = LINK_BLUE)}
          >
            Descope
          </a>
          <a
            href="https://github.com/carasjung/auth-decision-kit"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors"
            style={{ color: LINK_BLUE }}
            onMouseEnter={(e) => (e.currentTarget.style.color = LINK_BLUE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.color = LINK_BLUE)}
          >
            GitHub
          </a>
        </nav>
      </footer>
    </main>
  );
}
