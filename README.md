# Auth Decision Kit

An interactive playground for understanding which Descope auth method fits your product context.

Most auth sample apps answer: *"Does auth work?"* This one answers: *"Which auth should I use, and why?"*

**→ [Live demo](https://your-demo-url.vercel.app)**

---

## What it does

The Auth Decision Kit lets you experience three Descope auth flows side-by-side:

| Method | Best for |
|---|---|
| **Magic Link** | Consumer apps, low-friction signups |
| **Social Login** | Developer tools, PLG products |
| **Passkey** | Mobile-first apps, high-security contexts |

For each method, you get:

1. **Live auth flow** — authenticate for real using Descope
2. **Session inspector** — every JWT claim annotated so you know what it means
3. **Decision matrix** — green/yellow/red ratings across 6 product contexts (consumer, B2B SaaS, fintech, mobile, internal tools, high-security)
4. **Failure simulator** — trigger each failure mode intentionally and see exactly what Descope returns + what your code should do
5. **Annotated code** — copy-ready implementation snippets with comments that explain what actually matters

---

## Why I built this

I was looking at Descope's sample apps and noticed they all answer the same question: *"Here's how to add auth to your app."*

What's missing is the meta-question developers actually wrestle with: *"Should I use magic links or passkeys for my product? What does the session object look like after each one? What happens when things break?"*

This project is my attempt to answer that. It's an educational artifact as much as a sample app.

---

## Stack

- **Next.js 14** (App Router)
- **Descope** — auth flows, session management, JWT
- **Framer Motion** — transitions between tabs and states
- **Tailwind CSS** — layout and spacing
- **TypeScript** throughout

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/auth-decision-kit.git
cd auth-decision-kit
npm install
```

### 2. Set up Descope

Create a free account at [descope.com](https://descope.com) and grab your Project ID from [app.descope.com/settings/project](https://app.descope.com/settings/project).

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

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
├── .env.local.example
└── README.md
```

The heart of the project is `lib/auth.ts`. It contains the full configuration for each auth method: the steps, session highlights, decision matrix scores, failure scenarios, and code snippets. Adding a new method or updating a score is a single-file change.

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Add `NEXT_PUBLIC_DESCOPE_PROJECT_ID` as an environment variable in your Vercel project settings.

---

## Extending this

A few directions if you want to take this further:

- **Add more auth methods** — Descope supports OTP, SSO/SAML, LDAP. Add a new entry to `METHOD_CONFIGS` in `lib/auth.ts` and a new flow in your Descope project.
- **Add step-up auth** — show how to require a higher-assurance method before a sensitive action
- **Add a real backend** — use `@descope/nextjs-sdk/server` to validate sessions server-side and show the difference between client and server session access
- **Add MFA flows** — configure risk-based MFA in Descope and show how `amr` changes in the session inspector

---

## Related reading

- [Descope Docs](https://docs.descope.com) — full SDK reference
- [MCP Auth SDKs & APIs](https://www.descope.com/blog/post/mcp-auth-sdk) — Descope's approach to securing MCP servers
- [The Developer's Guide to MCP Gateways](https://www.descope.com/blog/post/developer-guide-mcp-gateways) — multi-tenant MCP auth patterns
- [Descope Python MCP SDK](https://www.descope.com/blog/post/python-mcp-sdk) — for Python-based MCP servers

---

## License

MIT
