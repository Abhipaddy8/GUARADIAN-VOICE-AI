# CLAUDE.md: AI Collaboration Guide

## 🏗 Coding Standards
- **Backend:** Node.js/Express (Vultr VM).
- **AI:** Always use google-generativeai SDK.
- **Privacy:** Never log PII. Use patient_id only.

## 🔧 Workflow
- **Build:** npm install
- **Test Ingestion:** npm run test:vitals
- **Simulation:** xvfb-run webots --mode=fast --batch my_world.wbt

## ⚠️ Important
- Retell call latency must stay < 1000ms.
- Ensure MQTT client auto-reconnects to the Vultr IP.
