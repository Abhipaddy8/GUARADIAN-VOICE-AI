import "dotenv/config";
import mqtt from "mqtt";
import fetch from "node-fetch";

const brokerUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || "";
const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID || "";

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

    if (!elevenLabsApiKey || !elevenLabsVoiceId) {
      console.log("[orchestrator] ElevenLabs not configured; stubbed call only.");
      return;
    }

    await triggerElevenLabsCall({
      voiceId: elevenLabsVoiceId,
      apiKey: elevenLabsApiKey,
      text: `Hi there. ${memoryAnchor} Let's talk about that.`
    });
  } catch (err) {
    console.error("[orchestrator] parse error", err);
  }
});

async function triggerElevenLabsCall({ voiceId, apiKey, text }) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.75
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs error: ${res.status} ${errText}`);
  }

  console.log("[orchestrator] ElevenLabs TTS request accepted");
}
