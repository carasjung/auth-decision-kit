"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, useUser, useDescope } from "@descope/nextjs-sdk/client";
import { Descope } from "@descope/nextjs-sdk";
import { METHOD_CONFIGS, AuthMethod, ALL_METHODS } from "@/lib/auth";
import { SessionInspector } from "@/app/components/SessionInspector";
import { DecisionMatrix } from "@/app/components/DecisionMatrix";
import { FailureSimulator } from "@/app/components/FailureSimulator";
import { CodeSnippet } from "@/app/components/CodeSnippet";

type Tab = "auth" | "session" | "matrix" | "failures" | "code";

const TABS: { id: Tab; label: string }[] = [
  { id: "auth", label: "01 · Auth Flow" },
  { id: "session", label: "02 · Session" },
  { id: "matrix", label: "03 · Decision Matrix" },
  { id: "failures", label: "04 · Failures" },
  { id: "code", label: "05 · Code" },
];

const METHOD_INSTRUCTIONS: Record<string, string> = {
  "magic-link": "→ Enter your email and click Continue. Check your inbox for a login link, it should arrive within 30 seconds.",
  "social": "→ Click 'Continue with Google' or 'Continue with Apple'. Ignore the email field. Typing there triggers magic link instead of social login.",
  "passkey": "→ Enter your email and click Continue. If you've registered a passkey on this device, your browser will prompt for Touch ID or Face ID. First time? You'll be asked to create one.",
};

export default function FlowPage({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>("auth");
  const [authComplete, setAuthComplete] = useState(false);
  const { isSessionLoading } = useSession();
  const { user } = useUser();
  const { logout } = useDescope();

  const config = METHOD_CONFIGS[method as AuthMethod];

  if (!config) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono text-sm"
        style={{ color: "#ffffff" }}
      >
        Unknown auth method.{" "}
        <Link href="/" style={{ color: "#fde68a" }}>
          Go back
        </Link>
      </div>
    );
  }

  const accent = `var(${config.accentVar})`;
  const glow = `var(${config.glowVar})`;

  const handleSignOut = () => {
    logout();
    setAuthComplete(false);
    setActiveTab("auth");
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#000000" }}>
      {/* Top bar */}
      <header
        className="px-8 py-5 flex items-center justify-between border-b sticky top-0 z-20"
        style={{ borderColor: "var(--border)", background: "#000000" }}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-mono text-xs transition-colors"
            style={{ color: "#ffffff" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
          >
            ← back
          </Link>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
          <span className="font-display text-sm font-600" style={{ color: accent }}>
            {config.label}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {ALL_METHODS.map((m) => {
            const c = METHOD_CONFIGS[m];
            const isActive = m === method;
            return (
              <Link
                key={m}
                href={`/flow/${m}`}
                className="font-mono text-xs px-3 py-1.5 rounded-sm transition-all"
                style={{
                  color: isActive ? `var(${c.accentVar})` : "#ffffff",
                  background: isActive ? `var(${c.glowVar})` : "transparent",
                  border: `1px solid ${isActive ? `var(${c.accentVar})` : "transparent"}`,
                }}
              >
                {c.label}
              </Link>
            );
          })}
          {(user || authComplete) && (
            <button
              onClick={handleSignOut}
              className="font-mono text-xs px-3 py-1.5 rounded-sm transition-all ml-2"
              style={{
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              sign out
            </button>
          )}
        </div>
      </header>

      {/* Tab nav */}
      <nav
        className="px-8 border-b flex gap-0 overflow-x-auto"
        style={{ borderColor: "var(--border)" }}
      >
        {TABS.map((tab) => {
          const locked = tab.id === "session" && !authComplete && !user;
          return (
            <button
              key={tab.id}
              onClick={() => !locked && setActiveTab(tab.id)}
              className="font-mono text-xs py-4 px-4 relative whitespace-nowrap transition-colors"
              style={{
                color: activeTab === tab.id ? accent : locked ? "rgba(255,255,255,0.4)" : "#ffffff",
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              {tab.label}
              {locked && <span className="ml-1.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>🔒</span>}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: accent }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab content */}
      <div className="flex-1 px-8 py-10 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "auth" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2
                    className="font-display text-xs tracking-widest uppercase mb-8"
                    style={{ color: "#ffffff" }}
                  >
                    What happens under the hood
                  </h2>
                  <ol className="space-y-4">
                    {config.steps.map((step, i) => (
                      <motion.li
                        key={i}
                        className="flex gap-4 items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <span className="font-mono text-xs mt-1 shrink-0 w-5" style={{ color: "#ffffff" }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-body text-base leading-snug" style={{ color: "#ffffff" }}>
                          {step}
                        </span>
                      </motion.li>
                    ))}
                  </ol>

                  <div className="mt-12">
                    <h3
                      className="font-display text-xs tracking-widest uppercase mb-5"
                      style={{ color: "#ffffff" }}
                    >
                      Key tradeoffs
                    </h3>
                    <div className="space-y-4">
                      {config.tradeoffs.map((t, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-sm"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                          <p className="font-body text-sm mb-2" style={{ color: "#ffffff" }}>
                            <span style={{ color: "var(--passkey)" }}>✓ </span>{t.pro}
                          </p>
                          <p className="font-body text-sm" style={{ color: "#ffffff" }}>
                            <span style={{ color: "var(--danger)" }}>✗ </span>{t.con}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h2
                    className="font-display text-xs tracking-widest uppercase mb-4"
                    style={{ color: "#ffffff" }}
                  >
                    Try it live
                  </h2>

                  {/* Method-specific instruction */}
                  <div
                    className="mb-6 p-4 rounded-sm"
                    style={{
                      background: glow,
                      border: `1px solid ${accent}`,
                    }}
                  >
                    <p className="font-mono text-xs leading-relaxed" style={{ color: "#ffffff" }}>
                      {METHOD_INSTRUCTIONS[config.id]}
                    </p>
                  </div>

                  {!authComplete && !user ? (
                    <div
                      className="p-6 rounded-sm"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <Descope
                        flowId={config.descope.flow}
                        onSuccess={() => {
                          setAuthComplete(true);
                          setActiveTab("session");
                        }}
                        onError={(e: CustomEvent) => console.error("Auth error:", e.detail)}
                        theme="dark"
                      />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-sm text-center"
                      style={{ background: glow, border: `1px solid ${accent}` }}
                    >
                      <div className="text-4xl mb-4" style={{ color: "#ffffff" }}>✓</div>
                      <p className="font-display text-lg font-600 mb-2" style={{ color: "#ffffff" }}>
                        Auth complete
                      </p>
                      <p className="font-body text-sm mb-6" style={{ color: "#ffffff" }}>
                        {user?.email || user?.name || "Signed in"}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setActiveTab("session")}
                          className="font-mono text-xs px-4 py-2 rounded-sm"
                          style={{ background: accent, color: "var(--bg)" }}
                        >
                          Inspect session →
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="font-mono text-xs px-4 py-2 rounded-sm"
                          style={{ border: "1px solid rgba(255,255,255,0.35)", color: "#ffffff" }}
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "session" && <SessionInspector config={config} user={user} />}
            {activeTab === "matrix" && <DecisionMatrix config={config} />}
            {activeTab === "failures" && <FailureSimulator config={config} />}
            {activeTab === "code" && <CodeSnippet config={config} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}