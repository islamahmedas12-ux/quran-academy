#!/bin/bash
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${EMAIL:-admin@quran-academy.com}"
LOG_FILE="/var/log/quran-academy/ssl-setup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
    exit 1
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root"
    fi
}

install_certbot() {
    log "Installing Certbot..."

    if command -v certbot &> /dev/null; then
        log "Certbot already installed: $(certbot --version)"
        return
    fi

    apt update

    if command -v apt-get &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
    else
        error "apt-get not found. This script requires Debian/Ubuntu."
    fi

    log "Certbot installed: $(certbot --version)"
}

setup_ssl_certificate() {
    local domain="$1"

    log "Setting up SSL certificate for: $domain"

    local cert_path="/etc/letsencrypt/live/${domain}"
    if [ -d "$cert_path" ]; then
        log "Certificate already exists for $domain"
        log "Path: $cert_path"
        return
    fi

    log "Requesting certificate from Let's Encrypt..."

    certbot certonly \
        --nginx \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domains "$domain" \
        --expand \
        2>> "$LOG_FILE" || error "Failed to obtain SSL certificate"

    log "SSL certificate obtained successfully"
    log "Certificate path: $cert_path"
}

setup_wildcard_certificate() {
    local domain="$1"

    log "Setting up wildcard certificate for: *.$domain"

    certbot certonly \
        --manual \
        --preferred-challenges=dns \
        --dns-cloudflare \
        --dns-cloudflare-credentials /root/.cloudflare/credentials \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domains "*.$domain" \
        --domains "$domain" \
        2>> "$LOG_FILE" || error "Failed to obtain wildcard SSL certificate"

    log "Wildcard SSL certificate obtained"
}

setup_auto_renewal() {
    log "Setting up automatic certificate renewal..."

    if command -v certbot &> /dev/null; then
        cat > /etc/cron.d/certbot-renew << 'EOF'
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

0 0,12 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx"
EOF

        chmod 644 /etc/cron.d/certbot-renew
        log "Auto-renewal cron job created"
    else
        log "Warning: Certbot not found, skipping auto-renewal setup"
    fi
}

verify_certificate() {
    local domain="$1"
    local cert_path="/etc/letsencrypt/live/${domain}"

    if [ ! -d "$cert_path" ]; then
        error "Certificate not found at $cert_path"
    fi

    log "Certificate details for $domain:"
    openssl x509 -in "${cert_path}/fullchain.pem" -noout \
        -subject -issuer -dates 2>/dev/null || true

    log "Certificate will expire:"
    certbot certificates --domain "$domain" 2>/dev/null || true
}

setup_http_redirect() {
    log "Configuring HTTP to HTTPS redirect..."

    if [ -f "/etc/nginx/sites-available/default" ]; then
        cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$host$request_uri;
}
EOF
        systemctl reload nginx
        log "HTTP to HTTPS redirect configured"
    fi
}

main() {
    if [ -z "$DOMAIN" ]; then
        echo "Usage: $0 <domain> [email]"
        echo ""
        echo "Examples:"
        echo "  $0 quran-academy.com admin@quran-academy.com"
        echo "  $0 meet.quran-academy.com"
        echo "  $0 api.quran-academy.com"
        echo ""
        echo "Environment variables:"
        echo "  EMAIL - Email for Let's Encrypt notifications (default: admin@quran-academy.com)"
        exit 1
    fi

    if [ -n "${2:-}" ]; then
        EMAIL="$2"
    fi

    log "========================================="
    log "SSL Setup Script"
    log "Domain: $DOMAIN"
    log "Email: $EMAIL"
    log "========================================="

    check_root
    install_certbot
    setup_ssl_certificate "$DOMAIN"
    setup_auto_renewal
    verify_certificate "$DOMAIN"

    log "========================================="
    log "SSL setup completed successfully!"
    log "========================================="
    log "Next steps:"
    log "1. Update nginx config with SSL certificate paths"
    log "2. Use infra/nginx/ssl.conf.template as reference"
    log "3. Test SSL: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
}

main "$@"
