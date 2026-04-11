# Auth Decision Kit

There are plenty of great auth content that show how things work. This interactive demo focuses on how to choose between them so you choose the best ones for your product context.

**→ [Live demo](https://auth-decision-kit.vercel.app/)**

---

## What it does

The Auth Decision Kit lets you experience three auth flows side-by-side:

| Method | Best for |
| --- | --- |
| **Magic Link** | Consumer apps, low-friction signups |
| **Social Login** | Developer tools, PLG products |
| **Passkey** | Mobile-first apps, high-security contexts |

For each method, you get:

1. **Live auth flow** — experience the full authentication flow in practice
2. **Session inspector** — understand every JWT claim with clear annotations
3. **Decision matrix** — see how each method performs across real product contexts (consumer, B2B SaaS, fintech, mobile, internal tools, high-security)
4. **Failure simulator** — trigger each failure mode and see how to handle them correctly
5. **Annotated code** — copy-ready implementation snippets that highlight the decisions behind the implementation

---

## Why I built this

Most auth content shows how to implement. But the harder question is deciding which method fits your product.

I wanted a decision framework developers could actually use that allowed them to compare methods side by side, show what lands in the session after each flow, and surfaces what breaks and how to handle it. 

---

## Stack

- **Next.js 15** (App Router)
- **Descope** — auth flows, session management, JWT
- **Framer Motion** — transitions between tabs and states
- **Tailwind CSS** — layout and spacing
- **TypeScript** throughout

---

## Getting started

You need **Node.js 18.18+** (20+ recommended for local dev).

### 1. Clone the repo

```bash
git clone https://github.com/carasjung/auth-decision-kit.git
cd auth-decision-kit
npm install
```

### 2. Set up Descope

If you haven't already, create a free account at [descope.com](https://descope.com) and copy your **Project ID** from [app.descope.com/settings/project](https://app.descope.com/settings/project).

### 3. Configure environment variables

In the project root, create `.env.local` with:

```env
NEXT_PUBLIC_DESCOPE_PROJECT_ID=your_project_id_here
```

### 4. Configure your Descope flows

In the [Descope Console](https://app.descope.com):

1. Go to **Flows → sign-up-or-in**
2. Add the auth methods you want to test:
   - **Magic Link** — add a Magic Link step
   - **Social Login** — add OAuth (Google, GitHub, etc.) and connect your OAuth apps
   - **Passkey** — add a WebAuthn step
3. Save and publish the flow

> All three methods can live in the same `sign-up-or-in` flow — Descope lets you add multiple auth options to one flow.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
auth-decision-kit/
├── app/
│   ├── page.tsx                    # Home — method selector
│   ├── layout.tsx                  # Root layout with AuthProvider + fonts
│   ├── globals.css                 # Design tokens, typography
│   ├── flow/
│   │   └── [method]/page.tsx       # Core experience — tabs for each method
│   └── components/
│       ├── SessionInspector.tsx    # JWT payload viewer + claim annotations
│       ├── FailureSimulator.tsx    # Trigger failure modes, inspect error output
│       ├── DecisionMatrix.tsx      # Product context ratings (green/yellow/red)
│       └── CodeSnippet.tsx         # Annotated implementation code
├── lib/
│   └── auth.ts                     # All method configs — steps, claims, matrix, snippets
├── tailwind.config.ts
└── README.md
```

The heart of the project is `lib/auth.ts`. It contains the full configuration for each auth method: the steps, session highlights, decision matrix scores, failure scenarios, and code snippets. Adding a new method or updating a score is a single-file change.

---

## Deploying to Vercel

From the repo root (no global CLI required):

```bash
npx vercel
```

Add `NEXT_PUBLIC_DESCOPE_PROJECT_ID` in your Vercel project **Settings → Environment Variables**.

---

## Extending this

A few directions if you want to take this further:

- **Add more auth methods** — Descope supports OTP, SSO/SAML, LDAP. Add a new entry to `METHOD_CONFIGS` in `lib/auth.ts` and a new flow in your Descope project.
- **Add step-up auth** — show how to require a higher-assurance method before a sensitive action
- **Add a real backend** — use `@descope/nextjs-sdk/server` to validate sessions server-side and show the difference between client and server session access
- **Add MFA flows** — configure risk-based MFA in Descope and show how `amr` changes in the session inspector

---

## Related reading

- [Different Authentication Methods & Choosing the Right One](https://www.descope.com/learn/post/authentication-types)
- [OAuth 2.0 and OpenID Connect: The evolution from authorization to identity](https://workos.com/blog/oauth-2-0-and-openid-connect-the-evolution-from-authorization-to-identity) 
- [Introduction to server-side passkey implementation](https://developers.google.com/identity/passkeys/developer-guides/server-introduction) 

---

## License

MIT
