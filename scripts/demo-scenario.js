import mqtt from 'mqtt';

const brokerUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log(`[demo-scenario] Connected to ${brokerUrl}`);
  console.log('[demo-scenario] Starting automated demo sequence...\n');

  runDemoScenario();
});

client.on('error', (err) => {
  console.error('[demo-scenario] MQTT error:', err);
});

async function runDemoScenario() {
  const scenarios = [
    {
      name: '📊 PHASE 1: Normal Baseline',
      duration: 8,
      message: 'Patient is calm and stable',
      vitals: { patient_id: 'P001', hr: 78, accel_delta: 5 }
    },
    {
      name: '⚠️ PHASE 2: Early Agitation',
      duration: 10,
      message: 'Heart rate starting to rise...',
      vitals: { patient_id: 'P001', hr: 92, accel_delta: 15 }
    },
    {
      name: '🔴 PHASE 3: CRISIS - High Agitation',
      duration: 8,
      message: '⚡ INTERVENTION TRIGGERED! Gemini selecting best memory anchor...',
      vitals: { patient_id: 'P001', hr: 118, accel_delta: 42 }
    },
    {
      name: '💡 PHASE 4: De-escalation In Progress',
      duration: 6,
      message: 'Memory anchor being delivered via voice...',
      vitals: { patient_id: 'P001', hr: 108, accel_delta: 28 }
    },
    {
      name: '✅ PHASE 5: Successful Calming',
      duration: 10,
      message: 'Patient responding to familiar memory. Heart rate normalizing.',
      vitals: { patient_id: 'P001', hr: 88, accel_delta: 8 }
    },
    {
      name: '🏁 PHASE 6: Return to Baseline',
      duration: 6,
      message: 'Crisis resolved. Patient stable.',
      vitals: { patient_id: 'P001', hr: 76, accel_delta: 4 }
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n${scenario.name}`);
    console.log(`${scenario.message}`);
    console.log(`Duration: ${scenario.duration}s`);

    // Publish vitals every second for the duration
    for (let i = 0; i < scenario.duration; i++) {
      // Add slight variation to make it realistic
      const hr = scenario.vitals.hr + (Math.random() - 0.5) * 4;
      const accel = scenario.vitals.accel_delta + (Math.random() - 0.5) * 5;

      const vitals = {
        ...scenario.vitals,
        hr: Math.round(Math.max(0, hr)),
        accel_delta: Math.max(0, accel),
        ts: Date.now()
      };

      client.publish('vitals/stream', JSON.stringify(vitals));

      // Print progress indicator
      process.stdout.write('.');

      // Wait 1 second before next publish
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(' ✓');
    console.log('─'.repeat(50));

    // Pause between scenarios
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n🎉 Demo scenario complete!');
  console.log('Check the admin dashboard at http://localhost:5173 for the incident log.');
  console.log('\nShutting down...');

  setTimeout(() => {
    client.end();
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', () => {
  console.log('\n[demo-scenario] Demo interrupted');
  client.end();
  process.exit(0);
});
