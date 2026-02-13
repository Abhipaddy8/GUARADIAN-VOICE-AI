import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCuoozAe_FNJ3z5GBYT2sgIhqx4JfRI3s8';

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

console.log('🔍 Checking available Gemini models...\n');

// Try common model names
const modelsToTry = [
  'gemini-pro',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'text-bison-001',
  'gemini-pro-vision'
];

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Test');
    console.log(`✅ ${modelName} - AVAILABLE`);
    return true;
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('404') || msg.includes('not found')) {
      console.log(`❌ ${modelName} - Not found`);
    } else if (msg.includes('permission') || msg.includes('not enabled')) {
      console.log(`⚠️  ${modelName} - Not enabled for your API key`);
    } else {
      console.log(`❓ ${modelName} - Error: ${error.message.substring(0, 60)}...`);
    }
    return false;
  }
}

(async () => {
  for (const model of modelsToTry) {
    await testModel(model);
  }

  console.log('\n📝 RECOMMENDATIONS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n1. If all models show "not found":');
  console.log('   → Your API key may not have the right permissions');
  console.log('   → Enable the Generative Language API in Google Cloud Console');
  console.log('   → Make sure your API key has access to Generative AI API');

  console.log('\n2. If one model works:');
  console.log('   → Update .env with that model name');
  console.log('   → Restart orchestrator: npm run dev:orchestrator');

  console.log('\n3. Current configuration (.env):');
  console.log('   GEMINI_API_KEY=AIzaSyCuoozAe_FNJ3z5GBYT2sgIhqx4JfRI3s8');
  console.log('   GEMINI_MODEL=gemini-pro (change this if it\'s not available)');

  console.log('\n4. System still works with fallback:');
  console.log('   → Uses first available memory anchor');
  console.log('   → Confidence score shows 30% (indicating fallback)');
  console.log('   → Logs error in database for debugging');

  process.exit(0);
})();
