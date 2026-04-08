"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MethodConfig } from "@/lib/auth";

interface Props {
  config: MethodConfig;
}

type SimState = "idle" | "running" | "failed";

export function FailureSimulator({ config }: Props) {
  const accent = `var(${config.accentVar})`;
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [simState, setSimState] = useState<SimState>("idle");
  const [errorOutput, setErrorOutput] = useState<string>("");

  const ERROR_OUTPUTS: Record<string, string> = {
    "expired-link": `// Descope onError callback
{
  "error": {
    "errorCode": "E011303",
    "errorDescription": "Token is expired",
    "errorMessage": "Magic link token has expired. Please request a new one."
  }
}

// What to do in your UI:
if (e.detail.error.errorCode === 'E011303') {
  showToast('Your link expired. We sent a new one!');
  await requestNewMagicLink(email);
}`,

    "wrong-device": `// This scenario actually SUCCEEDS in Descope by default.
// The token is validated server-side regardless of device.

{
  "success": true,
  "user": { "email": "user@example.com" },
  "note": "Same-device enforcement requires custom flow logic"
}

// If you DO want same-device enforcement, add a 
// custom step in your Descope flow to validate a 
// device fingerprint stored in the token.`,

    "email-blocked": `// No error is returned — Descope sent the email successfully.
// The failure is invisible: user simply never receives it.

// Best practice: surface this proactively in your UI
setTimeout(() => {
  if (!authComplete) {
    showMessage(
      "Didn't get the email? Check your spam folder, or " +
      "try signing in with a code instead."
    );
    offerOTPFallback(); // Configure OTP fallback in your Descope flow
  }
}, 15000); // Show after 15s`,

    "provider-denied": `// Descope onError callback — user clicked 'Cancel' on OAuth screen
{
  "error": {
    "errorCode": "E062503", 
    "errorDescription": "OAuth flow was cancelled by the user",
    "errorMessage": "Sign in was cancelled."
  }
}

// Handle gracefully — don't treat this as an error
if (e.detail.error.errorCode === 'E062503') {
  // User chose not to sign in — don't show an error toast
  // Just return them to the login screen silently
  resetAuthUI();
}`,

    "duplicate-account": `// Descope onError callback — email already exists via different method
{
  "error": {
    "errorCode": "E034105",
    "errorDescription": "User with this email already exists",
    "errorMessage": "An account with this email is registered with a different sign-in method."
  }
}

// Two options:
// 1. Enable auto-linking in Descope Console → Project → Settings
// 2. Handle manually:
if (e.detail.error.errorCode === 'E034105') {
  showMessage('You have an existing account. Try signing in with magic link.');
}`,

    "provider-outage": `// OAuth exchange fails — provider is unreachable
{
  "error": {
    "errorCode": "E062500",
    "errorDescription": "OAuth provider returned an error",
    "errorMessage": "Unable to complete sign in. Please try again."
  }
}

// Always offer a non-OAuth fallback:
// Configure magic link OR passkey as an alternative
// in your Descope flow so users aren't fully locked out.`,

    "no-passkey-enrolled": `// WebAuthn — no credential found on this device
// Browser throws: NotAllowedError
// Descope surfaces it as:
{
  "error": {
    "errorCode": "E083002",
    "errorDescription": "WebAuthn operation was not allowed",
    "errorMessage": "No passkey found for this device."
  }
}

// Recovery flow:
if (e.detail.error.errorCode === 'E083002') {
  showMessage('No passkey on this device. We\'ll verify you another way.');
  // Fall back to magic link, verify identity, then:
  await sdk.passkeys.signUpOrIn(loginId); // Enroll passkey on new device
}`,

    "biometric-failed": `// WebAuthn — biometric check failed or user cancelled
// Browser: NotAllowedError (after retry limit)
{
  "error": {
    "errorCode": "E083002",
    "errorDescription": "WebAuthn operation was not allowed"
  }
}

// The browser handles retries natively — you don't need to.
// After browser gives up, offer fallback:
if (e.detail.error.errorCode === 'E083002') {
  showOptions([
    { label: 'Try again', action: retryPasskey },
    { label: 'Use a different method', action: showAlternatives }
  ]);
}`,

    "browser-unsupported": `// WebAuthn not available — older browser or OS
// Check BEFORE showing passkey option:

const isWebAuthnSupported = () => {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
};

// In your UI:
if (!isWebAuthnSupported()) {
  // Hide passkey button entirely — don't show a broken option
  hidePasskeyButton();
  // Show only magic link / social
}

// Advanced: check if platform authenticator is available
PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  .then(available => {
    if (!available) hidePasskeyButton();
  });`,
  };

  const runSimulation = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    setSimState("running");
    setErrorOutput("");

    setTimeout(() => {
      setSimState("failed");
      setErrorOutput(ERROR_OUTPUTS[scenarioId] || "// Unknown scenario");
    }, 1200);
  };

  const reset = () => {
    setActiveScenario(null);
    setSimState("idle");
    setErrorOutput("");
  };

  return (
    <div>
      <div className="mb-8">
        <h2
          className="font-display text-xs tracking-widest uppercase mb-2"
          style={{ color: "#ffffff" }}
        >
          Failure Simulator
        </h2>
        <p className="font-body text-sm" style={{ color: "#ffffff" }}>
          Every auth method fails differently. See exactly what Descope returns
           and what you should do about it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scenario picker */}
        <div>
          <h3
            className="font-mono text-xs mb-4"
            style={{ color: "#ffffff" }}
          >
            Choose a failure scenario
          </h3>
          <div className="space-y-2">
            {config.failureScenarios.map((scenario) => {
              const isActive = activeScenario === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => runSimulation(scenario.id)}
                  className="w-full text-left p-4 rounded-sm transition-all"
                  style={{
                    background: isActive
                      ? "var(--danger-glow)"
                      : "var(--surface)",
                    border: `1px solid ${
                      isActive ? "var(--danger)" : "var(--border)"
                    }`,
                  }}
                >
                  <div
                    className="font-display text-sm font-600 mb-1"
                    style={{
                      color: isActive ? "var(--danger)" : "#ffffff",
                    }}
                  >
                    {scenario.label}
                  </div>
                  <div
                    className="font-body text-xs leading-snug"
                    style={{ color: "#ffffff" }}
                  >
                    {scenario.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Output panel */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-mono text-xs"
              style={{ color: "#ffffff" }}
            >
              Error output + fix
            </h3>
            {simState !== "idle" && (
              <button
                onClick={reset}
                className="font-mono text-xs transition-colors"
                style={{ color: "#ffffff" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#ffffff")
                }
              >
                reset
              </button>
            )}
          </div>

          <div
            className="rounded-sm min-h-[400px] flex flex-col"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Terminal header */}
            <div
              className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--danger)" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--magic)" }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--passkey)" }}
              />
              <span
                className="font-mono text-xs ml-2"
                style={{ color: "#ffffff" }}
              >
                error output
              </span>
            </div>

            <div className="flex-1 p-4">
              <AnimatePresence mode="wait">
                {simState === "idle" && (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-mono text-xs"
                    style={{ color: "#ffffff" }}
                  >
                    ← select a scenario to simulate
                  </motion.p>
                )}

                {simState === "running" && (
                  <motion.div
                    key="running"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {["Initiating auth flow...", "Triggering failure condition...", "Capturing error response..."].map(
                      (msg, i) => (
                        <motion.p
                          key={msg}
                          className="font-mono text-xs"
                          style={{ color: "#ffffff" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.3 }}
                        >
                          {msg}
                        </motion.p>
                      )
                    )}
                  </motion.div>
                )}

                {simState === "failed" && errorOutput && (
                  <motion.div
                    key="failed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Scenario details */}
                    {activeScenario && (() => {
                      const scenario = config.failureScenarios.find(
                        (s) => s.id === activeScenario
                      );
                      if (!scenario) return null;
                      return (
                        <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                          <p className="font-mono text-xs mb-1" style={{ color: "var(--danger)" }}>
                            // Descope handling
                          </p>
                          <p className="font-body text-xs leading-relaxed" style={{ color: "#ffffff" }}>
                            {scenario.descopeHandling}
                          </p>
                        </div>
                      );
                    })()}
                    <pre
                      className="font-mono text-xs leading-relaxed whitespace-pre-wrap"
                      style={{ color: "#ffffff" }}
                    >
                      {errorOutput.split("\n").map((line, i) => {
                        const isComment = line.trim().startsWith("//");
                        return (
                          <span
                            key={i}
                            style={{
                              color: isComment
                                ? "rgba(255,255,255,0.85)"
                                : line.includes('"errorCode"') ||
                                  line.includes('"error"')
                                ? "var(--danger)"
                                : "#ffffff",
                              display: "block",
                            }}
                          >
                            {line}
                          </span>
                        );
                      })}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
