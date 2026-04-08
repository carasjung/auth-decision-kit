export type AuthMethod = "magic-link" | "social" | "passkey";

export interface MethodConfig {
  id: AuthMethod;
  label: string;
  tagline: string;
  accentVar: string;
  glowVar: string;
  steps: string[];
  sessionHighlights: SessionHighlight[];
  decisionMatrix: DecisionScore[];
  codeSnippet: string;
  tradeoffs: { pro: string; con: string }[];
  failureScenarios: FailureScenario[];
  descope: {
    flow: string;
    component?: string;
  };
}

export interface SessionHighlight {
  key: string;
  label: string;
  note: string;
  importance: "high" | "medium" | "low";
}

export interface DecisionScore {
  context: string;
  score: "great" | "ok" | "avoid";
  reason: string;
}

export interface FailureScenario {
  id: string;
  label: string;
  description: string;
  descopeHandling: string;
  devAction: string;
}

export const METHOD_CONFIGS: Record<AuthMethod, MethodConfig> = {
  "magic-link": {
    id: "magic-link",
    label: "Magic Link",
    tagline: "No password. Just a link.",
    accentVar: "--magic",
    glowVar: "--magic-glow",
    steps: [
      "User enters email address",
      "Descope sends a time-limited email with a signed token",
      "User clicks the link. Browser completes the OAuth exchange",
      "Session is established. JWT is issued",
    ],
    sessionHighlights: [
      {
        key: "loginIds",
        label: "loginIds",
        note: "The verified email address. Your primary identifier",
        importance: "high",
      },
      {
        key: "email",
        label: "email",
        note: "Always present for magic link; confirmed ownership at auth time",
        importance: "high",
      },
      {
        key: "verifiedEmail",
        label: "verifiedEmail",
        note: "Always true after magic link. Link click = proof of inbox access",
        importance: "medium",
      },
      {
        key: "authenticationMethod",
        label: "authenticationMethod",
        note: 'Value: "magiclink" — useful for risk scoring or step-up decisions',
        importance: "medium",
      },
      {
        key: "exp",
        label: "exp",
        note: "Session expiry — Descope default is 2 weeks, configurable per flow",
        importance: "low",
      },
    ],
    decisionMatrix: [
      {
        context: "Consumer app",
        score: "great",
        reason: "Low friction, no password to forget",
      },
      {
        context: "Internal tool",
        score: "ok",
        reason: "Works fine, but SSO is usually a better fit",
      },
      {
        context: "Fintech / banking",
        score: "ok",
        reason: "Email-only auth may not meet compliance; pair with MFA",
      },
      {
        context: "B2B SaaS",
        score: "ok",
        reason: "Good for early-stage, but tenants will ask for SSO later",
      },
      {
        context: "Mobile-first app",
        score: "avoid",
        reason: "Context switch to email app creates drop-off",
      },
      {
        context: "High-security system",
        score: "avoid",
        reason: "Email as sole factor is insufficient. Add step-up auth",
      },
    ],
    tradeoffs: [
      {
        pro: "Zero password management for users or you",
        con: "Requires inbox access at login. Breaks on shared/corp email filters",
      },
      {
        pro: "Email is implicitly verified on first login",
        con: "Context switch (app → email → back) causes mobile drop-off",
      },
      {
        pro: "Simple to implement, works everywhere",
        con: "Link expiry causes confusion if user delays clicking",
      },
    ],
    codeSnippet: `import { Descope } from '@descope/nextjs-sdk';

// Drop the Descope component into your page
// Flow: 'sign-up-or-in' handles both new + returning users
export default function LoginPage() {
  return (
    <Descope
      flowId="sign-up-or-in"
      onSuccess={(e) => {
        const session = e.detail.user;
        // session.email is verified — safe to use as identity
        redirectUser(session);
      }}
      onError={(e) => {
        // e.detail.error — handle expired link, etc.
        console.error(e.detail.error);
      }}
    />
  );
}

// Protect a server-side route
import { session } from '@descope/nextjs-sdk/server';

export default async function ProtectedPage() {
  const { token } = await session();
  // token.authenticationMethod === 'magiclink'
}`,
    failureScenarios: [
      {
        id: "expired-link",
        label: "Link expired",
        description:
          "User waits too long (default: 2 min) before clicking the magic link",
        descopeHandling:
          "Descope returns a token_expired error with a clear error code",
        devAction:
          'Catch onError, check error.errorCode === "E011303", prompt user to request a new link',
      },
      {
        id: "wrong-device",
        label: "Different device / browser",
        description: "Link opened in a different browser than where auth began",
        descopeHandling:
          "Descope validates the token regardless of device. This succeeds by default",
        devAction:
          "No action needed unless you want to enforce same-device with custom flow logic",
      },
      {
        id: "email-blocked",
        label: "Email filtered / blocked",
        description:
          "Corporate spam filter strips or rewrites the magic link URL",
        descopeHandling:
          "Descope has no visibility into email delivery. The user simply never receives it",
        devAction:
          "Offer OTP as a fallback in your Descope flow; show 'check spam' guidance in the UI",
      },
    ],
    descope: {
      flow: "sign-up-or-in",
      component: "Descope",
    },
  },

  social: {
    id: "social",
    label: "Social Login",
    tagline: "One tap. Existing identity.",
    accentVar: "--social",
    glowVar: "--social-glow",
    steps: [
      "User clicks a social provider button (Google, GitHub, etc.)",
      "OAuth redirect to provider's consent screen",
      "Provider returns authorization code to Descope callback",
      "Descope exchanges code for tokens and creates/links user account",
      "Session is established. JWT issued with provider claims",
    ],
    sessionHighlights: [
      {
        key: "oauth",
        label: "oauth",
        note: "Contains provider access token. Use this to call provider APIs on behalf of user",
        importance: "high",
      },
      {
        key: "picture",
        label: "picture",
        note: "Avatar URL from provider. Free profile enrichment",
        importance: "medium",
      },
      {
        key: "name",
        label: "name",
        note: "Full name from provider, but let users edit it; providers aren't always accurate",
        importance: "medium",
      },
      {
        key: "authenticationMethod",
        label: "authenticationMethod",
        note: 'Value: "oauth" — check customClaims.provider for which one (google, github…)',
        importance: "high",
      },
      {
        key: "externalIds",
        label: "externalIds",
        note: "Provider-specific user ID. Stable even if user changes email on the provider",
        importance: "high",
      },
    ],
    decisionMatrix: [
      {
        context: "Consumer app",
        score: "great",
        reason: "Fastest path to activation; users trust Google/GitHub",
      },
      {
        context: "Developer tool",
        score: "great",
        reason: "GitHub login = instant credibility + free org data",
      },
      {
        context: "Internal tool",
        score: "ok",
        reason: "Works if org uses Google Workspace, but SSO is more reliable",
      },
      {
        context: "Fintech / banking",
        score: "avoid",
        reason:
          "Regulatory requirements usually demand direct identity ownership",
      },
      {
        context: "B2B SaaS",
        score: "ok",
        reason: "Good for PLG / self-serve; enterprise deals will need SSO",
      },
      {
        context: "Mobile-first app",
        score: "great",
        reason: "Native OAuth flows are frictionless on mobile",
      },
    ],
    tradeoffs: [
      {
        pro: "Fastest signup. No form fields, pre-populated profile data",
        con: "Users may forget which provider they used, causing duplicate accounts",
      },
      {
        pro: "Identity is maintained by the provider. Less liability for you",
        con: "Provider outages affect your login page (Google going down = locked out users)",
      },
      {
        pro: "Access token lets you call provider APIs (read GitHub repos, Google Drive, etc.)",
        con: "Limited provider selection in some regions (China blocks Google/Meta)",
      },
    ],
    codeSnippet: `import { Descope } from '@descope/nextjs-sdk';

// Descope flows handle the OAuth redirect dance automatically
// Configure which providers to show in the Descope console
export default function LoginPage() {
  return (
    <Descope
      flowId="sign-up-or-in"
      onSuccess={(e) => {
        const user = e.detail.user;
        
        // Access the provider's OAuth token for API calls
        const providerToken = user.oauth?.google?.accessToken;
        
        // Stable provider ID — use for account linking
        const googleId = user.externalIds?.google;
      }}
    />
  );
}

// Read provider from the server-side session
import { session } from '@descope/nextjs-sdk/server';

export default async function ProtectedPage() {
  const { token } = await session();
  
  // Which OAuth provider did they use?
  const provider = token.customClaims?.provider; // 'google' | 'github' | ...
  
  // Use the provider token to call their API
  const githubToken = token.oauth?.github?.accessToken;
}`,
    failureScenarios: [
      {
        id: "provider-denied",
        label: "User denied permissions",
        description:
          "User clicked 'Cancel' or 'Deny' on the provider consent screen",
        descopeHandling:
          "Descope receives the OAuth error callback and surfaces it through onError",
        devAction:
          "Show a friendly message; offer alternative auth methods in the UI",
      },
      {
        id: "duplicate-account",
        label: "Email already exists with different provider",
        description:
          "User has a magic link account and tries to log in with Google (same email)",
        descopeHandling:
          "Descope can auto-link accounts by email if configured in project settings",
        devAction:
          'Enable "Link accounts by email" in Descope console; or handle the conflict error and prompt user to use original method',
      },
      {
        id: "provider-outage",
        label: "OAuth provider unavailable",
        description:
          "Google / GitHub is experiencing an outage during login attempt",
        descopeHandling: "OAuth exchange fails; Descope returns a network error",
        devAction:
          "Always provide at least one non-OAuth fallback (magic link or passkey) in your flow",
      },
    ],
    descope: {
      flow: "sign-up-or-in",
      component: "Descope",
    },
  },

  passkey: {
    id: "passkey",
    label: "Passkey",
    tagline: "Biometric. Phishing-proof. Future-ready.",
    accentVar: "--passkey",
    glowVar: "--passkey-glow",
    steps: [
      "User enters email (or is recognized from existing session)",
      "Browser prompts for biometric/device authentication",
      "Device signs a challenge with the private key (never leaves the device)",
      "Descope verifies the signature against the stored public key",
      "Session established. No secret was ever transmitted",
    ],
    sessionHighlights: [
      {
        key: "authenticationMethod",
        label: "authenticationMethod",
        note: 'Value: "webauthn" — the most secure single-factor you can offer',
        importance: "high",
      },
      {
        key: "amr",
        label: "amr (Authentication Methods References)",
        note: 'Contains "hwk" (hardware key) + "user" — useful for compliance reporting',
        importance: "high",
      },
      {
        key: "loginIds",
        label: "loginIds",
        note: "Email is still the primary ID, but the credential is device-bound",
        importance: "medium",
      },
      {
        key: "verifiedEmail",
        label: "verifiedEmail",
        note: "May be false if passkey was set up without email verification — check your flow",
        importance: "medium",
      },
      {
        key: "customClaims",
        label: "customClaims.passkeyId",
        note: "The WebAuthn credential ID. Useful for auditing which device was used",
        importance: "low",
      },
    ],
    decisionMatrix: [
      {
        context: "Consumer app",
        score: "great",
        reason: "Best UX when paired with passkey creation at signup",
      },
      {
        context: "Mobile-first app",
        score: "great",
        reason: "Face ID / fingerprint = native feel, zero friction",
      },
      {
        context: "Fintech / banking",
        score: "great",
        reason:
          "Phishing-proof + biometric satisfies strong auth requirements",
      },
      {
        context: "High-security system",
        score: "great",
        reason: "Hardware-bound keys are the gold standard for authentication",
      },
      {
        context: "Internal tool",
        score: "ok",
        reason: "Works, but SSO/SAML is usually expected in enterprise contexts",
      },
      {
        context: "B2B SaaS",
        score: "ok",
        reason:
          "Good for end-users, but admins/enterprise accounts still expect SSO",
      },
    ],
    tradeoffs: [
      {
        pro: "Phishing-proof by design. Private key never leaves the device",
        con: "Device-bound: user locked out if they lose their only enrolled device",
      },
      {
        pro: "No shared secret. Even a Descope breach can't leak user credentials",
        con: "Requires user education; 'passkey' is still unfamiliar to many users",
      },
      {
        pro: "Biometric auth feels native and fast on mobile",
        con: "Older browsers / devices may not support WebAuthn. Need a fallback",
      },
    ],
    codeSnippet: `import { Descope } from '@descope/nextjs-sdk';

// Passkeys are handled entirely within Descope flows
// The WebAuthn ceremony (challenge, sign, verify) is abstracted away
export default function LoginPage() {
  return (
    <Descope
      flowId="sign-up-or-in" // Configure passkey in your flow in Descope console
      onSuccess={(e) => {
        const user = e.detail.user;
        
        // authenticationMethod === 'webauthn' confirms passkey was used
        // amr contains 'hwk' (hardware key) for compliance
        console.log(user.authenticationMethod); // 'webauthn'
      }}
    />
  );
}

// Verify passkey auth server-side + enforce it for sensitive routes
import { session } from '@descope/nextjs-sdk/server';

export default async function HighSecurityPage() {
  const { token } = await session();
  
  // Require passkey specifically for sensitive operations
  if (token.authenticationMethod !== 'webauthn') {
    // Redirect to step-up auth
    redirect('/auth/step-up?method=passkey');
  }
}

// Enroll a new passkey for an existing user (post-login)
import { useDescope } from '@descope/nextjs-sdk/client';

function SecuritySettings() {
  const { sdk } = useDescope();
  
  const enrollPasskey = async () => {
    await sdk.passkeys.signUpOrIn(loginId);
  };
}`,
    failureScenarios: [
      {
        id: "no-passkey-enrolled",
        label: "No passkey on this device",
        description:
          "User tries to log in with passkey on a new device where they haven't enrolled one",
        descopeHandling:
          "WebAuthn returns a NotAllowedError; Descope surfaces this through onError",
        devAction:
          "Fall back to magic link or OTP for identity verification, then prompt to enroll a passkey on the new device",
      },
      {
        id: "biometric-failed",
        label: "Biometric check failed",
        description:
          "User fails Face ID / fingerprint check (wet fingers, new glasses, etc.)",
        descopeHandling:
          "Browser allows retry up to its limit, then returns NotAllowedError",
        devAction:
          "Offer a PIN/password fallback if device supports it; don't permanently block after failures",
      },
      {
        id: "browser-unsupported",
        label: "Browser doesn't support WebAuthn",
        description:
          "User on an older browser or OS that lacks WebAuthn support",
        descopeHandling:
          "Feature detection fails before Descope flow initiates",
        devAction:
          "Check navigator.credentials support before showing passkey option; hide it gracefully for unsupported browsers",
      },
    ],
    descope: {
      flow: "passkey-only",
      component: "Descope",
    },
  },
};

export const ALL_METHODS: AuthMethod[] = ["magic-link", "social", "passkey"];
