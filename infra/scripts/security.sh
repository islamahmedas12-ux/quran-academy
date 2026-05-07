#!/bin/bash

set -euo pipefail

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
    exit 1
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root"
    fi
}

setup_ufw() {
    log "Configuring UFW firewall..."

    if ! command -v ufw &> /dev/null; then
        apt update && apt install -y ufw
    fi

    ufw --force disable
    ufw --force reset

    ufw default deny incoming
    ufw default allow outgoing

    ufw allow ssh
    ufw allow http
    ufw allow https

    ufw --force enable
    ufw status verbose

    log "UFW configured successfully"
}

setup_fail2ban() {
    log "Configuring fail2ban..."

    if ! command -v fail2ban-server &> /dev/null; then
        apt update && apt install -y fail2ban
    fi

    cat > /etc/fail2ban/jail.local << 'FAIL2BANEOF'
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
FAIL2BANEOF

    systemctl enable fail2ban
    systemctl restart fail2ban

    log "fail2ban configured successfully"
}

configure_docker_security() {
    log "Configuring Docker daemon security..."

    mkdir -p /etc/docker

    cat > /etc/docker/daemon.json << 'DOCKEREOF'
{
    "icc": false,
    "userns-remap": "default",
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
    }
}
DOCKEREOF

    systemctl restart docker

    log "Docker daemon security configured"
}

setup_docker_socket_security() {
    log "Configuring Docker socket security..."

    if [ -S /var/run/docker.sock ]; then
        chmod 660 /var/run/docker.sock
        chown root:docker /var/run/docker.sock
    fi

    log "Docker socket security configured"
}

setup_sysctl_hardening() {
    log "Configuring sysctl hardening..."

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

    log "sysctl hardening configured"
}

print_ssh_instructions() {
    log "========================================="
    log "SSH KEY-ONLY LOGIN SETUP INSTRUCTIONS"
    log "========================================="
    echo "
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
"
}

setup_logrotate() {
    log "Configuring logrotate for backup logs..."

    cat > /etc/logrotate.d/quran-academy << 'LOGROTATEEOF'
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
LOGROTATEEOF

    mkdir -p /var/log/quran-academy
    touch /var/log/quran-academy/backup.log
    chmod 640 /var/log/quran-academy/*.log

    log "logrotate configured"
}

main() {
    log "========================================="
    log "Quran Academy Security Hardening Script"
    log "========================================="

    check_root
    setup_ufw
    setup_fail2ban
    configure_docker_security
    setup_docker_socket_security
    setup_sysctl_hardening
    setup_logrotate
    print_ssh_instructions

    log "========================================="
    log "Security hardening completed!"
    log "========================================="
    log "IMPORTANT: Follow the SSH key setup instructions above."
    log "Reboot the server after running this script: reboot"
}

main "$@"
