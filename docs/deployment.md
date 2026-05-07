# Quran Academy — Deployment Guide

## Prerequisites

- Hostinger VPS (Ubuntu 22.04, minimum 4GB RAM, 2 vCPUs)
- Domain name pointed to VPS IP
- Docker + Docker Compose installed
- SSH key access to VPS

## Architecture Overview

```
                    Nginx (SSL)
              Reverse Proxy + Load Balancer
                          |
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

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/quran-academy.git
cd quran-academy
```

### 2. Configure Environment Variables

```bash
cd docker
cp .env.example .env
nano .env
```

Required environment variables:

```bash
# PostgreSQL
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=quran_academy
POSTGRES_USER=quran_admin

# Redis
REDIS_PASSWORD=your-secure-password

# MinIO
MINIO_ROOT_USER=minio_admin
MINIO_ROOT_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Magic Link (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAGIC_LINK_FROM=noreply@quran-academy.com

# Jitsi
JITSI_PUBLIC_URL=https://meet.quran-academy.com
JITSI_JVB_AUTH_PASSWORD=your-jvb-password
```

### 3. Start Services

```bash
cd docker
chmod +x setup.sh
./setup.sh
docker compose up -d
```

### 4. Configure SSL

```bash
# Main domain
sudo ./infra/scripts/ssl-setup.sh quran-academy.com admin@quran-academy.com

# Jitsi subdomain
sudo ./infra/scripts/ssl-setup.sh meet.quran-academy.com admin@quran-academy.com
```

### 5. Verify Deployment

- Frontend: https://quran-academy.com
- Backend API: https://quran-academy.com/api/health
- Jitsi Meet: https://meet.quran-academy.com
- Uptime Kuma: https://quran-academy.com:3001

## Security Setup

### 1. Run Security Hardening

```bash
sudo ./infra/scripts/security-hardening.sh
sudo ./infra/scripts/security.sh
```

### 2. Configure SSH Key-Only Access

```bash
# On your local machine
ssh-keygen -t ed25519 -C 'quran-academy-vps'
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-vps-ip

# On VPS, disable password auth after verifying key login works
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 3. Enable UFW Firewall

```bash
sudo ufw status
sudo ufw enable
```

## Backup Configuration

### 1. Configure Backup Cron Jobs

```bash
# Daily PostgreSQL + MinIO backup at 2 AM
0 2 * * * /opt/quran-academy/infra/scripts/backup.sh >> /var/log/quran-academy/backup.log 2>&1

# Weekly verification on Sundays
0 3 * * 0 /opt/quran-academy/infra/scripts/backup.sh --verify >> /var/log/quran-academy/backup-verify.log 2>&1
```

### 2. Test Backup Restore

```bash
# List available backups
sudo ./infra/scripts/restore.sh list

# Restore PostgreSQL
sudo ./infra/scripts/restore.sh postgres

# Restore MinIO
sudo ./infra/scripts/restore.sh minio

# Restore both
sudo ./infra/scripts/restore.sh all
```

## Monitoring Setup

### 1. Access Grafana

- URL: https://quran-academy.com:3000 (if Grafana is deployed)
- Default credentials: admin / admin

### 2. Import Dashboard

Import `infra/monitoring/grafana-dashboard.json` for pre-built metrics.

### 3. Configure Alerts

Set up alerts in Alertmanager for:
- High CPU/memory usage (>80%)
- Disk space low (<10%)
- Service down
- High error rate (>5%)

## CI/CD Pipeline

The project uses GitHub Actions for continuous deployment:

1. Push to `dev` branch triggers deployment to VPS
2. Tests run automatically
3. E2E tests with Playwright
4. Security scans with npm audit and Trivy
5. Docker images built and pushed to GHCR

### Manual Deployment

```bash
# SSH to VPS
ssh user@your-vps-ip

# Pull latest changes
cd /opt/quran-academy
git pull origin dev

# Run deployment
docker compose pull
docker compose up -d

# Check logs
docker compose logs -f
```

## Production Checklist

- [ ] Change all secrets in docker/.env
- [ ] Enable automatic backups (crontab)
- [ ] Verify SSL auto-renewal (`crontab -l | grep certbot`)
- [ ] Configure monitoring alerts
- [ ] Test restore procedure
- [ ] Enable UFW firewall (`ufw enable`)
- [ ] Disable SSH password auth
- [ ] Set up Cloudflare/DNS protection
- [ ] Configure log aggregation
- [ ] Set up error tracking (Sentry)
- [ ] Enable DDoS protection (Cloudflare)

## Troubleshooting

### Check Service Status

```bash
docker compose ps
docker compose logs -f [service-name]
```

### Restart Services

```bash
docker compose restart [service-name]
```

### View Resource Usage

```bash
docker stats
```

### Access Container Shell

```bash
docker exec -it quran_academy_backend_1 /bin/sh
```

## Support

For issues, contact: admin@quran-academy.com
