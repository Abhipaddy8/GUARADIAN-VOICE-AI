# DEMO: First Vertical Slice

## What Works Now
- MQTT vitals ingest
- Triggered intervention event
- Orchestrator stub for ElevenLabs
- Admin and Family UI demo panels

## Quickstart
1. Install deps at the repo root:
   `npm install`
2. Start services in separate terminals:
   - `npm run dev:ingestor`
   - `npm run dev:orchestrator`
   - `npm run dev:admin`
   - `npm run dev:family`
3. Publish a test vitals event (example):
   `mosquitto_pub -h localhost -t vitals/stream -m '{"patient_id":"P001","hr":115,"accel_delta":30,"ts":1700000000}'`

## Notes
- Set ElevenLabs keys in `apps/orchestrator/.env` to enable real calls.
- This demo focuses on the data path and UI layout, not clinical safety.
