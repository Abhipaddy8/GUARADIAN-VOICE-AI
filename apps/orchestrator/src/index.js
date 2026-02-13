import "dotenv/config";
import express from "express";
import cors from "cors";
import mqtt from "mqtt";
import fetch from "node-fetch";
import {
  logIncident,
  setIncidentStatus,
  getIncidents,
  createAnchor,
  getAnchors,
  createPatient,
  getPatient,
  getPatients,
  updateOnboardingStatus,
  createFamilyMember,
  getFamilyMembers,
  setFamilyVoice,
  createVoiceRecording,
  getVoiceRecording
} from "./db.js";
import { planIntervention } from "./decision-engine.js";

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const apiPort = Number(process.env.API_PORT || 4001);

const retellApiKey = process.env.RETELL_API_KEY || "";
const retellFromNumber = process.env.RETELL_FROM_NUMBER || "";
const retellToNumber = process.env.RETELL_TO_NUMBER || "";
const retellAgentId = process.env.RETELL_AGENT_ID || "";
const retellAgentVersion = process.env.RETELL_AGENT_VERSION
  ? Number(process.env.RETELL_AGENT_VERSION)
  : undefined;

const app = express();
app.use(cors());
app.use(express.json());

// Health monitoring
const metrics = {
  interventions: 0,
  errors: 0,
  mqttConnected: false,
  lastError: null
};

app.get("/api/health", (_req, res) => {
  const health = {
    ok: metrics.mqttConnected,
    service: "orchestrator",
    mqtt: metrics.mqttConnected ? "connected" : "disconnected",
    api: "healthy",
    uptime: process.uptime(),
    metrics: {
      interventions: metrics.interventions,
      errors: metrics.errors
    }
  };
  res.status(metrics.mqttConnected ? 200 : 503).json(health);
});

app.get("/api/incidents", (_req, res) => {
  const incidents = getIncidents();
  res.json({
    incidents: incidents.map(i => ({
      id: i.id,
      patient_id: i.patient_id,
      reason: i.reason,
      anchor_title: i.anchor_title,
      gemini_reasoning: i.gemini_reasoning,
      confidence: i.confidence,
      status: i.status,
      call_id: i.call_id,
      escalation_level: i.escalation_level,
      call_tone: i.call_tone,
      created_at: i.created_at
    }))
  });
});

app.get("/api/anchors", (_req, res) => {
  res.json({ anchors: getAnchors() });
});

app.post("/api/anchors", (req, res) => {
  const { patient_id, title, story } = req.body || {};
  if (!patient_id || !title || !story) {
    res.status(400).json({ error: "patient_id, title, and story are required" });
    return;
  }
  const created = createAnchor({ patient_id, title, story });
  res.json({ anchor: { id: created.id, patient_id, title, story, created_at: created.created_at } });
});

// Patient endpoints
app.get("/api/patients", (_req, res) => {
  res.json({ patients: getPatients() });
});

app.get("/api/patients/:id", (req, res) => {
  const patient = getPatient(req.params.id);
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json({ patient });
});

app.post("/api/patients", (req, res) => {
  const { id, name, phone_number } = req.body || {};
  if (!id || !name) {
    res.status(400).json({ error: "id and name are required" });
    return;
  }
  const created = createPatient({ id, name, phone_number });
  res.json({ patient: { id, name, phone_number, created_at: created.created_at } });
});

// Family member endpoints
app.get("/api/family-members", (req, res) => {
  const { patient_id } = req.query;
  if (!patient_id) {
    res.status(400).json({ error: "patient_id required" });
    return;
  }
  res.json({ family_members: getFamilyMembers(patient_id) });
});

app.post("/api/family-members", (req, res) => {
  const { patient_id, name, relationship } = req.body || {};
  if (!patient_id || !name) {
    res.status(400).json({ error: "patient_id and name are required" });
    return;
  }
  const created = createFamilyMember({ patient_id, name, relationship });
  res.json({ family_member: { id: created.id, patient_id, name, relationship, created_at: created.created_at } });
});

