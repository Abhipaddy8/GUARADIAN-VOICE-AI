import "dotenv/config";
import mqtt from "mqtt";
import { VITALS_TOPIC, isHighRiskVitals, normalizeVitals } from "@guardianvoice/shared";

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const clientId = `guardianvoice-ingestor-${Math.random().toString(16).slice(2)}`;

const metrics = {
  vitalsReceived: 0,
  interventionsTriggered: 0,
  errors: 0,
  mqttConnected: false,
  startTime: Date.now()
};

const client = mqtt.connect(brokerUrl, {
  clientId,
  reconnectPeriod: 2000
});

client.on("connect", () => {
  metrics.mqttConnected = true;
  console.log(`[ingestor] ✓ connected to ${brokerUrl}`);
  client.subscribe(VITALS_TOPIC, { qos: 0 }, (err) => {
    if (err) {
      console.error("[ingestor] subscribe error", err);
      metrics.errors++;
    }
  });
});

client.on("disconnect", () => {
  metrics.mqttConnected = false;
  console.warn("[ingestor] ⚠ disconnected from MQTT broker");
});

client.on("message", (topic, payload) => {
  metrics.vitalsReceived++;

  try {
    const data = JSON.parse(payload.toString());
    const vitals = normalizeVitals(data);
    const highRisk = isHighRiskVitals(vitals);

    if (highRisk) {
      metrics.interventionsTriggered++;
      console.log(`[ingestor] 🚨 ${vitals.patient_id} hr=${vitals.hr} accel=${vitals.accel_delta.toFixed(1)} RISK`);

      const outbound = JSON.stringify({
        patient_id: vitals.patient_id,
        vitals,
        reason: "VITALS_TRIGGER",
        ts: Date.now()
      });

      client.publish("interventions/request", outbound, { qos: 0 });
    } else {
      console.log(`[ingestor] ${vitals.patient_id} hr=${vitals.hr} accel=${vitals.accel_delta.toFixed(1)}`);
    }
  } catch (err) {
    metrics.errors++;
    console.error("[ingestor] parse error", err.message);
  }
});

client.on("reconnect", () => {
  console.log("[ingestor] → reconnecting to MQTT...");
});

client.on("error", (err) => {
  metrics.mqttConnected = false;
  metrics.errors++;
  console.error("[ingestor] MQTT error:", err.message);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n[ingestor] 🛑 Received SIGTERM, shutting down gracefully...");
  console.log(`[ingestor] Stats - Vitals: ${metrics.vitalsReceived}, Interventions: ${metrics.interventionsTriggered}, Errors: ${metrics.errors}`);
  client.end();
  setTimeout(() => {
    console.log("[ingestor] ✓ Shutdown complete");
    process.exit(0);
  }, 1000);
});

process.on("SIGINT", () => {
  console.log("\n[ingestor] 🛑 Received SIGINT, shutting down gracefully...");
  console.log(`[ingestor] Stats - Vitals: ${metrics.vitalsReceived}, Interventions: ${metrics.interventionsTriggered}, Errors: ${metrics.errors}`);
  client.end();
  setTimeout(() => {
    console.log("[ingestor] ✓ Shutdown complete");
    process.exit(0);
  }, 1000);
});
