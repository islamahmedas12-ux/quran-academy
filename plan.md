# Enterprise Quran Academy Platform — Plan

## Tech Stack

| Layer | Choice |
|---|---|
| **Backend** | Node.js + NestJS (TypeScript) |
| **Frontend** | Next.js 15 (React, App Router) |
| **Live Video** | Jitsi Meet (self-hosted Docker) |
| **Database** | PostgreSQL |
| **Cache/Sessions** | Redis |
| **File Storage** | MinIO (S3-compatible, self-hosted) |
| **Auth** | JWT + Magic Link |
| **Payments** | Stripe |
| **Hosting** | Hostinger VPS (Ubuntu) |
| **Multi-tenancy** | Schema-per-tenant (Organization-scoped) |

---

## Architecture

```
                    Nginx (SSL)
              Reverse Proxy + Load Balancer
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   ┌──────────┐    ┌────────────┐   ┌──────────┐
   │ Next.js  │    │  NestJS    │   │  Jitsi   │
   │  Frontend│    │  Backend  │   │  Meet    │
   └──────────┘    └────────────┘   └──────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
       ┌──────────┐     ┌───────────┐
       │PostgreSQL │     │   Redis   │
       └──────────┘     └───────────┘
              │
       ┌──────────┐
       │  MinIO   │
       └──────────┘
```

---

## Phases & Tasks

### Phase 1 — Foundation (Weeks 1–6)

#### DevOps Tasks (1.1–1.8)
1. **VPS Setup** — Ubuntu 22.04, Docker, Docker Compose, fail2ban, UFW firewall
2. **Domain & DNS** — Configure domain, A/CNAME records, Let's Encrypt SSL (auto-renewal)
3. **PostgreSQL Setup** — Docker container, per-tenant schema automation, backup strategy
4. **Redis Setup** — Docker container, session store, cache layer
5. **MinIO Setup** — Docker container, S3-compatible bucket (courses, audio, recordings)
6. **Jitsi Meet** — Self-hosted Docker (JVB,Prosody,Jicofo) for live classes
7. **CI/CD Pipeline** — GitHub Actions → Docker Compose auto-deploy on VPS
8. **Monitoring** — Uptime Kuma (uptime), Grafana (metrics), logs

#### Backend Tasks (1.9–1.13)
9. **NestJS Project Init** — Monorepo structure, TypeScript strict, folder structure (modules)
10. **Multi-tenant Architecture** — Organization model, tenant resolution middleware, schema isolation
11. **Auth Module** — JWT + magic link (nodemailer/SendGrid), refresh tokens, RBAC (6 roles)
12. **User Module** — Registration, profiles, parent-child linking (family accounts)
13. **Organization Module** — Org creation, subscription plan, settings

### Phase 2 — Live 1-on-1 Classes (Weeks 7–11)
14. **Jitsi Integration** — Backend API to generate JITSI meeting rooms + tokens
15. **Teacher Availability** — Calendar slots (day/time), timezone handling (UTC storage, display in local)
16. **Class Booking Flow** — Student selects teacher → picks slot → creates class session
17. **Class Session Model** — ScheduledClass entity (teacher_id, student_id, start_time, end_time, status, jitsi_room)
18. **Class Dashboard UI** — Student: upcoming/past classes; Teacher: schedule + availability
19. **Embedded Jitsi** — iframe in Next.js, pre-join lobby, screen share, whiteboard
20. **Post-Class Flow** — Session notes (teacher writes), homework (attach PDF/link), feedback rating
21. **Class Recording** — Optional recording toggle, stored in MinIO, playback in dashboard

### Phase 3 — Interactive Quran Reading (Weeks 12–15)
22. **Quran Text Data** — Uthmani script dataset (open source), verse mapping by Juz/Amran
23. **Transliteration Engine** — Arabic-to-Roman script transliteration, word-level mapping
24. **Translation Layer** — Multi-language translations (English, Urdu, Bahasa, French, Spanish...)
25. **Audio Recitation** — Integrate reciters (Mishary Alafasy, Abdul Rahman Al-Sudais) from open Quran audio datasets
26. **Verse-by-verse Player** — Click verse → plays audio, highlighting current verse
27. **Reading Practice Mode** — Student follows along, teacher can highlight mistakes in live class

