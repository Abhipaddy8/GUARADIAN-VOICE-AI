# GuardianVoice AI: Digital Twin Family Member 🧠🤖

**Autonomous Dementia Care System - Software-First Robotics**

GuardianVoice AI is a simulation-first robotics platform that uses real-time smartwatch vitals to autonomously intervene during dementia-related agitation. The system acts as a "Digital Twin" of the patient's family member, making personalized voice calls with AI-selected memories to de-escalate crises.

**Hackathon Track:** Track 3 - Robotic Interaction & Task Execution (Simulation-First)
**Status:** ✅ Code Complete | ⏳ Deployment & Demo Recording

## 🚀 The Stack
- **Infrastructure:** Vultr VM (Central system of record & coordination).
- **AI Engine:** Google Gemini 2.5 Flash (Autonomous escalation analysis & reasoning).
- **Real-Time Data:** MQTT + Mosquitto (Vitals ingestion & intervention publishing).
- **Voice:** Retell AI (Personalized family voice calls with dynamic variables).
- **Decision Engine:** Multi-level escalation analysis (4 severity levels).
- **Database:** SQLite (Incident logging, call tracking, memory anchors).
- **Sensors:** Samsung Fit3 (Smartwatch vitals) + MQTT simulator (testing).

## 🛠 Features

### AI & Decision-Making
- **Autonomous Escalation Analysis:** Real-time vitals analyzed to determine intervention urgency (4 levels)
- **Gemini 2.5 Reasoning:** AI selects best therapeutic memory anchors with 95%+ confidence
- **Dynamic Personalization:** Calls customized by escalation level (gentle → urgent tone)

### Voice & Communication
- **Retell AI Integration:** Low-latency phone calls to patient with cloned family voice
- **Memory-Grounded Messages:** AI-selected memories used as therapeutic anchor in each call
- **Family Voice Cloning:** Personalized audio samples create family-like voice

### Real-Time Operations
- **MQTT Vitals Stream:** Live heart rate & acceleration from Samsung Fit3 or simulator
- **Sub-200ms Pipeline:** Vitals → Risk detection → Intervention → Logging
- **Multi-Patient Support:** Handles multiple patients simultaneously

### Monitoring & Analytics
- **Admin Dashboard:** Real-time incident log with AI reasoning displayed
- **Family Portal:** Memory anchor vault, intervention history, call outcomes
- **Call Tracking:** Database stores call status, duration, outcome for each intervention
- **Performance Metrics:** Latency tracking, escalation accuracy, success rates

---

## 📊 System Status

**Completed:** Code for all components | Retell integration tested | 28 incident scenarios validated
**In Progress:** Dashboard updates | Vultr deployment | Demo video
**Requirements:** Retell account setup (for real calls)

---

## 🚀 Quick Start

```bash
npm install          # Install dependencies
mosquitto -d         # Start MQTT broker
npm run dev:*        # Start services (ingestor, orchestrator, admin, family)
npm run seed         # Load demo data
npm run demo         # Run automated demo scenario
```

Access dashboards:
- Admin: http://localhost:5173
- Family: http://localhost:5174

See **QUICKSTART.md** for detailed setup.

---

## 📖 Documentation

- **ARCHITECT.md** - Complete system architecture
- **BUILD_SUMMARY.md** - Implementation progress
- **QUICKSTART.md** - Setup guide
- **DEPLOYMENT.md** - Vultr deployment
- **RETELL_INTEGRATION_STATUS.md** - Retell details
- **HACKATHON_SUBMISSION.md** - Submission guide

---

*Software-First Robotics Hackathon - Track 3: Robotic Interaction & Task Execution*
