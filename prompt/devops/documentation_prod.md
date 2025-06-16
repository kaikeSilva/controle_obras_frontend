# Production-Ready VPS Setup Checklist: Ubuntu 24.04 LTS with Docker

This comprehensive checklist provides production-grade configurations for deploying Vue 3 frontend, Laravel 12 backend, MySQL, Redis, and Reverb WebSockets using Docker containers with Traefik reverse proxy on Ubuntu 24.04 LTS. Based on current 2024/2025 best practices, this guide emphasizes security hardening, monitoring, and automation.

## Phase 1: System Foundation and Security Hardening

### Initial Server Setup

**System Update and Package Management**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim htop unzip ufw fail2ban

# Configure automatic security updates
sudo apt install -y unattended-upgrades apt-listchanges bsd-mailx
sudo dpkg-reconfigure -plow unattended-upgrades
```

**Create Non-Root User**
```bash
# Add user with sudo privileges
sudo adduser --disabled-password --gecos "Admin User" deployuser
sudo usermod -aG sudo deployuser

# Generate SSH key pair (on local machine)
ssh-keygen -t ed25519 -b 4096 -f ~/.ssh/production_server_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/production_server_key.pub deployuser@server_ip
```

### SSH Hardening Configuration

**Edit SSH Configuration (`/etc/ssh/sshd_config`)**
```bash
# Change default port and disable root login
Port 2222
Protocol 2
PermitRootLogin no
MaxAuthTries 3
LoginGraceTime 30
MaxSessions 2

# Enable key-based authentication only  
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no

# Disable unused features
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# User restrictions
AllowUsers deployuser
DenyUsers root

# Connection settings
ClientAliveInterval 300
ClientAliveCountMax 2
TCPKeepAlive no

# Enable verbose logging
SyslogFacility AUTH
LogLevel VERBOSE

# Restart SSH service
sudo systemctl reload sshd
```

### UFW Firewall Configuration

**Configure Firewall Rules**
```bash
# Reset and set defaults
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential services
sudo ufw allow 2222/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Rate limiting for SSH
sudo ufw limit 2222/tcp

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

### Fail2Ban Setup

**Configure Fail2Ban (`/etc/fail2ban/jail.local`)**
```bash
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1/128 192.168.1.0/24
banaction = ufw
backend = systemd

# Email notifications
destemail = admin@yourdomain.com
sendername = Fail2Ban
mta = sendmail
action = %(action_mwl)s

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h
findtime = 1h

# Enable and start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### System Hardening

**Kernel Parameter Optimization (`/etc/sysctl.d/99-security.conf`)**
```bash
# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.tcp_syncookies = 1

# Memory protections
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1

# Performance optimizations
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_congestion_control = bbr
vm.swappiness = 10
vm.vfs_cache_pressure = 50

# Apply settings
sudo sysctl -p /etc/sysctl.d/99-security.conf
```

## Phase 2: Docker Installation and Configuration

### Docker Engine Setup

**Install Docker and Docker Compose**
```bash
# Add Docker's official GPG key
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker deployuser

# Configure Docker daemon
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

# Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker
```

### Docker Security Configuration

**Create Docker Networks**
```bash
# Create external network for Traefik
docker network create traefik-network
```

## Phase 3: Application Stack Deployment

### Directory Structure Setup

**Create Project Structure**
```bash
mkdir -p /opt/myapp/{docker-compose,traefik,mysql,redis,backups,logs}
cd /opt/myapp
```

### Traefik Reverse Proxy Configuration

**Traefik Configuration (`traefik/docker-compose.yml`)**
```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v3.3
    container_name: traefik
    restart: unless-stopped
    command:
      # API and Dashboard
      - --api.dashboard=true
      - --api.insecure=false
      
      # Providers
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.file.directory=/etc/traefik/dynamic
      - --providers.file.watch=true
      
      # Entry Points
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      
      # SSL/TLS Configuration
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com
      - --certificatesresolvers.letsencrypt.acme.storage=/etc/traefik/acme/acme.json
      
      # Logging
      - --log.level=INFO
      - --log.filePath=/var/log/traefik/traefik.log
      - --accesslog=true
      - --accesslog.filePath=/var/log/traefik/access.log
      - --accesslog.format=json
      
      # Metrics
      - --metrics.prometheus=true
      - --metrics.prometheus.entrypoint=metrics
      - --entrypoints.metrics.address=:8080

    ports:
      - "80:80"
      - "443:443"
      
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config:/etc/traefik/dynamic:ro
      - ./acme:/etc/traefik/acme
      - ./logs:/var/log/traefik
      
    labels:
      - traefik.enable=true
      - traefik.http.routers.dashboard.rule=Host(`traefik.yourdomain.com`)
      - traefik.http.routers.dashboard.tls=true
      - traefik.http.routers.dashboard.tls.certresolver=letsencrypt
      - traefik.http.routers.dashboard.service=api@internal
      - traefik.http.routers.dashboard.middlewares=auth@file
      
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

**Security Middleware (`traefik/config/security-headers.yml`)**
```yaml
http:
  middlewares:
    security-headers:
      headers:
        frameDeny: true
        browserXssFilter: true
        contentTypeNosniff: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        contentSecurityPolicy: >-
          default-src 'self';
          script-src 'self' 'unsafe-inline';
          style-src 'self' 'unsafe-inline';
          img-src 'self' data: https:;
          connect-src 'self';
          frame-ancestors 'none';
          object-src 'none';
        
    auth:
      basicAuth:
        users:
          - "admin:$2y$10$your-hashed-password-here"
        realm: "Traefik Dashboard"
    
    rate-limit:
      rateLimit:
        average: 100
        burst: 200
        period: 1s
```

### Application Stack Configuration

**Main Application Stack (`docker-compose/app-stack.yml`)**
```yaml
version: '3.8'

services:
  # Vue 3 Frontend (Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: myapp-frontend
    restart: unless-stopped
    labels:
      - traefik.enable=true
      - traefik.http.routers.frontend.rule=Host(`app.yourdomain.com`)
      - traefik.http.routers.frontend.tls=true
      - traefik.http.routers.frontend.tls.certresolver=letsencrypt
      - traefik.http.routers.frontend.middlewares=security-headers@file
      - traefik.http.services.frontend.loadbalancer.server.port=80
    networks:
      - traefik-network
      - app-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Laravel 12 Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: myapp-backend
    restart: unless-stopped
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - REVERB_SERVER_HOST=0.0.0.0
      - REVERB_SERVER_PORT=8080
    volumes:
      - backend-storage:/var/www/storage
      - backend-logs:/var/www/storage/logs
    networks:
      - app-network
      - traefik-network
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "php", "artisan", "health:check"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - traefik.enable=true
      - traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)
      - traefik.http.routers.backend.tls=true
      - traefik.http.routers.backend.tls.certresolver=letsencrypt
      - traefik.http.services.backend.loadbalancer.server.port=8080

  # Laravel Queue Worker
  queue-worker:
    image: myapp/backend:latest
    container_name: myapp-queue-worker
    restart: unless-stopped
    command: ["php", "artisan", "queue:work", "--tries=3", "--max-time=3600"]
    environment:
      - APP_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    volumes:
      - backend-storage:/var/www/storage
      - backend-logs:/var/www/storage/logs
    networks:
      - app-network
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Laravel Reverb WebSocket Server
  reverb:
    image: myapp/backend:latest
    container_name: myapp-reverb
    restart: unless-stopped
    command: ["php", "artisan", "reverb:start", "--host=0.0.0.0", "--port=8080"]
    environment:
      - APP_ENV=production
      - REVERB_SERVER_HOST=0.0.0.0
      - REVERB_SERVER_PORT=8080
      - REDIS_HOST=redis
    networks:
      - app-network
      - traefik-network
    depends_on:
      redis:
        condition: service_healthy
    labels:
      - traefik.enable=true
      - traefik.http.routers.reverb.rule=Host(`ws.yourdomain.com`)
      - traefik.http.routers.reverb.tls=true
      - traefik.http.routers.reverb.tls.certresolver=letsencrypt
      - traefik.http.services.reverb.loadbalancer.server.port=8080

  # MySQL Database
  mysql:
    image: mysql:8.1
    container_name: myapp-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql/conf.d:/etc/mysql/conf.d:ro
    ports:
      - "3306:3306"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache & Session Store
  redis:
    image: redis:7.2-alpine
    container_name: myapp-redis
    restart: unless-stopped
    command: redis-server --save 60 1 --loglevel warning --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    ports:
      - "6379:6379"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  traefik-network:
    external: true
  app-network:
    driver: bridge

volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local
  backend-storage:
    driver: local
  backend-logs:
    driver: local
```

