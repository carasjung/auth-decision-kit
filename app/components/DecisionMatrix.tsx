"use client";

import { motion } from "framer-motion";
import { MethodConfig, METHOD_CONFIGS, ALL_METHODS } from "@/lib/auth";

interface Props {
  config: MethodConfig;
}

const SCORE_CONFIG = {
  great: {
    label: "Great fit",
    short: "✓",
    color: "var(--passkey)",
    bg: "rgba(176, 232, 200, 0.08)",
    border: "rgba(176, 232, 200, 0.25)",
  },
  ok: {
    label: "Works, with caveats",
    short: "~",
    color: "var(--magic)",
    bg: "rgba(232, 213, 176, 0.08)",
    border: "rgba(232, 213, 176, 0.25)",
  },
  avoid: {
    label: "Avoid",
    short: "✗",
    color: "var(--danger)",
    bg: "rgba(232, 176, 176, 0.08)",
    border: "rgba(232, 176, 176, 0.25)",
  },
};

export function DecisionMatrix({ config }: Props) {
  const accent = `var(${config.accentVar})`;

  // Build a combined matrix: all contexts × all methods
  const allContexts = config.decisionMatrix.map((d) => d.context);

  return (
    <div>
      <div className="mb-8">
        <h2
          className="font-display text-xs tracking-widest uppercase mb-2"
          style={{ color: "#ffffff" }}
        >
          Decision Matrix
        </h2>
        <p className="font-body text-sm" style={{ color: "#ffffff" }}>
          Which auth method fits which product context and why.
        </p>
      </div>

      {/* Single method deep-dive */}
      <div className="mb-12">
        <h3 className="font-mono text-xs mb-5 flex items-center gap-2 flex-wrap">
          <span style={{ color: accent }}>{config.label}</span>
          <span style={{ color: "#ffffff" }}>— detailed scores</span>
        </h3>
        <div className="space-y-2">
          {config.decisionMatrix.map((item, i) => {
            const score = SCORE_CONFIG[item.score];
            return (
              <motion.div
                key={item.context}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 p-4 rounded-sm"
                style={{
                  background: score.bg,
                  border: `1px solid ${score.border}`,
                }}
              >
                <span
                  className="font-mono text-base w-5 shrink-0 mt-0.5"
                  style={{ color: score.color }}
                >
                  {score.short}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="font-display text-sm font-600"
                      style={{ color: "#ffffff" }}
                    >
                      {item.context}
                    </span>
                    <span
                      className="font-mono text-xs"
                      style={{ color: "#ffffff" }}
                    >
                      {score.label}
                    </span>
                  </div>
                  <p
                    className="font-body text-sm"
                    style={{ color: "#ffffff" }}
                  >
                    {item.reason}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cross-method comparison table */}
      <div>
        <h3
          className="font-mono text-xs mb-5"
          style={{ color: "#ffffff" }}
        >
          Compare all methods
        </h3>
        <div
          className="rounded-sm overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Header */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1.5fr repeat(3, 1fr)",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              className="px-4 py-3 font-mono text-xs"
              style={{ color: "#ffffff" }}
            >
              context
            </div>
            {ALL_METHODS.map((m) => {
              const c = METHOD_CONFIGS[m];
              return (
                <div
                  key={m}
                  className="px-4 py-3 font-mono text-xs text-center"
                  style={{
                    color:
                      m === config.id ? `var(${c.accentVar})` : "#ffffff",
                  }}
                >
                  {c.label}
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {allContexts.map((context, i) => (
            <div
              key={context}
              className="grid"
              style={{
                gridTemplateColumns: "1.5fr repeat(3, 1fr)",
                borderBottom:
                  i < allContexts.length - 1
                    ? "1px solid var(--border)"
                    : undefined,
              }}
            >
              <div
                className="px-4 py-3 font-body text-sm"
                style={{ color: "#ffffff" }}
              >
                {context}
              </div>
              {ALL_METHODS.map((m) => {
                const mc = METHOD_CONFIGS[m];
                const item = mc.decisionMatrix.find(
                  (d) => d.context === context
                );
                if (!item)
                  return (
                    <div key={m} className="px-4 py-3 text-center">
                      <span
                        className="font-mono text-xs"
                        style={{ color: "#ffffff" }}
                      >
                        —
                      </span>
                    </div>
                  );
                const score = SCORE_CONFIG[item.score];
                return (
                  <div
                    key={m}
                    className="px-4 py-3 text-center"
                    title={item.reason}
                    style={{
                      background:
                        m === config.id ? score.bg : "transparent",
                    }}
                  >
                    <span
                      className="font-mono text-base"
                      style={{ color: score.color }}
                    >
                      {score.short}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p
          className="font-mono text-xs mt-3"
          style={{ color: "#ffffff" }}
        >
          Highlighted column = current method
        </p>
      </div>
    </div>
  );
}
