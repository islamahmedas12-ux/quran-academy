# Quran Academy — Deployment Guide

Comprehensive guide for deploying the Quran Academy platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Application Deployment](#application-deployment)
- [SSL Configuration](#ssl-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Troubleshooting](#troubleshooting)
- [Production Checklist](#production-checklist)

---

## Prerequisites

### Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Storage | 100 GB SSD | 500 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Domain Configuration

1. **A Record**: Point `quran-academy.com` to your server IP
2. **A Record**: Point `meet.quran-academy.com` to your server IP (for Jitsi)
3. **CNAME Record**: Point `www.quran-academy.com` to `quran-academy.com`

### Required Services

- Docker 24.x+
- Docker Compose 2.x+
- Git
- Certbot (for SSL)

---

## Server Setup

### 1. Initial Server Preparation

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Create deployment user
adduser deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

### 2. Security Hardening

```bash
# As root, run the security hardening script
chmod +x /opt/quran-academy/infra/scripts/security-hardening.sh
sudo /opt/quran-academy/infra/scripts/security-hardening.sh
```

This configures:
- UFW firewall (SSH, HTTP, HTTPS only)
- fail2ban (SSH, nginx protection)
- Docker daemon security
- Sysctl hardening
- Automatic security updates

### 3. SSH Key Setup

```bash
# On your local machine
ssh-keygen -t ed25519 -C 'quran-academy-vps'
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@your-vps-ip

# Test key-based login
ssh -i ~/.ssh/id_ed25519 deploy@your-vps-ip
```

### 4. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install docker-compose

# Add deploy user to docker group
usermod -aG docker deploy
```

---

## Application Deployment

### 1. Clone Repository

```bash
# As deploy user
ssh deploy@your-vps-ip
git clone https://github.com/your-org/quran-academy.git /opt/quran-academy
cd /opt/quran-academy
```

### 2. Environment Configuration

Create environment files:

```bash
# Backend environment
cat > apps/backend/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://quran_admin:${POSTGRES_PASSWORD}@postgres:5432/quran_academy
REDIS_URL=redis://redis:6379
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
MAGIC_LINK_SECRET=${MAGIC_LINK_SECRET}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=admin@quran-academy.com
AL_QURAN_API_KEY=${AL_QURAN_API_KEY}
EOF

# Frontend environment
cat > apps/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=https://quran-academy.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
NEXT_PUBLIC_MINIO_BUCKET_URL=https://quran-academy.com/minio
EOF
```

### 3. SSL Certificate Setup

```bash
# Run SSL setup script
sudo chmod +x /opt/quran-academy/infra/scripts/ssl-setup.sh
sudo /opt/quran-academy/infra/scripts/ssl-setup.sh quran-academy.com admin@quran-academy.com
```

### 4. Start Services

```bash
# Pull latest changes
git fetch origin dev
git checkout origin/dev

# Start Docker Compose
docker compose up -d

# Check service status
docker compose ps
docker compose logs -f
```

### 5. Initial Database Setup

```bash
# Run database migrations
docker compose exec backend npm run migration:run

# Seed initial data (if needed)
docker compose exec backend npm run seed
```

---

## Environment Variables Reference

### Backend (`apps/backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRES_IN` | Token expiration | Yes |
| `MAGIC_LINK_SECRET` | Magic link signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `MINIO_ENDPOINT` | MinIO server endpoint | Yes |
| `MINIO_ACCESS_KEY` | MinIO access key | Yes |
| `MINIO_SECRET_KEY` | MinIO secret key | Yes |
| `SENDGRID_API_KEY` | SendGrid API key | Yes |
| `SENDGRID_FROM_EMAIL` | Sender email address | Yes |
| `AL_QURAN_API_KEY` | Al-Quran.cloud API key | Yes |

### Frontend (`apps/frontend/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `NEXT_PUBLIC_MINIO_BUCKET_URL` | MinIO bucket URL | Yes |

### Secrets Generation

```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For MAGIC_LINK_SECRET
```

---

## SSL Configuration

### Automatic Renewal

The SSL setup script automatically configures certbot auto-renewal via cron:

```bash
# Verify auto-renewal is configured
sudo certbot certificates
sudo certbot renew --dry-run
```

### Manual Certificate Generation

```bash
# Generate certificate for main domain
sudo certbot certonly --webroot -w /var/www/certbot \
  -d quran-academy.com -d www.quran-academy.com

# Generate certificate for Jitsi subdomain
sudo certbot certonly --webroot -w /var/www/certbot \
  -d meet.quran-academy.com
```

---

## Monitoring Setup

### Prometheus

1. Copy Prometheus configuration:
```bash
sudo cp /opt/quran-academy/infra/monitoring/prometheus.yml /etc/prometheus/prometheus.yml
```

2. Install exporters:
```bash
# Node Exporter
docker run -d \
  --name node-exporter \
  --restart unless-stopped \
  -p 9100:9100 \
  prom/node-exporter

# PostgreSQL Exporter
docker run -d \
  --name postgres-exporter \
  --restart unless-stopped \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://quran_admin:${POSTGRES_PASSWORD}@postgres:5432/quran_academy?sslmode=disable" \
  prometheuscommunity/postgres-exporter

# Redis Exporter
docker run -d \
  --name redis-exporter \
  --restart unless-stopped \
  -p 9121:9121 \
  oliver006/redis_exporter
```

### Grafana

1. Access Grafana at `https://quran-academy.com/grafana`
2. Default credentials: `admin` / `admin`
3. Import dashboard from `/opt/quran-academy/infra/monitoring/grafana-dashboard.json`

### Uptime Kuma

Access at `https://quran-academy.com/uptime`

---

## Backup Configuration

### Automated Backups

```bash
# Setup cron job for daily backups at 2 AM
sudo crontab -e
# Add: 0 2 * * * root /opt/quran-academy/infra/scripts/backup.sh >> /var/log/cron-backup.log 2>&1
```

### Manual Backup

```bash
# Run backup manually
sudo /opt/quran-academy/infra/scripts/backup.sh
```

### Restore from Backup

```bash
# Restore PostgreSQL
sudo /opt/quran-academy/infra/scripts/restore.sh postgres /backups/postgres_latest.sql.gz

# Restore MinIO
sudo /opt/quran-academy/infra/scripts/restore.sh minio /backups/minio_latest.tar.gz

# Restore both
sudo /opt/quran-academy/infra/scripts/restore.sh all
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check Docker logs
docker compose logs -f

# Check specific service
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker compose exec postgres pg_isready

# Test connection
docker compose exec postgres psql -U quran_admin -d quran_academy
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Reload nginx
sudo systemctl reload nginx
```

### High Memory Usage

```bash
# Check Docker stats
docker stats

# Check memory by container
docker stats --no-stream
```

---

## Production Checklist

### Pre-Deployment

- [ ] Server meets minimum requirements
- [ ] Domain DNS configured correctly
- [ ] All environment variables set
- [ ] SSL certificates generated
- [ ] Security hardening applied
- [ ] Backup schedule configured

### Post-Deployment

- [ ] All services running (`docker compose ps`)
- [ ] Health check passing (`curl https://quran-academy.com/health`)
- [ ] SSL certificate valid (no browser warnings)
- [ ] Monitoring dashboards accessible
- [ ] Backup verified (test restore)
- [ ] Uptime Kuma monitoring configured
- [ ] Alert notifications working

### Security Checklist

- [ ] SSH key-only login enabled
- [ ] fail2ban active and configured
- [ ] UFW firewall enabled
- [ ] Docker socket permissions set
- [ ] No default passwords changed
- [ ] Secrets stored securely (not in git)

---

## Support

For issues, please open a GitHub Issue with:
- Server logs (`docker compose logs`)
- Steps to reproduce
- Expected vs actual behavior
