import mqtt from 'mqtt';

const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

let hr = 75;
let phase = 'normal'; // normal → rising → crisis → calming → recovery

client.on('connect', () => {
  console.log(`[vitals-simulator] Connected to ${brokerUrl}`);
  console.log('[vitals-simulator] Publishing realistic vitals patterns...');

  // Start publishing vitals every 2 seconds
  startVitalsStream();
});

client.on('error', (err) => {
  console.error('[vitals-simulator] MQTT error:', err);
});

function startVitalsStream() {
  setInterval(() => {
    // Simulate different phases
    if (phase === 'normal') {
      hr = 75 + Math.random() * 8;
      if (Math.random() < 0.08) {
        phase = 'rising';
        console.log('[vitals-simulator] → RISING PHASE (agitation starting)');
      }
    } else if (phase === 'rising') {
      hr += 3 + Math.random() * 2;
      if (hr > 105) {
        phase = 'crisis';
        console.log('[vitals-simulator] → CRISIS PHASE (high agitation)');
      }
    } else if (phase === 'crisis') {
      hr = 110 + Math.random() * 15;
      if (Math.random() < 0.15) {
        phase = 'calming';
        console.log('[vitals-simulator] → CALMING PHASE (intervention working)');
      }
    } else if (phase === 'calming') {
      hr -= 4 + Math.random() * 2;
      if (hr < 85) {
        phase = 'recovery';
        console.log('[vitals-simulator] → RECOVERY PHASE (patient stabilized)');
      }
    } else if (phase === 'recovery') {
      hr = 75 + Math.random() * 8;
      if (Math.random() < 0.05) {
        phase = 'normal';
        console.log('[vitals-simulator] → NORMAL PHASE (back to baseline)');
      }
    }

    const vitals = {
      patient_id: 'P001',
      hr: Math.round(hr),
      accel_delta: Math.random() * (phase === 'crisis' ? 50 : 30),
      ts: Date.now()
    };

    client.publish('vitals/stream', JSON.stringify(vitals));
    console.log(`[vitals-simulator] HR=${vitals.hr} | accel=${vitals.accel_delta.toFixed(1)} | phase=${phase}`);
  }, 2000);
}

process.on('SIGINT', () => {
  console.log('\n[vitals-simulator] Shutting down...');
  client.end();
  process.exit(0);
});
