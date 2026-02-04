import "dotenv/config";
import mqtt from "mqtt";
import { VITALS_TOPIC, isHighRiskVitals, normalizeVitals } from "@guardianvoice/shared";

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const clientId = `guardianvoice-ingestor-${Math.random().toString(16).slice(2)}`;

const client = mqtt.connect(brokerUrl, {
  clientId,
  reconnectPeriod: 2000
});

client.on("connect", () => {
  console.log(`[ingestor] connected to ${brokerUrl}`);
  client.subscribe(VITALS_TOPIC, { qos: 0 }, (err) => {
    if (err) console.error("[ingestor] subscribe error", err);
  });
});

client.on("message", (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    const vitals = normalizeVitals(data);
    const highRisk = isHighRiskVitals(vitals);

    console.log(`[ingestor] ${vitals.patient_id} hr=${vitals.hr} accel=${vitals.accel_delta} risk=${highRisk}`);

    if (highRisk) {
      const outbound = JSON.stringify({
        patient_id: vitals.patient_id,
        vitals,
        reason: "VITALS_TRIGGER",
        ts: Date.now()
      });

      client.publish("interventions/request", outbound, { qos: 0 });
    }
  } catch (err) {
    console.error("[ingestor] parse error", err);
  }
});

client.on("reconnect", () => console.log("[ingestor] reconnecting..."));
client.on("error", (err) => console.error("[ingestor] mqtt error", err));
