# GuardianVoice AI: Vultr Deployment Guide

## Prerequisites

1. **Vultr Account** - High-Performance VM (2+ vCPU, 4GB RAM)
2. **Domain/IP** - Public IP address or domain for the orchestrator API
3. **API Keys** - Gemini, Retell AI credentials
4. **SSH Access** - To the Vultr VM

## Quick Start: One-Command Provisioning

```bash
# SSH into your Vultr VM
ssh root@<your-vultr-ip>

# Run the provisioning script
curl -fsSL https://raw.githubusercontent.com/your-repo/setup_vultr.sh | bash

# Or locally with: bash setup_vultr.sh
```

## Manual Setup Steps

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Dependencies

```bash
# Core dependencies
sudo apt install -y nodejs npm python3-pip git

# MQTT Broker
sudo apt install -y mosquitto mosquitto-clients

# Webots (optional, for simulation)
sudo apt install -y webots xvfb

# Useful tools
sudo apt install -y curl wget htop
```

### Step 3: Enable Services

```bash
# Start Mosquitto
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Verify
mosquitto -v
```

### Step 4: Configure Firewall

```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, HTTPS, MQTT
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 1883/tcp  # MQTT
sudo ufw allow 4001/tcp  # Orchestrator API
sudo ufw allow 5173/tcp  # Admin UI
sudo ufw allow 5174/tcp  # Family UI

sudo ufw status
```

### Step 5: Clone and Install

```bash
# Clone repository
git clone <your-repo-url> /opt/guardianvoice
cd /opt/guardianvoice

# Install dependencies
npm install

# Test local build
npm run dev:orchestrator &
npm run dev:ingestor &

# Ctrl+C to stop
```

### Step 6: Configure Environment

```bash
# Create production .env files
cat > apps/orchestrator/.env << EOF
MQTT_URL=mqtt://localhost:1883
API_PORT=4001
DB_PATH=/var/lib/guardianvoice/guardianvoice.db
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-pro
RETELL_API_KEY=your_retell_key_here
RETELL_FROM_NUMBER=+15551234567
RETELL_TO_NUMBER=+15559876543
RETELL_AGENT_ID=agent_xxxxx
RETELL_AGENT_VERSION=1
EOF

cat > apps/ingestor/.env << EOF
MQTT_URL=mqtt://localhost:1883
EOF

# Create data directory
sudo mkdir -p /var/lib/guardianvoice
sudo chown $USER:$USER /var/lib/guardianvoice
```

### Step 7: Set Up Systemd Services

```bash
# Orchestrator service
sudo tee /etc/systemd/system/guardianvoice-orchestrator.service > /dev/null << EOF
[Unit]
Description=GuardianVoice Orchestrator
After=network.target mosquitto.service

[Service]
Type=simple
User=guardianvoice
WorkingDirectory=/opt/guardianvoice
ExecStart=/usr/bin/npm run dev:orchestrator
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Ingestor service
sudo tee /etc/systemd/system/guardianvoice-ingestor.service > /dev/null << EOF
[Unit]
Description=GuardianVoice Ingestor
After=network.target mosquitto.service

[Service]
Type=simple
User=guardianvoice
WorkingDirectory=/opt/guardianvoice
ExecStart=/usr/bin/npm run dev:ingestor
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload and start
sudo systemctl daemon-reload
sudo systemctl enable guardianvoice-orchestrator
sudo systemctl enable guardianvoice-ingestor
sudo systemctl start guardianvoice-orchestrator
sudo systemctl start guardianvoice-ingestor

# Check status
sudo systemctl status guardianvoice-orchestrator
sudo systemctl status guardianvoice-ingestor
```

### Step 8: Configure Nginx Reverse Proxy

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/guardianvoice > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:4001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/guardianvoice /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and start
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Step 9: Monitoring and Logs

```bash
# View service logs
sudo journalctl -u guardianvoice-orchestrator -f
sudo journalctl -u guardianvoice-ingestor -f

# Check health endpoint
curl http://localhost:4001/api/health

# Monitor services
systemctl list-units --type=service | grep guardianvoice
```

## Production Checklist

- [ ] All environment variables configured
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Services running and enabled
- [ ] Health endpoints responding
- [ ] Database backups configured
- [ ] Logging aggregation setup
- [ ] Monitoring alerts configured

## Monitoring Setup

### System Health

```bash
# Check memory
free -h

# Check disk
df -h

# Check services
sudo systemctl status guardianvoice-*

# Recent errors
sudo journalctl -n 50
```

### Application Health

```bash
# API Health Check
curl -s http://localhost:4001/api/health | jq .

# Incident count
curl -s http://localhost:4001/api/incidents | jq '.incidents | length'

# Memory anchors
curl -s http://localhost:4001/api/anchors | jq '.anchors | length'
```

## Troubleshooting

### MQTT Connection Issues

```bash
# Check if mosquitto is running
sudo systemctl status mosquitto

# Test MQTT connectivity
mosquitto_sub -h localhost -t "#" -v

# Restart if needed
sudo systemctl restart mosquitto
```

### Service Won't Start

```bash
# Check logs
sudo journalctl -u guardianvoice-orchestrator -n 50

# Test npm commands manually
cd /opt/guardianvoice
npm run dev:orchestrator

# Check port conflicts
sudo netstat -tlnp | grep 4001
```

### High Latency Issues

```bash
# Monitor CPU usage
top

# Check MQTT message rate
mosquitto_sub -h localhost -t "vitals/stream" | head -20

# Check database queries
sqlite3 /var/lib/guardianvoice/guardianvoice.db "PRAGMA query_only = ON; SELECT COUNT(*) FROM incidents;"
```

## Backup Strategy

```bash
# Daily database backup
sudo crontab -e

# Add:
0 2 * * * cp /var/lib/guardianvoice/guardianvoice.db /var/lib/guardianvoice/backup-$(date +\%Y\%m\%d).db

# Old backup cleanup
0 3 * * * find /var/lib/guardianvoice -name "backup-*.db" -mtime +30 -delete
```

## Performance Tuning

### MQTT

```bash
# Edit /etc/mosquitto/mosquitto.conf
max_connections -1
max_queued_messages 0
```

### System

```bash
# Increase file descriptors
sudo sysctl -w fs.file-max=2097152

# Optimize network
sudo sysctl -w net.core.somaxconn=65535
```

## Security Hardening

```bash
# Create dedicated user
sudo useradd -r -s /bin/false guardianvoice

# Restrict SSH
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Enable automatic updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Deployment Verification

```bash
#!/bin/bash
echo "🔍 GuardianVoice Deployment Verification"
echo "========================================"

# Check services
echo "✓ Orchestrator:" $(systemctl is-active guardianvoice-orchestrator)
echo "✓ Ingestor:" $(systemctl is-active guardianvoice-ingestor)
echo "✓ Mosquitto:" $(systemctl is-active mosquitto)

# Check ports
echo "✓ API (4001):" $(nc -z localhost 4001 && echo "OPEN" || echo "CLOSED")
echo "✓ MQTT (1883):" $(nc -z localhost 1883 && echo "OPEN" || echo "CLOSED")

# Check health
echo "✓ Health:" $(curl -s http://localhost:4001/api/health | jq .ok)

echo "========================================"
echo "Deployment ready! 🚀"
```

## Support

For issues or questions:
1. Check logs: `sudo journalctl -u guardianvoice-* -f`
2. Test health endpoint: `curl http://localhost:4001/api/health`
3. Review this guide's troubleshooting section
4. Contact support with logs attached
