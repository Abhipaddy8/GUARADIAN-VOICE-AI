import fetch from 'node-fetch';

const API_URL = 'http://localhost:4001/api';

const demoAnchors = [
  {
    patient_id: 'P001',
    title: 'Blue Jeep Adventures',
    story: 'Remember when we drove the blue Jeep to the lake every summer? You taught me to fish there, and we\'d catch sunfish and throw them back. The sunset over the water was always so peaceful.'
  },
  {
    patient_id: 'P001',
    title: 'Sunday Garden',
    story: 'Mom loved working in the garden on Sunday mornings. She\'d spend hours tending to the roses and tomatoes. The whole yard would smell like fresh earth and flowers. You\'d always bring her lemonade.'
  },
  {
    patient_id: 'P001',
    title: 'First Grandchild',
    story: 'The day Emma was born, you held her so gently and sang that old lullaby your mother taught you. You were so careful, so full of wonder. You told me you\'d teach her everything about the world.'
  },
  {
    patient_id: 'P001',
    title: 'Kitchen Stories',
    story: 'Every holiday, you\'d stand at the stove telling stories while making your famous soup. The whole house would fill with that incredible smell. You\'d let me taste it and adjust the spices together.'
  },
  {
    patient_id: 'P001',
    title: 'Music and Dancing',
    story: 'You taught me to dance in the living room to those old jazz records. You\'d spin me around, humming along, totally caught up in the music. Those moments felt like they lasted forever.'
  }
];

async function seedData() {
  console.log('[seed-demo-data] Starting to populate demo memory anchors...\n');

  let success = 0;
  let failed = 0;

  for (const anchor of demoAnchors) {
    try {
      const response = await fetch(`${API_URL}/anchors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anchor)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`✓ Created: "${anchor.title}" (ID: ${data.anchor.id})`);
      success++;
    } catch (err) {
      console.error(`✗ Failed: "${anchor.title}" - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[seed-demo-data] Complete!`);
  console.log(`  ✓ Created: ${success} anchors`);
  console.log(`  ✗ Failed: ${failed} anchors`);

  if (success > 0) {
    console.log('\n✅ Demo data ready! Run:');
    console.log('   node scripts/demo-scenario.js');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Health check first
async function healthCheck() {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error('API not responding');
    return true;
  } catch (err) {
    console.error('[seed-demo-data] Error: Orchestrator API not running!');
    console.error('Start it with: npm run dev:orchestrator');
    process.exit(1);
  }
}

(async () => {
  await healthCheck();
  await seedData();
})();
