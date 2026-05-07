#!/bin/bash
#===============================================================================
# Quran Academy — Security Hardening Script
#===============================================================================
# This script hardens the VPS for production deployment.
# Run as root on a fresh Ubuntu 22.04 VPS.
#
# Usage:
#   chmod +x security-hardening.sh
#   sudo ./security-hardening.sh
#
# WARNING: This script modifies system settings. Run on a fresh VPS.
#===============================================================================

set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
    exit 1
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root"
    fi
}

#-------------------------------------------------------------------------------
# 1. UFW Firewall Setup
#-------------------------------------------------------------------------------
setup_ufw() {
    log "=== Configuring UFW Firewall ==="

    if ! command -v ufw &> /dev/null; then
        apt update && apt install -y ufw
    fi

    ufw --force disable
    ufw --force reset

    ufw default deny incoming
    ufw default allow outgoing

    ufw allow ssh comment 'SSH access'
    ufw allow http comment 'HTTP web traffic'
    ufw allow https comment 'HTTPS web traffic'

    ufw --force enable
    ufw status verbose

    log "UFW firewall configured successfully"
}

#-------------------------------------------------------------------------------
# 2. fail2ban Configuration
#-------------------------------------------------------------------------------
setup_fail2ban() {
    log "=== Configuring fail2ban ==="

    if ! command -v fail2ban-server &> /dev/null; then
        apt update && apt install -y fail2ban
    fi

    cat > /etc/fail2ban/jail.local << 'FAIL2BAN_EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@quran-academy.com
sender = fail2ban@quran-academy.com
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/error.log
maxretry = 2

[nginx-nohome]
enabled = true
port = http,https
filter = nginx-nohome
logpath = /var/log/nginx/error.log
maxretry = 2

[nginx-dos]
enabled = true
port = http,https
filter = nginx-dos
logpath = /var/log/nginx/access.log
maxretry = 100
findtime = 60
bantime = 600

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 300
findtime = 60

[sshd-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 10
bantime = 3600
FAIL2BAN_EOF

    systemctl enable fail2ban
    systemctl restart fail2ban

    log "fail2ban configured successfully"
}

#-------------------------------------------------------------------------------
# 3. Docker Daemon Security
#-------------------------------------------------------------------------------
configure_docker_security() {
    log "=== Configuring Docker daemon security ==="

    mkdir -p /etc/docker

    cat > /etc/docker/daemon.json << 'DOCKER_EOF'
{
    "icc": false,
    "enable-swarm-mode": false,
    "live-restore": true,
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "userland-proxy": false,
    "experimental": false,
    "metrics-addr": "127.0.0.1:9323",
    "features": {
        "buildkit": true
    },
    "content-trust": true
}
DOCKER_EOF

    if command -v apparmor &> /dev/null; then
        log "AppArmor is available"
    else
        apt install -y apparmor apparmor-utils
        aa-status
    fi

    systemctl restart docker
    log "Docker daemon security configured"
}

configure_docker_socket_security() {
    log "=== Configuring Docker socket security ==="

    if [ -S /var/run/docker.sock ]; then
        chmod 660 /var/run/docker.sock
        chown root:docker /var/run/docker.sock
    fi

    log "Docker socket security configured"
}

#-------------------------------------------------------------------------------
# 4. Sysctl Hardening
#-------------------------------------------------------------------------------
setup_sysctl_hardening() {
    log "=== Configuring sysctl hardening ==="

    cat >> /etc/sysctl.conf << 'SYSCTL_EOF'
# Network hardening
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

# Kernel hardening
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 1
kernel.yama.ptrace_scope = 2
net.core.bpf_jit_limit = 256MiB

# TCP hardening
net.ipv4.tcp_timestamps = 1
net.ipv4.tcp_rfc1337 = 1
net.ipv4.conf.all.shared_media = 0
net.ipv4.conf.default.shared_media = 0

# Disable IPv6 if not needed
net.ipv6.conf.all.disable_ipv6 = 0
net.ipv6.conf.default.disable_ipv6 = 0
SYSCTL_EOF

    sysctl -p
    log "sysctl hardening configured"
}

#-------------------------------------------------------------------------------
# 5. SSH Key-Only Login Instructions
#-------------------------------------------------------------------------------
print_ssh_instructions() {
    log "========================================="
    log "SSH KEY-ONLY LOGIN SETUP INSTRUCTIONS"
    log "========================================="
    cat << 'SSH_EOF'

1. On your LOCAL machine, generate an SSH key pair:
   ssh-keygen -t ed25519 -C 'quran-academy-vps'

2. Copy your public key to the VPS:
   ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-vps-ip

3. Verify key-based login works:
   ssh -i ~/.ssh/id_ed25519 user@your-vps-ip

4. DISABLE password authentication (AFTER verifying key login works):
   Edit /etc/ssh/sshd_config on the VPS:

   PasswordAuthentication no
   PubkeyAuthentication yes
   PermitRootLogin no
   ChallengeResponseAuthentication no
   UsePAM yes

5. Restart SSH service:
   systemctl restart sshd

6. Test your connection TWICE before closing this session:
   ssh -i ~/.ssh/id_ed25519 user@your-vps-ip

IMPORTANT SECURITY NOTES:
- NEVER disable password auth until you've verified key login works
- Keep your private key safe - it's the only way to access the server
- Consider using ssh-agent to avoid entering your passphrase repeatedly
- Add a passphrase to your key for additional security
- Use SSH agent forwarding instead of copying private keys to server
SSH_EOF
}

#-------------------------------------------------------------------------------
# 6. Nginx Security Headers (update nginx config)
#-------------------------------------------------------------------------------
configure_nginx_security_headers() {
    log "=== Nginx security headers ==="

    NGINX_CONF="/etc/nginx/conf.d/security-headers.conf"

    cat > "$NGINX_CONF" << 'NGINX_SEC_EOF'
# Nginx Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Hide nginx version
server_tokens off;

# Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# X-Content-Type-Options
add_header X-Content-Type-Options "nosniff" always;

# X-XSS-Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy (adjust as needed)
# add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
NGINX_SEC_EOF

    systemctl reload nginx
    log "Nginx security headers configured"
}

#-------------------------------------------------------------------------------
# 7. Rate Limiting for Public Endpoints
#-------------------------------------------------------------------------------
configure_rate_limiting() {
    log "=== Configuring rate limiting ==="

    cat > /etc/nginx/conf.d/rate-limiting.conf << 'NGINX_RATE_EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=2r/s;

limit_conn_zone $binary_remote_addr zone=addr:10m;

# IP blacklist (add known bad IPs here)
geo $limit {
    default 1;
}
NGINX_RATE_EOF

    log "Rate limiting configured"
}

#-------------------------------------------------------------------------------
# 8. Logrotate Configuration
#-------------------------------------------------------------------------------
setup_logrotate() {
    log "=== Configuring logrotate ==="

    cat > /etc/logrotate.d/quran-academy << 'LOGROTATE_EOF'
/var/log/quran-academy/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
LOGROTATE_EOF

    mkdir -p /var/log/quran-academy
    touch /var/log/quran-academy/backup.log
    chmod 640 /var/log/quran-academy/*.log

    log "logrotate configured"
}

#-------------------------------------------------------------------------------
# 9. Automatic Security Updates
#-------------------------------------------------------------------------------
setup_unattended_upgrades() {
    log "=== Configuring automatic security updates ==="

    apt update && apt install -y unattended-upgrades

    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'UNATTENDED_EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::Package-Blacklist {
};
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
UNATTENDED_EOF

    cat > /etc/apt/apt.conf.d/10periodic << 'PERIODIC_EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
PERIODIC_EOF

    log "Automatic security updates configured"
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    log "========================================="
    log "Quran Academy Security Hardening Script"
    log "========================================="

    check_root
    setup_ufw
    setup_fail2ban
    configure_docker_security
    configure_docker_socket_security
    setup_sysctl_hardening
    configure_nginx_security_headers
    configure_rate_limiting
    setup_logrotate
    setup_unattended_upgrades
    print_ssh_instructions

    log "========================================="
    log "Security hardening completed!"
    log "========================================="
    log "IMPORTANT: Follow the SSH key setup instructions above."
    log "Reboot the server after running this script: reboot"
}

main "$@"