### Phase 4 — Recorded Courses (Weeks 16–19)
28. **Course Model** — Entity: Course, Lesson, Enrollment, LessonProgress
29. **Course Builder (Admin)** — CRUD courses, reorder lessons, set prerequisites, difficulty level
30. **Video Upload** — Upload to MinIO, transcode (FFmpeg), generate thumbnail
31. **Course Catalog UI** — Browse, filter (category, language, level), search, enrollment
32. **Lesson Player** — Video player (embedded), text summary, attachments download
33. **Progress Tracking** — Mark lesson complete, course %, continue watching
34. **Certificate Generation** — PDF certificate (student name, course, date, org seal)

### Phase 5 — Payments & Subscriptions (Weeks 20–23)
35. **Subscription Plans** — Free, Basic, Premium, Institution — feature-gated
36. **Stripe Integration** — Checkout session, webhooks (checkout.session.completed, subscription updates)
37. **Billing Portal** — Stripe customer portal for invoices, update payment method, cancel
38. **Teacher Payout Tracking** — Per-class rate, monthly earnings, payout record (v1: manual)
39. **Family/Institution Plans** — Bulk seat pricing, admin manages student seats

### Phase 6 — Frontend Polish & Mobile (Weeks 16–23, parallel)
40. **Student Portal** — Dashboard, live class access, Quran reader, my courses
41. **Teacher Portal** — Availability editor, class schedule, post-class notes, earnings
42. **Admin Portal** — Org-wide: users, courses, analytics, billing
43. **Responsive Design** — Mobile-first, all screens responsive
44. **PWA Features** — Offline Quran reading, push notifications for class reminders

### Phase 7 — QA, Security & Launch (Weeks 24–26)
45. **Security Audit** — OWASP top 10, SQL injection, XSS, CSRF, rate limiting
46. **Load Testing** — k6 or Locust — simulate concurrent live classes
47. **E2E Tests** — Playwright — full booking + class flow
48. **VPS Hardening** — Backups (daily), fail2ban, SSH keys only, firewall
49. **Beta Launch** — 50–100 beta users (existing Islamic schools)
50. **Feedback Loop** — Collect bug reports, prioritize fixes
51. **Public Launch** — Full marketing, onboarding for new orgs

---

## Key APIs

| Module | Key Endpoints |
|---|---|
| **Auth** | `POST /auth/magic-link`, `POST /auth/refresh`, `POST /auth/logout` |
| **Users** | `GET/PATCH /users/me`, `POST /users/invite` |
| **Organizations** | `POST /organizations`, `GET /organizations/:id`, `PATCH /organizations/:id/subscription` |
| **Teachers** | `GET /teachers`, `PATCH /teachers/availability` |
| **Classes** | `POST /classes/book`, `GET /classes/upcoming`, `POST /classes/:id/notes` |
| **Courses** | `GET/POST /courses`, `GET /courses/:id/lessons`, `POST /enrollments` |
| **Quran** | `GET /quran/surah/:num`, `GET /quran/verse/:surah/:num`, audio stream |
| **Payments** | `POST /payments/create-checkout`, `POST /webhooks/stripe` |

---

## File Structure

```
quran-academy/
├── docker/
│   ├── docker-compose.yml
│   ├── postgres/
│   ├── redis/
│   ├── minio/
│   └── jitsi/
├── apps/
│   ├── backend/          # NestJS
│   └── frontend/         # Next.js
├── packages/
│   └── shared/           # Shared types, constants
├── infra/
│   ├── nginx/
│   └── monitoring/
└── docs/
```

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|---|---|---|
| Phase 1 — Foundation | 6 weeks | Week 1–6 |
| Phase 2 — Live Classes | 5 weeks | Week 7–11 |
| Phase 3 — Quran Reading | 4 weeks | Week 12–15 |
| Phase 4 — Recorded Courses | 4 weeks | Week 16–19 |
| Phase 5 — Payments | 4 weeks | Week 20–23 |
| Phase 6 — Frontend Polish | parallel | — |
| Phase 7 — QA & Launch | 3 weeks | Week 24–26 |

**Total: ~26 weeks (~6 months)**