## Phase 4: Monitoring and Observability

### Prometheus and Grafana Stack

**Monitoring Stack (`monitoring/docker-compose.yml`)**
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=15d'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    labels:
      - traefik.enable=true
      - traefik.http.routers.prometheus.rule=Host(`prometheus.yourdomain.com`)
      - traefik.http.routers.prometheus.tls=true
      - traefik.http.routers.prometheus.tls.certresolver=letsencrypt
      - traefik.http.routers.prometheus.middlewares=auth@file
      - traefik.http.services.prometheus.loadbalancer.server.port=9090
    networks:
      - traefik-network
      - monitoring-network

  grafana:
    image: grafana/grafana:10.1.0
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana-data:/var/lib/grafana
    labels:
      - traefik.enable=true
      - traefik.http.routers.grafana.rule=Host(`grafana.yourdomain.com`)
      - traefik.http.routers.grafana.tls=true
      - traefik.http.routers.grafana.tls.certresolver=letsencrypt
      - traefik.http.routers.grafana.middlewares=security-headers@file
      - traefik.http.services.grafana.loadbalancer.server.port=3000
    networks:
      - traefik-network
      - monitoring-network

  node-exporter:
    image: prom/node-exporter:v1.6.0
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: cadvisor
    restart: unless-stopped
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring-network

networks:
  traefik-network:
    external: true
  monitoring-network:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:
```

### Log Management with Loki and Vector

**Log Aggregation Stack (`logging/docker-compose.yml`)**
```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:2.9.0
    container_name: loki
    restart: unless-stopped
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/data/loki
    networks:
      - monitoring-network

  vector:
    image: timberio/vector:latest-alpine
    container_name: vector
    restart: unless-stopped
    volumes:
      - ./vector.toml:/etc/vector/vector.toml
      - /var/log:/var/log:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - monitoring-network

volumes:
  loki-data:

networks:
  monitoring-network:
    external: true
```

## Phase 5: Backup and Recovery

### Automated Backup System

**Restic Backup Script (`/usr/local/bin/automated-backup.sh`)**
```bash
#!/bin/bash
# Comprehensive backup script using Restic

export RESTIC_REPOSITORY="/backup/restic"
export RESTIC_PASSWORD_FILE="/etc/restic/password"

# Create log file
LOG_FILE="/var/log/backup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting backup process" >> $LOG_FILE

# Database backups
echo "[$DATE] Creating database backups" >> $LOG_FILE
docker exec myapp-mysql mysqldump --all-databases --single-transaction | gzip > /tmp/mysql-backup.sql.gz
docker exec myapp-redis redis-cli --rdb /tmp/redis-backup.rdb

# System backup with Restic
echo "[$DATE] Running Restic backup" >> $LOG_FILE
restic backup \
    /etc \
    /home \
    /var/lib/docker/volumes \
    /opt/myapp \
    /tmp/mysql-backup.sql.gz \
    /tmp/redis-backup.rdb \
    --exclude-caches \
    --exclude '/var/cache' \
    --exclude '/tmp' \
    --tag "$(date +%Y-%m-%d)" >> $LOG_FILE 2>&1

# Clean up temporary files
rm -f /tmp/mysql-backup.sql.gz /tmp/redis-backup.rdb

