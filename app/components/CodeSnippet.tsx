"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MethodConfig } from "@/lib/auth";

interface Props {
  config: MethodConfig;
}

export function CodeSnippet({ config }: Props) {
  const accent = `var(${config.accentVar})`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(config.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h2
          className="font-display text-xs tracking-widest uppercase mb-2"
          style={{ color: "#ffffff" }}
        >
          Implementation
        </h2>
        <p className="font-body text-sm" style={{ color: "#ffffff" }}>
          Production-ready code for {config.label} with Descope — annotated
          with what actually matters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Code block — 2/3 width */}
        <div className="md:col-span-2">
          <div
            className="rounded-sm overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-2)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-mono text-xs"
                  style={{ color: "#ffffff" }}
                >
                  app/login/page.tsx
                </span>
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-sm"
                  style={{
                    color: "#ffffff",
                    background: `var(${config.glowVar})`,
                    border: `1px solid ${accent}40`,
                  }}
                >
                  {config.label}
                </span>
              </div>
              <button
                onClick={copy}
                className="font-mono text-xs transition-colors"
                style={{
                  color: copied ? "var(--passkey)" : "#ffffff",
                }}
              >
                {copied ? "copied ✓" : "copy"}
              </button>
            </div>

            {/* Code */}
            <div
              className="p-5 overflow-auto max-h-[560px]"
              style={{ background: "var(--surface)" }}
            >
              <pre className="font-mono text-xs leading-relaxed">
                {config.codeSnippet.split("\n").map((line, i) => {
                  const isComment = line.trim().startsWith("//");
                  return (
                    <span
                      key={i}
                      style={{
                        color: isComment
                          ? "rgba(255,255,255,0.85)"
                          : "#ffffff",
                        display: "block",
                      }}
                    >
                      {line || " "}
                    </span>
                  );
                })}
              </pre>
            </div>
          </div>
        </div>

        {/* Right: context */}
        <div className="space-y-6">
          <div>
            <h3
              className="font-mono text-xs mb-4"
              style={{ color: "#ffffff" }}
            >
              Descope resources
            </h3>
            <div className="space-y-2">
              {[
                {
                  label: "Descope Docs",
                  url: "https://docs.descope.com",
                  note: "Full SDK reference",
                },
                {
                  label: "Flow Builder",
                  url: "https://app.descope.com",
                  note: "Configure your auth flows visually",
                },
                {
                  label: "Next.js SDK",
                  url: "https://www.npmjs.com/package/@descope/nextjs-sdk",
                  note: "npm package",
                },
                {
                  label: "Sample Apps",
                  url: "https://github.com/descope-sample-apps",
                  note: "GitHub",
                },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-sm transition-all group"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div>
                    <span
                      className="font-mono text-xs block"
                      style={{ color: "#ffffff" }}
                    >
                      {link.label}
                    </span>
                    <span
                      className="font-body text-xs"
                      style={{ color: "#ffffff" }}
                    >
                      {link.note}
                    </span>
                  </div>
                  <span style={{ color: "#ffffff" }}>↗</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="font-mono text-xs mb-4"
              style={{ color: "#ffffff" }}
            >
              Quick setup
            </h3>
            <div
              className="p-4 rounded-sm space-y-3"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {[
                "npm i @descope/nextjs-sdk",
                "Add NEXT_PUBLIC_DESCOPE_PROJECT_ID to .env.local",
                "Wrap your app with <AuthProvider>",
                `Enable ${config.label} in Descope Console → Flows`,
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span
                    className="font-mono text-xs shrink-0"
                    style={{ color: accent }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    className="font-mono text-xs leading-relaxed"
                    style={{ color: "#ffffff" }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
