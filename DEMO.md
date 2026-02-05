# DEMO: First Vertical Slice

## What Works Now
- MQTT vitals ingest
- Triggered intervention event
- Retell call orchestration (ElevenLabs voice via Retell)
- Incident log stored in SQLite
- Admin incident log from live data
- Family portal anchor onboarding (stored in SQLite)

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
- Set Retell keys in `apps/orchestrator/.env` to enable real calls.
- API runs on `http://localhost:4001`.
- This demo focuses on the data path and UI layout, not clinical safety.
