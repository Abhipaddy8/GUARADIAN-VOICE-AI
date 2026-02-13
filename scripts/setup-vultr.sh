#!/bin/bash
set -e

REPO_URL=${1:-https://github.com/Abhipaddy8/GUARADIAN-VOICE-AI.git}
APP_DIR=/opt/guardianvoice
DATA_DIR=/var/lib/guardianvoice
USER=guardianvoice

printf "\n🚀 GuardianVoice AI — Vultr Deployment\n\n"

echo "🔧 Updating system packages"
sudo apt-get update -y
sudo apt-get install -y curl git jq nginx mosquitto mosquitto-clients ufw

if ! command -v node >/dev/null 2>&1; then
  echo "🧩 Installing Node.js 18.x"
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

sudo apt-get install -y npm certbot python3-certbot-nginx

if ! id -u "$USER" >/dev/null 2>&1; then
  echo "👤 Creating system user: $USER"
  sudo useradd -m -s /bin/bash "$USER"
else
  echo "👤 User $USER already exists"
fi

if [ ! -d "$APP_DIR/.git" ]; then
  echo "📦 Cloning repo to $APP_DIR"
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$USER:$USER" "$APP_DIR"
  sudo -u "$USER" git clone "$REPO_URL" "$APP_DIR"
else
  echo "📦 Pulling latest code in $APP_DIR"
  sudo -u "$USER" git -C "$APP_DIR" pull
fi

echo "📦 Installing npm dependencies"
sudo -u "$USER" bash -lc "cd $APP_DIR && npm install"

echo "📁 Creating data directory"
sudo mkdir -p "$DATA_DIR"
sudo chown -R "$USER:$USER" "$DATA_DIR"

ORCH_ENV="$APP_DIR/apps/orchestrator/.env"
INGEST_ENV="$APP_DIR/apps/ingestor/.env"

if [ ! -f "$ORCH_ENV" ]; then
  echo "📝 Creating orchestrator .env"
  cat <<'ENV' | sudo -u "$USER" tee "$ORCH_ENV" >/dev/null
MQTT_URL=mqtt://localhost:1883
API_PORT=4001
DB_PATH=/var/lib/guardianvoice/guardianvoice.db
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
RETELL_API_KEY=your_retell_key_here
RETELL_FROM_NUMBER=+10000000000
RETELL_TO_NUMBER=+10000000000
RETELL_AGENT_ID=agent_xxxxx
ENV
else
  echo "📝 Orchestrator .env already exists"
fi

if [ ! -f "$INGEST_ENV" ]; then
  echo "📝 Creating ingestor .env"
  echo "MQTT_URL=mqtt://localhost:1883" | sudo -u "$USER" tee "$INGEST_ENV" >/dev/null
else
  echo "📝 Ingestor .env already exists"
fi

ORCH_SERVICE=/etc/systemd/system/guardianvoice-orchestrator.service
INGEST_SERVICE=/etc/systemd/system/guardianvoice-ingestor.service

if [ ! -f "$ORCH_SERVICE" ]; then
  echo "🧰 Creating orchestrator systemd service"
  sudo tee "$ORCH_SERVICE" >/dev/null <<SERVICE
[Unit]
Description=GuardianVoice Orchestrator
After=network.target mosquitto.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run dev:orchestrator
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE
else
  echo "🧰 Orchestrator service already exists"
fi

if [ ! -f "$INGEST_SERVICE" ]; then
  echo "🧰 Creating ingestor systemd service"
  sudo tee "$INGEST_SERVICE" >/dev/null <<SERVICE
[Unit]
Description=GuardianVoice Ingestor
After=network.target mosquitto.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run dev:ingestor
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE
else
  echo "🧰 Ingestor service already exists"
fi

echo "🧷 Reloading systemd"
sudo systemctl daemon-reload

echo "🧯 Configuring UFW"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 1883
sudo ufw allow 4001
sudo ufw allow 5173
sudo ufw allow 5174

if sudo ufw status | grep -q "Status: inactive"; then
  sudo ufw --force enable
fi

echo "🚦 Enabling services"
sudo systemctl enable mosquitto
sudo systemctl enable guardianvoice-orchestrator
sudo systemctl enable guardianvoice-ingestor

echo "▶️  Starting services"
sudo systemctl restart mosquitto
sudo systemctl restart guardianvoice-orchestrator
sudo systemctl restart guardianvoice-ingestor

echo "\n✅ Verification Summary"
for svc in mosquitto guardianvoice-orchestrator guardianvoice-ingestor; do
  status=$(systemctl is-active "$svc" || true)
  echo "- $svc: $status"
done

echo "- Port 1883: $(nc -z localhost 1883 >/dev/null 2>&1 && echo open || echo closed)"
echo "- Port 4001: $(nc -z localhost 4001 >/dev/null 2>&1 && echo open || echo closed)"

if command -v curl >/dev/null 2>&1; then
  echo "- API health: $(curl -s http://localhost:4001/api/health || echo failed)"
fi

echo "\n🎯 Next: update .env files with real keys and configure Nginx + SSL if needed."
