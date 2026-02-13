# BACKEND_SPECS: System of Record & Orchestration

## 1. Ingestor (MQTT)
- **Topic:** `vitals/stream`
- **Schema:** `{"patient_id": "P001", "hr": 115, "ts": 1700000000}`
- **Broker:** Mosquitto (running on Vultr Port 1883)

## 2. Decision Logic (Gemini 2.0 Flash)
- **Trigger:** HR > 100 or Rapid Accel Delta
- **Function:** `get_intervention_plan(vitals, simulation_frame)`
- **Output:** `{ "action": "CALL_PATIENT", "anchor_id": "MEMORY_04" }`

## 3. Actuators
- **Voice:** Retell API call with dynamic variable injection ({{memory_anchor}}).
- **Robot:** Webots Supervisor API commands: robot.move_to(patient_pos).