// Manual call trigger
app.post("/api/calls/trigger", async (req, res) => {
  const { patient_id, anchor_id, reason } = req.body || {};

  if (!patient_id) {
    res.status(400).json({ error: "patient_id required" });
    return;
  }

  const patient = getPatient(patient_id);
  if (!patient || !patient.phone_number) {
    res.status(400).json({ error: "Patient not found or missing phone number" });
    return;
  }

  // Get anchor
  let anchor;
  if (anchor_id) {
    const anchors = getAnchors();
    anchor = anchors.find(a => a.id === parseInt(anchor_id));
  } else {
    const anchors = getAnchors();
    anchor = anchors[0];
  }

  // Log incident
  const incident = logIncident({
    patient_id,
    reason: reason || "Manual test call",
    anchor_title: anchor?.title,
    gemini_reasoning: "Manual call triggered",
    confidence: 1.0,
    status: "queued",
    escalation_level: 2,
    call_tone: "warm_personal"
  });

  // Make call
  if (!retellApiKey || !retellFromNumber || !patient.phone_number || !retellAgentId) {
    console.log("[orchestrator] ℹ Retell not configured");
    setIncidentStatus({ id: incident.id, status: "stubbed", call_id: null });
    res.json({ incident, call_status: "stubbed" });
    return;
  }

  try {
    const callId = await triggerRetellCall({
      apiKey: retellApiKey,
      fromNumber: retellFromNumber,
      toNumber: patient.phone_number,
      agentId: retellAgentId,
      agentVersion: retellAgentVersion,
      dynamicVariables: {
        escalation_level: "2",
        memory_anchor_title: anchor?.title || "General comfort",
        memory_anchor_story: anchor?.story || "",
        call_tone: "warm_personal",
        family_member_name: "Family",
        patient_name: patient.name
      },
      metadata: { patient_id, reason: reason || "Manual test call" }
    });

    setIncidentStatus({ id: incident.id, status: "called", call_id: callId });
    res.json({ incident, call_status: "called", call_id: callId });
  } catch (err) {
    console.error("[orchestrator] Manual call failed:", err.message);
    setIncidentStatus({ id: incident.id, status: "error", call_error: err.message });
    res.json({ incident, call_status: "error", error: err.message });
  }
});

app.listen(apiPort, () => {
  console.log(`[orchestrator] API listening on http://localhost:${apiPort}`);
});

const clientId = `guardianvoice-orchestrator-${Math.random().toString(16).slice(2)}`;
const client = mqtt.connect(brokerUrl, { clientId, reconnectPeriod: 2000 });

client.on("connect", () => {
  metrics.mqttConnected = true;
  console.log(`[orchestrator] ✓ connected to ${brokerUrl}`);
  client.subscribe("interventions/request", { qos: 0 }, (err) => {
    if (err) {
      console.error("[orchestrator] subscribe error", err);
      metrics.errors++;
      metrics.lastError = err.message;
    }
  });
});

client.on("disconnect", () => {
  metrics.mqttConnected = false;
  console.warn("[orchestrator] ⚠ disconnected from MQTT broker");
});

client.on("reconnect", () => {
  console.log("[orchestrator] → reconnecting to MQTT...");
});

client.on("error", (err) => {
  metrics.mqttConnected = false;
  metrics.errors++;
  metrics.lastError = err.message;
  console.error("[orchestrator] MQTT error:", err.message);
});

