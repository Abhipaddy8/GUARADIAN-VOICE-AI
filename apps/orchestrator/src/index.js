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
  getAnchors
} from "./db.js";

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "orchestrator" });
});

app.get("/api/incidents", (_req, res) => {
  res.json({ incidents: getIncidents() });
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

app.listen(apiPort, () => {
  console.log(`[orchestrator] API listening on http://localhost:${apiPort}`);
});

const clientId = `guardianvoice-orchestrator-${Math.random().toString(16).slice(2)}`;
const client = mqtt.connect(brokerUrl, { clientId, reconnectPeriod: 2000 });

client.on("connect", () => {
  console.log(`[orchestrator] connected to ${brokerUrl}`);
  client.subscribe("interventions/request", { qos: 0 }, (err) => {
    if (err) console.error("[orchestrator] subscribe error", err);
  });
});

client.on("message", async (_topic, payload) => {
  try {
    const event = JSON.parse(payload.toString());
    const memoryAnchor = "Remember the blue Jeep?";

    console.log(`[orchestrator] intervention for ${event.patient_id}`);

    const incident = logIncident({
      patient_id: event.patient_id,
      reason: event.reason || "VITALS_TRIGGER",
      anchor_title: memoryAnchor,
      status: "queued"
    });

    if (!retellApiKey || !retellFromNumber || !retellToNumber || !retellAgentId) {
      console.log("[orchestrator] Retell not configured; stubbed call only.");
      setIncidentStatus({ id: incident.id, status: "stubbed", call_id: null });
      return;
    }

    const callId = await triggerRetellCall({
      apiKey: retellApiKey,
      fromNumber: retellFromNumber,
      toNumber: retellToNumber,
      agentId: retellAgentId,
      agentVersion: retellAgentVersion,
      dynamicVariables: {
        family_member: "Dad",
        memory_anchor: memoryAnchor
      },
      metadata: {
        patient_id: event.patient_id,
        reason: event.reason
      }
    });

    setIncidentStatus({ id: incident.id, status: "called", call_id: callId });
  } catch (err) {
    console.error("[orchestrator] parse error", err);
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
  const res = await fetch("https://api.retellai.com/v2/create-phone-call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from_number: fromNumber,
      to_number: toNumber,
      override_agent_id: agentId,
      override_agent_version: agentVersion,
      metadata,
      retell_llm_dynamic_variables: dynamicVariables
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Retell error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  console.log("[orchestrator] Retell call registered", data.call_id);
  return data.call_id;
}
