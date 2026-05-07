#!/bin/bash
#===============================================================================
# Quran Academy — SSL Setup Script
#===============================================================================
# This script sets up Let's Encrypt SSL certificates with auto-renewal.
#
# Usage:
#   chmod +x ssl-setup.sh
#   sudo ./ssl-setup.sh [domain] [email]
#
# Examples:
#   sudo ./ssl-setup.sh quran-academy.com admin@quran-academy.com
#   sudo ./ssl-setup.sh meet.quran-academy.com admin@quran-academy.com
#===============================================================================

set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
    exit 1
}

DOMAIN="${1:-${DOMAIN:-quran-academy.com}}"
EMAIL="${2:-${EMAIL:-admin@quran-academy.com}}"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
WEBROOT="/var/www/certbot"
RENEWAL_HOOK="/etc/letsencrypt/renewal-hooks/post/reload-nginx.sh"

check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root"
    fi
}

install_certbot() {
    log "=== Installing Certbot ==="

    if command -v certbot &> /dev/null; then
        log "Certbot already installed"
        return
    fi

    apt update
    apt install -y certbot python3-certbot-nginx

    log "Certbot installed successfully"
}

create_webroot() {
    log "Creating webroot directory for Let's Encrypt..."

    mkdir -p "$WEBROOT"
    chmod -R 755 "$WEBROOT"

    log "Webroot directory created: $WEBROOT"
}

init_ssl_directory() {
    log "Creating SSL directory structure..."

    mkdir -p "$(dirname "$CERT_DIR")"
    mkdir -p "$(dirname "$RENEWAL_HOOK")"

    log "SSL directory structure created"
}

generate_certificate() {
    log "=== Generating Let's Encrypt Certificate ==="
    log "Domain: $DOMAIN"
    log "Email: $EMAIL"

    if [ -d "$CERT_DIR" ]; then
        log "Certificate already exists for $DOMAIN"
        log "Run 'certbot renew' to renew or use --force-renewal"
        return
    fi

    certbot certonly \
        --webroot \
        --webroot-path "$WEBROOT" \
        --domain "$DOMAIN" \
        --domain "www.${DOMAIN}" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --expand \
        --key-type ecdsa \
        --elliptic-curve secp384r1 \
        || error "Certificate generation failed"

    log "Certificate generated successfully"
    list_certificates
}

generate_meet_certificate() {
    local meet_domain="meet.${DOMAIN}"

    log "=== Generating Certificate for $meet_domain ==="

    if [ -d "/etc/letsencrypt/live/${meet_domain}" ]; then
        log "Certificate already exists for $meet_domain"
        return
    fi

    certbot certonly \
        --webroot \
        --webroot-path "$WEBROOT" \
        --domain "$meet_domain" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --expand \
        --key-type ecdsa \
        --elliptic-curve secp384r1 \
        || log "Warning: Failed to generate certificate for $meet_domain (optional)"

    log "Meet certificate generation completed"
}

setup_auto_renewal() {
    log "=== Setting up automatic certificate renewal ==="

    cat > "$RENEWAL_HOOK" << 'RENEWAL_EOF'
#!/bin/bash
# Reload Nginx after certificate renewal
systemctl reload nginx
echo "[$(date)] Certificate renewed and Nginx reloaded" >> /var/log/letsencrypt/renewal.log
RENEWAL_EOF

    chmod +x "$RENEWAL_HOOK"

    crontab -l > /tmp/current_crontab 2>/dev/null || true

    if ! grep -q "certbot renew" /tmp/current_crontab; then
        echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'systemctl reload nginx'" >> /tmp/current_crontab
        crontab /tmp/current_crontab
        rm /tmp/current_crontab
    fi

    log "Auto-renewal configured"
    log "Certificate renewal will run twice daily"
}

setup_dhparam() {
    log "=== Generating DH parameters ==="

    local dhparam_file="/etc/ssl/certs/dhparam.pem"

    if [ ! -f "$dhparam_file" ]; then
        openssl dhparam -out "$dhparam_file" 2048
        log "DH parameters generated"
    else
        log "DH parameters already exist"
    fi
}

list_certificates() {
    log "=== Installed Certificates ==="

    if [ -d "$CERT_DIR" ]; then
        log "Certificate for: $DOMAIN"
        log "  Cert: $(ls -la "${CERT_DIR}/fullchain.pem" 2>/dev/null | awk '{print $6, $7, $8}')"
        log "  Key:  $(ls -la "${CERT_DIR}/privkey.pem" 2>/dev/null | awk '{print $6, $7, $8}')"

        local expiry=$(openssl x509 -enddate -noout -in "${CERT_DIR}/fullchain.pem" 2>/dev/null | cut -d= -f2)
        log "  Expires: $expiry"
    else
        log "No certificate found for $DOMAIN"
    fi
}

print_next_steps() {
    cat << 'NEXTSTEPS_EOF'

=========================================
SSL Setup Completed!
=========================================

Next Steps:

1. Update Nginx configuration:
   - Copy SSL certificate paths to your nginx config
   - Example paths:
     Certificate: /etc/letsencrypt/live/quran-academy.com/fullchain.pem
     Private Key: /etc/letsencrypt/live/quran-academy.com/privkey.pem

2. Test Nginx configuration:
   nginx -t

3. Reload Nginx:
   systemctl reload nginx

4. Verify SSL certificate:
   openssl s_client -connect quran-academy.com:443 -servername quran-academy.com

5. Test auto-renewal (dry run):
   certbot renew --dry-run

6. Check certificate expiry:
   certbot certificates

=========================================
Automatic Renewal
=========================================
- Certificates auto-renew 30 days before expiry
- Nginx reloads automatically after renewal
- Logs at: /var/log/letsencrypt/renewal.log
NEXTSTEPS_EOF
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    log "========================================="
    log "Quran Academy SSL Setup Script"
    log "========================================="

    check_root
    install_certbot
    create_webroot
    init_ssl_directory
    setup_dhparam
    generate_certificate
    generate_meet_certificate
    setup_auto_renewal
    list_certificates
    print_next_steps

    log "========================================="
    log "SSL setup completed!"
    log "========================================="
}

main "$@"
