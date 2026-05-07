# Quran Academy — Project Roles & Rules

## Tech Stack Constraints
- **Backend**: Node.js + NestJS (TypeScript) — no Python, no Go
- **Frontend**: Next.js 15 (App Router) — no other frameworks
- **Database**: PostgreSQL only
- **Live Video**: Jitsi Meet (self-hosted) — no Twilio, no Zoom SDK
- **Payments**: Stripe only

## Architecture Rules
- **Multi-tenant**: Each Organization gets its own PostgreSQL schema
- **Auth**: JWT + magic link (no password login for users)
- **API Style**: RESTful with consistent naming (`/modules` not `/module`)
- **Timezone**: All datetimes stored as UTC, converted on display

## Code Conventions
- **Language**: English for all code, comments, variable names
- **UI Text**: Arabic translations supported, English as default
- **Formatting**: 2-space indentation, single quotes in JS/TS
- **No TODO comments** — use GitHub Issues instead
- **No console.log** — use structured logger (pino)

## Design Constraints
- **RTL Support**: Full right-to-left layout for Arabic UI
- **Fonts**: Amiri for Arabic headings, Inter for Latin text
- **Colors**: Emerald green (#059669) as primary, gold (#D97706) as accent

## Data Rules
- **Prices**: Always in SAR (Saudi Riyal)
- **Dates**: Islamic Hijri calendar option for UI, Gregorian as default
- **Content**: All Quran text and translations from open-source datasets only

## Security
- **No secrets in code** — use environment variables
- **HTTPS only** — no HTTP in production
- **Rate limiting** on all public endpoints

## Git Workflow
```
prod   ← humans only
  ▲
qa     ← humans only
  ▲
dev    ← all agent PRs merge here
  ▲
feature/issue-{n}-{desc}
```

## Branch Naming
- Feature: `feature/issue-{n}-{short-desc}`
- Bugfix: `bugfix/issue-{n}-{desc}`
- Branch from: `dev`
- PR target: `dev`

## Commit Format
`type(scope): description - closes #N`
Types: feat, fix, refactor, test, docs, chore