"use client";

import { motion } from "framer-motion";
import { MethodConfig } from "@/lib/auth";

interface Props {
  config: MethodConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

const IMPORTANCE_LABELS = {
  high: { label: "key claim", tint: "#86efac" },
  medium: { label: "useful", tint: "#fde68a" },
  low: { label: "context", tint: "rgba(255,255,255,0.4)" },
};

// Fake session data shaped like a real Descope JWT payload
function buildMockSession(methodId: string, userEmail?: string) {
  const base = {
    sub: "U2a8x9kL3mNqRpT4",
    iss: "https://api.descope.com/P2abc123",
    aud: ["P2abc123"],
    iat: Math.floor(Date.now() / 1000) - 30,
    exp: Math.floor(Date.now() / 1000) + 1209600,
    email: userEmail || "developer@example.com",
    loginIds: [userEmail || "developer@example.com"],
    verifiedEmail: true,
    name: "Dev User",
    roles: [],
    permissions: [],
    customClaims: {},
  };

  if (methodId === "magic-link") {
    return {
      ...base,
      authenticationMethod: "magiclink",
      amr: ["otp"],
    };
  }

  if (methodId === "social") {
    return {
      ...base,
      authenticationMethod: "oauth",
      amr: ["oauth"],
      picture: "https://avatars.githubusercontent.com/u/0",
      externalIds: { google: "117823946301823946" },
      customClaims: {
        provider: "google",
      },
      oauth: {
        google: {
          accessToken: "ya29.A0AfH6SMB...[truncated]",
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    };
  }

  if (methodId === "passkey") {
    return {
      ...base,
      authenticationMethod: "webauthn",
      amr: ["hwk", "user"],
      customClaims: {
        passkeyId: "AQIDBAUGBwgJ...[credential_id]",
      },
    };
  }

  return base;
}

export function SessionInspector({ config, user }: Props) {
  const mockSession = buildMockSession(config.id, user?.email);

  return (
    <div>
      <div className="mb-8">
        <h2
          className="font-display text-xs tracking-widest uppercase mb-2"
          style={{ color: "#ffffff" }}
        >
          JWT Session Payload
        </h2>
        <p className="font-body text-sm" style={{ color: "#ffffff" }}>
          {user
            ? "Your real session — annotated."
            : "A representative session for this auth method — complete auth to see your real claims."}{" "}
          Every claim explained.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: raw JSON */}
        <div>
          <h3
            className="font-mono text-xs mb-4"
            style={{ color: "#ffffff" }}
          >
            Raw payload
          </h3>
          <div
            className="rounded-sm p-5 overflow-auto max-h-[520px]"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <pre
              className="font-mono text-xs leading-relaxed"
              style={{ color: "#ffffff" }}
            >
              {JSON.stringify(mockSession, null, 2)
                .split("\n")
                .map((line, i) => (
                  <span
                    key={i}
                    style={{ color: "#ffffff", display: "block" }}
                  >
                    {line}
                  </span>
                ))}
            </pre>
          </div>
        </div>

        {/* Right: annotated highlights */}
        <div>
          <h3
            className="font-mono text-xs mb-4"
            style={{ color: "#ffffff" }}
          >
            What each claim means
          </h3>
          <div className="space-y-3">
            {config.sessionHighlights.map((highlight, i) => {
              const imp = IMPORTANCE_LABELS[highlight.importance];
              return (
                <motion.div
                  key={highlight.key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-sm"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <code
                      className="font-mono text-xs"
                      style={{ color: "#ffffff" }}
                    >
                      {highlight.key}
                    </code>
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-sm"
                      style={{
                        color: "#ffffff",
                        background: `${imp.tint}22`,
                        border: `1px solid ${imp.tint}55`,
                      }}
                    >
                      {imp.label}
                    </span>
                  </div>
                  <p
                    className="font-body text-sm leading-snug"
                    style={{ color: "#ffffff" }}
                  >
                    {highlight.note}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