# Prune old backups
echo "[$DATE] Pruning old backups" >> $LOG_FILE
restic forget --prune \
    --keep-daily 7 \
    --keep-weekly 4 \
    --keep-monthly 12 >> $LOG_FILE 2>&1

echo "[$DATE] Backup process completed" >> $LOG_FILE

# Send notification on failure
if [ $? -ne 0 ]; then
    mail -s "Backup Failed on $(hostname)" admin@yourdomain.com < $LOG_FILE
fi
```

**Schedule Backups with Cron**
```bash
# Add to crontab
0 2 * * * /usr/local/bin/automated-backup.sh
0 6 * * 0 /usr/local/bin/backup-verification.sh
```

## Phase 6: Deployment and Automation

### CI/CD Pipeline with GitHub Actions

**GitHub Actions Workflow (`.github/workflows/deploy.yml`)**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: 8.3
        extensions: mbstring, pdo_mysql, bcmath, gd
        
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install Dependencies
      run: |
        composer install --no-dev --optimize-autoloader
        npm ci
        
    - name: Build Assets
      run: npm run build
      
    - name: Run Tests
      run: php artisan test
      
    - name: Build Docker Images
      run: |
        docker build -t myapp/backend:${{ github.sha }} -f backend/Dockerfile.prod .
        docker build -t myapp/frontend:${{ github.sha }} -f frontend/Dockerfile.prod .
        
    - name: Deploy to Production
      run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        docker push myapp/backend:${{ github.sha }}
        docker push myapp/frontend:${{ github.sha }}
        
        # Deploy via SSH
        ssh -o StrictHostKeyChecking=no ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
          cd /opt/myapp
          docker-compose -f docker-compose/app-stack.yml pull
          docker-compose -f docker-compose/app-stack.yml up -d --remove-orphans
          docker system prune -f
        EOF
```

### Infrastructure as Code with Terraform

**Basic Infrastructure (`infrastructure/main.tf`)**
```hcl
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

# Docker networks
resource "docker_network" "traefik_network" {
  name = "traefik-network"
}

resource "docker_network" "app_network" {
  name = "app-network"
}

# Docker volumes
resource "docker_volume" "mysql_data" {
  name = "mysql-data"
}

resource "docker_volume" "redis_data" {
  name = "redis-data"
}
```

## Production Checklist Summary

### Pre-Deployment Verification
- [ ] SSH key-based authentication configured
- [ ] UFW firewall rules applied and tested
- [ ] Fail2Ban installed and configured
- [ ] Docker daemon configured with security settings
- [ ] SSL certificates properly configured in Traefik
- [ ] Environment variables securely managed
- [ ] Database credentials using Docker secrets
- [ ] Backup system tested and automated
- [ ] Monitoring stack deployed and configured
- [ ] Log aggregation system operational

### Security Hardening Verification
- [ ] Root login disabled
- [ ] SSH port changed from default
- [ ] System packages up to date
- [ ] Kernel security parameters applied
- [ ] Container security scanning implemented
- [ ] Network segmentation configured
- [ ] Security headers configured in Traefik
- [ ] Rate limiting implemented
- [ ] Intrusion detection system active

### Performance Optimization
- [ ] Kernel parameters optimized for web workloads
- [ ] Docker resource limits configured
- [ ] Database performance tuning applied
- [ ] Redis cache configuration optimized
- [ ] CDN integration for static assets
- [ ] Application-level caching implemented
- [ ] Performance monitoring dashboards created

### Operational Readiness
- [ ] Automated deployment pipeline functional
- [ ] Health checks configured for all services
- [ ] Backup verification automated
- [ ] Log rotation configured
- [ ] Alerting rules configured
- [ ] Documentation updated
- [ ] Disaster recovery procedures tested
- [ ] Team access and permissions configured

This comprehensive checklist provides a production-ready foundation for deploying modern web applications with Docker on Ubuntu 24.04 LTS. The configuration emphasizes security, monitoring, and operational excellence while following current 2024/2025 best practices for containerized deployments.