#!/bin/bash
# GuardianVoice Vultr Provisioning
echo "Provisioning Vultr Environment..."

sudo apt update && sudo apt upgrade -y
sudo apt install -y mosquitto mosquitto-clients nodejs npm python3-pip webots xvfb

# Setup MQTT
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Allow Traffic
sudo ufw allow 1883/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 3000/tcp

echo "Vultr Instance Ready for GuardianVoice Deployment."
