# Quran Academy Platform

> Enterprise-grade platform for teaching Quran and Islamic Studies to non-Arabic speakers through live 1-on-1 classes, interactive Quran reading, and structured courses.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)

## 🌟 Features

### Live 1-on-1 Classes
- Real-time video sessions via **Jitsi Meet** (self-hosted)
- Teacher availability calendar with timezone support
- Class booking, scheduling, and reminders
- Post-class notes, homework, and feedback
- Class recording and playback
- iCal calendar integration

### Interactive Quran Reading
- Full Quran text with **Uthmani script**
- Word-by-word **transliteration** (Arabic → Roman)
- Multi-language translations (English, Urdu, Bahasa, French, Spanish, German)
- **Audio recitation** by renowned reciters (Alafasy, AbdulBaset, etc.)
- Verse-by-verse playback with highlighting
- Reading progress tracking

### Recorded Courses
- Course catalog with categories (Quran, Arabic, Fiqh, Seerah, etc.)
- Video lessons with progress tracking
- Enrollment management
- Completion certificates (PDF)
- Multi-language support

### Subscription & Payments
- **Stripe** integration for subscriptions
- Four tiers: Free, Basic, Premium, Institution
- Feature-gated access (PlanGuard)
- Teacher payout tracking
- SAR (Saudi Riyal) pricing

### Enterprise Ready
- **Multi-tenant** architecture (schema-per-organization)
- Role-based access control (6 roles)
- Family accounts (parent-student linking)
- Comprehensive analytics dashboard
- RTL support for Arabic interface

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Nginx (SSL)                         │
│              Reverse Proxy + Rate Limiting            │
└──────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌────────────┐    ┌─────────────┐   ┌────────────┐
  │  Next.js   │    │   NestJS    │   │   Jitsi    │
  │  Frontend  │    │   Backend   │   │    Meet    │
  │   (PWA)    │    │    API      │   │  (Video)   │
  └────────────┘    └─────────────┘   └────────────┘
                        │
               ┌────────┴────────┐
               ▼                 ▼
        ┌────────────┐    ┌─────────────┐
        │ PostgreSQL │    │    Redis    │
        │ (per-tenant│    │ (cache,     │
        │  schemas)  │    │  sessions)  │
        └────────────┘    └─────────────┘
               │
        ┌────────────┐
        │   MinIO    │
        │ (S3-style  │
        │  storage)  │
        └────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| **Backend** | NestJS (TypeScript), TypeORM |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Storage** | MinIO (S3-compatible) |
| **Video** | Jitsi Meet (self-hosted) |
| **Auth** | JWT + Magic Link |
| **Payments** | Stripe |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions |
| **Hosting** | Hostinger VPS (Ubuntu 22.04) |

## 📁 Project Structure

```
quran-academy/
├── apps/
│   ├── backend/          # NestJS API
│   │   └── src/
│   │       ├── modules/   # Auth, Users, Courses, Classes, Quran, Payments
│   │       ├── shared/    # Guards, Decorators, Services
│   │       └── tenant/    # Multi-tenant middleware
│   │
│   └── frontend/          # Next.js PWA
│       └── app/
│           ├── (auth)/    # Login, Verify, Magic Link
│           ├── (student)/ # Dashboard, Quran, Courses
│           ├── (teacher)/ # Schedule, Availability, Earnings
│           └── (admin)/   # Users, Courses, Analytics
│
├── docker/                # Docker Compose services
│   ├── docker-compose.yml
│   └── setup.sh
│
├── infra/
│   ├── nginx/             # Reverse proxy config
│   ├── scripts/           # Backup, Security, SSL
│   └── monitoring/        # Prometheus, Grafana
│
├── docs/
│   ├── deployment.md      # VPS deployment guide
│   └── quran-research.md   # Quran API research
│
└── .github/workflows/     # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/islamahmedas12-ux/quran-academy.git
cd quran-academy

# 2. Install dependencies
cd apps/backend && npm install
cd apps/frontend && npm install

# 3. Start infrastructure (PostgreSQL, Redis, MinIO)
cd docker && docker compose up -d

# 4. Setup environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 5. Run migrations
cd apps/backend && npm run migration:run

# 6. Start development servers
cd apps/backend && npm run start:dev
cd apps/frontend && npm run dev
```

### Production Setup

```bash
# See docs/deployment.md for full production guide

# 1. Copy and configure environment
cp docker/.env.example docker/.env
# Edit docker/.env with your values

# 2. Setup SSL
chmod +x infra/scripts/ssl-setup.sh
./infra/scripts/ssl-setup.sh your-domain.com

# 3. Start all services
cd docker && docker compose up -d

# 4. Run security hardening
chmod +x infra/scripts/security-hardening.sh
./infra/scripts/security-hardening.sh
```

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quran_academy

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Magic Link
MAGIC_LINK_SECRET=your-magic-link-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ENDPOINT=localhost:9000

# Jitsi
JITSI_PUBLIC_URL=https://meet.your-domain.com
JITSI_JVB_AUTH_PASSWORD=your-jvb-password

# App
APP_URL=https://your-domain.com
APP_PORT=3000
```

### Frontend (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_JITSI_URL=https://meet.your-domain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 API Documentation

### Core Endpoints

| Module | Endpoints |
|---|---|
| **Auth** | `POST /auth/magic-link`, `GET /auth/verify`, `POST /auth/refresh` |
| **Users** | `GET /users/me`, `PATCH /users/me`, `GET /users` |
| **Organizations** | `POST /organizations`, `GET /organizations/:id` |
| **Teachers** | `GET /teachers`, `GET /teachers/:id/availability`, `PATCH /teachers/:id/availability` |
| **Classes** | `POST /classes/book`, `GET /classes/upcoming`, `POST /classes/:id/join` |
| **Courses** | `GET /courses`, `POST /courses`, `GET /courses/:id/lessons` |
| **Enrollments** | `POST /enrollments`, `GET /enrollments/my` |
| **Quran** | `GET /quran/surahs`, `GET /quran/verse/:surah/:ayah`, `GET /quran/surah/:surah` |
| **Payments** | `POST /payments/create-checkout`, `POST /webhooks/stripe` |

Full API documentation coming soon (Swagger/OpenAPI).

## 🧪 Testing

```bash
# Backend unit tests
cd apps/backend && npm test

# Backend e2e tests
cd apps/backend && npm run test:e2e

# Frontend E2E (Playwright)
cd apps/frontend && npx playwright test

# Load testing (k6)
cd infra/load-tests && k6 run class-booking.js
```

## 🔒 Security

- OWASP Top 10 protection
- JWT with refresh tokens
- RBAC (Role-Based Access Control)
- Rate limiting (nginx)
- SSL/TLS encryption
- fail2ban for SSH protection
- UFW firewall

See `docs/security-checklist.md` for full security audit checklist.

## 📊 Monitoring

- **Uptime Kuma**: Service uptime monitoring (port 3001)
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards (latency, errors, DB connections)

Access Uptime Kuma at `http://your-domain.com:3001`

## 🌐 Quran Data Sources

- **Text**: Al-Quran.cloud API + Tanzil dataset
- **Transliteration**: arabic-respell package
- **Audio**: EveryAyah.com CDN (Mishary Alafasy, Abdul Rahman Al-Sudais)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Create a feature branch (`feature/issue-{number}-{description}`)
2. Commit your changes (`git commit -m 'feat(scope): description'`)
3. Push to the branch (`git push origin feature/...`)
4. Open a Pull Request to `dev` branch

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the Ummah**