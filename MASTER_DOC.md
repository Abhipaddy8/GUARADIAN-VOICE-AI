# MASTER_DOC: GuardianVoice AI Product Strategy

## 1. Vision
To bridge the "Agitation Gap" in dementia care by providing a 24/7 autonomous first responder that uses familiarity, not force, to calm patients.

## 2. User Personas
- **The Patient:** Needs immediate, familiar grounding during "sundowning" episodes
- **The Caregiver:** Needs a system that handles early-stage agitation automatically

## 3. Product Workflow
1. **Perception:** Samsung Fit3 streams HR data to Vultr MQTT.
2. **Shadowing:** The Webots simulation mirrors the patient's state.
3. **Reasoning:** Gemini 2.0 evaluates the crisis and chooses a "Memory Anchor."
4. **Action:** Vultr triggers an outbound Retell AI call using a cloned family voice.

## 4. Scalability (Vultr Edge)
By utilizing Vultr's global regions, we ensure <1s latency for voice calls, critical for medical de-escalation.
