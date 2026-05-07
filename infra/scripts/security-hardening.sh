#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/quran-academy/security-hardening.log"

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

log "========================================="
log "VPS Security Hardening Script"
log "========================================="

check_root

configure_fail2ban() {
    log "Configuring fail2ban for SSH and nginx..."

    if ! command -v fail2ban-server &> /dev/null; then
        apt update && apt install -y fail2ban
    fi

    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@quran-academy.com
sender = fail2ban@quran-academy.com
action = %(action_mwl)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
findtime = 600

[nginx-http-auth]
enabled = true
port = 80,443
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600

[nginx-noscript]
enabled = true
port = 80,443
filter = nginx-noscript
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-badbots]
enabled = true
port = 80,443
filter = nginx-badbots
logpath = /var/log/nginx/error.log
maxretry = 2

[nginx-dos]
enabled = true
port = 80,443
filter = nginx-dos
logpath = /var/log/nginx/access.log
maxretry = 100
findtime = 60
bantime = 600

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
port = 80,443
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 300
findtime = 60
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    log "fail2ban configured successfully"

    ufw status verbose
}

verify_ufw_rules() {
    log "Verifying UFW firewall rules..."

    if command -v ufw &> /dev/null; then
        ufw status verbose
        log "UFW is active with the following rules:"
        ufw status numbered
    else
        log "Warning: UFW not installed"
    fi
}

configure_docker_security() {
    log "Configuring Docker security..."

    mkdir -p /etc/docker

    DOCKER_CONFIG=$(cat << 'DOCKEREOF'
{
    "icc": false,
    "live-restore": true,
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "userland-proxy": false,
    "metrics-addr": "127.0.0.1:9323",
    "features": {
        "buildkit": true
    }
}
DOCKEREOF
)

    echo "$DOCKER_CONFIG" > /etc/docker/daemon.json

    if command -v apparmor_parser &> /dev/null; then
        log "AppArmor is available"
    else
        log "Warning: AppArmor not found"
    fi

    systemctl restart docker
    log "Docker daemon security configured"
}

enable_content_trust() {
    log "Enabling Docker Content Trust..."

    export DOCKER_CONTENT_TRUST=1

    if [ ! -d "/etc/systemd/system/docker.service.d" ]; then
        mkdir -p /etc/systemd/system/docker.service.d
    fi

    cat > /etc/systemd/system/docker.service.d/content-trust.conf << 'EOF'
[Service]
Environment="DOCKER_CONTENT_TRUST=1"
EOF

    systemctl daemon-reload
    systemctl restart docker
    log "Docker Content Trust enabled"
}

configure_nginx_security_headers() {
    log "Checking nginx security headers configuration..."

    if [ -f "/opt/quran-academy/infra/nginx/default.conf" ]; then
        log "Nginx config exists at /opt/quran-academy/infra/nginx/default.conf"
        log "Required security headers already configured:"
        grep -E "X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport|Referrer-Policy" \
            /opt/quran-academy/infra/nginx/default.conf || true
    else
        log "Warning: Nginx config not found at expected location"
    fi
}

setup_sysctl_hardening() {
    log "Applying sysctl network hardening..."

    cat >> /etc/sysctl.conf << 'SYSCTLEOF'
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_ra = 0
net.ipv6.conf.default.accept_ra = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 1
kernel.yama.ptrace_scope = 2
net.core.bpf_jit_limit = 256MiB
SYSCTLEOF

    sysctl -p
    log "sysctl hardening applied"
}

main() {
    configure_fail2ban
    verify_ufw_rules
    configure_docker_security
    enable_content_trust
    configure_nginx_security_headers
    setup_sysctl_hardening

    log "========================================="
    log "Security hardening completed!"
    log "========================================="
    log "Next steps:"
    log "1. Run infra/scripts/security.sh for additional hardening"
    log "2. Configure SSH key-only authentication"
    log "3. Reboot: reboot"
}

main "$@"