client.on("message", async (_topic, payload) => {
  const startTime = Date.now();
  metrics.interventions++;

  try {
    const event = JSON.parse(payload.toString());

    console.log(`[orchestrator] 🚨 intervention for ${event.patient_id}`);

    // Use Gemini to decide which memory anchor to use
    let decision;
    try {
      decision = await planIntervention({
        patient_id: event.patient_id,
        vitals: event.vitals || { hr: event.hr || 0 },
        reason: event.reason || "VITALS_TRIGGER"
      });
    } catch (geminiErr) {
      console.error("[orchestrator] ⚠ Gemini decision failed, using fallback:", geminiErr.message);
      metrics.errors++;
      decision = {
        action: "CALL_PATIENT",
        anchor_title: "Remember the blue Jeep?",
        reasoning: "Gemini error - using fallback: " + geminiErr.message,
        confidence: 0.5,
        latency: Date.now() - startTime
      };
    }

    console.log(`[orchestrator] 📊 GEMINI DECISION:`);
    console.log(`   ├─ Escalation Level: ${decision.escalation_level}`);
    console.log(`   ├─ Memory Anchor: ${decision.anchor_title}`);
    console.log(`   ├─ Call Tone: ${decision.call_tone}`);
    console.log(`   ├─ Confidence: ${(decision.confidence * 100).toFixed(0)}%`);
    console.log(`   └─ Reasoning: ${decision.reasoning.substring(0, 100)}...`);

    const incident = logIncident({
      patient_id: event.patient_id,
      reason: event.reason || "VITALS_TRIGGER",
      anchor_title: decision.anchor_title,
      gemini_reasoning: decision.reasoning,
      confidence: decision.confidence,
      status: "queued",
      escalation_level: decision.escalation_level,
      call_tone: decision.call_tone
    });

    const totalLatency = Date.now() - startTime;
    if (totalLatency > 1000) {
      console.warn(`[orchestrator] ⚠ latency exceeded 1000ms: ${totalLatency}ms`);
    } else {
      console.log(`[orchestrator] ✓ latency: ${totalLatency}ms, confidence: ${(decision.confidence * 100).toFixed(0)}%, escalation: ${decision.escalation_level}`);
    }

    // Only trigger call for escalation level 2+ (not for mild agitation)
    if (decision.escalation_level < 2) {
      console.log(`[orchestrator] ℹ Escalation level ${decision.escalation_level} - monitoring only, no call`);
      setIncidentStatus({ id: incident.id, status: "monitored", call_id: null });
      return;
    }

    if (!retellApiKey || !retellFromNumber || !retellToNumber || !retellAgentId) {
      console.log("[orchestrator] ℹ Retell not configured; stubbed call only.");
      setIncidentStatus({ id: incident.id, status: "stubbed", call_id: null });
      return;
    }

    try {
      // Fetch full memory story from database
      const anchorId = decision.anchor_id;
      let memoryStory = "";
      if (anchorId) {
        const anchors = getAnchors();
        const anchor = anchors.find(a => a.id === anchorId);
        if (anchor) {
          memoryStory = anchor.story;
        }
      }

      console.log(`[orchestrator] 📞 RETELL CALL SETUP:`);
      console.log(`   ├─ Memory Title: ${decision.anchor_title}`);
      console.log(`   ├─ Story Length: ${memoryStory.length} characters`);
      console.log(`   ├─ Escalation: Level ${decision.escalation_level}`);
      console.log(`   ├─ Tone: ${decision.call_tone}`);
      console.log(`   ├─ From: ${retellFromNumber}`);
      console.log(`   ├─ To: ${retellToNumber}`);
      if (memoryStory) {
        console.log(`   └─ Memory Story Preview: "${memoryStory.substring(0, 80)}..."`);
      }

      const dynamicVariables = {
        escalation_level: String(decision.escalation_level),
        memory_anchor_title: decision.anchor_title,
        memory_anchor_story: memoryStory,
        call_tone: decision.call_tone,
        family_member_name: "Family",
        patient_name: "Patient"
      };

      console.log(`[orchestrator] 📤 DYNAMIC VARIABLES SENT TO RETELL:`);
      console.log(`   ├─ escalation_level: "${dynamicVariables.escalation_level}"`);
      console.log(`   ├─ memory_anchor_title: "${dynamicVariables.memory_anchor_title}"`);
      console.log(`   ├─ memory_anchor_story: ${dynamicVariables.memory_anchor_story.length} chars`);
      console.log(`   ├─ call_tone: "${dynamicVariables.call_tone}"`);
      console.log(`   ├─ family_member_name: "${dynamicVariables.family_member_name}"`);
      console.log(`   └─ patient_name: "${dynamicVariables.patient_name}"`);

      const callId = await triggerRetellCall({
        apiKey: retellApiKey,
        fromNumber: retellFromNumber,
        toNumber: retellToNumber,
        agentId: retellAgentId,
        agentVersion: retellAgentVersion,
        dynamicVariables,
        metadata: {
          patient_id: event.patient_id,
          reason: event.reason,
          escalation_level: decision.escalation_level
        }
      });

      setIncidentStatus({ id: incident.id, status: "called", call_id: callId });
    } catch (retellErr) {
      console.error("[orchestrator] Retell call failed:", retellErr.message);
      metrics.errors++;
      metrics.lastError = retellErr.message;
      setIncidentStatus({ id: incident.id, status: "error", call_id: null, call_error: retellErr.message });
    }
  } catch (err) {
    metrics.errors++;
    metrics.lastError = err.message;
    console.error("[orchestrator] parse error", err.message);
  }
});

async function triggerRetellCall({
  apiKey,
  fromNumber,
  toNumber,
  agentId,
  agentVersion,
  dynamicVariables,
  metadata
}) {
  const requestBody = {
    from_number: fromNumber,
    to_number: toNumber,
    agent_id: agentId,
    retell_llm_dynamic_variables: dynamicVariables,
    metadata
  };

  // Only include agent_version if provided
  if (agentVersion) {
    requestBody.agent_version = agentVersion;
  }

  const res = await fetch("https://api.retellai.com/v2/create-phone-call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Retell error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  console.log(`[retell] ✓ Call initiated: ${data.call_id}`);
  return data.call_id;
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n[orchestrator] 🛑 Received SIGTERM, shutting down gracefully...");
  client.end();
  setTimeout(() => {
    console.log("[orchestrator] ✓ Shutdown complete");
    process.exit(0);
  }, 1000);
});

process.on("SIGINT", () => {
  console.log("\n[orchestrator] 🛑 Received SIGINT, shutting down gracefully...");
  client.end();
  setTimeout(() => {
    console.log("[orchestrator] ✓ Shutdown complete");
    process.exit(0);
  }, 1000);
});
