import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try to use the configured model, with fallback options
const configuredModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const modelFallbacks = [
  configuredModel,
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro',
  'text-bison-001'
];

let model = null;
let activeModel = null;

function initializeModel() {
  if (model) return;

  // Use the configured model primarily
  try {
    model = genAI.getGenerativeModel({ model: configuredModel });
    activeModel = configuredModel;
    console.log(`[gemini] Using model: ${activeModel}`);
  } catch (err) {
    console.warn(`[gemini] Failed to initialize ${configuredModel}, using fallback`);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    activeModel = 'gemini-pro';
  }
}

export async function analyzeIntervention(context) {
  initializeModel();

  const { current_vitals, trigger_reason, available_anchors } = context;

  const anchorList = available_anchors.length > 0
    ? available_anchors.map((a, i) => `${i}. "${a.title}": ${a.story}`).join('\n')
    : 'No memory anchors available';

  const prompt = `You are an AI assistant helping to calm a dementia patient during an agitation episode using familiar memories.

CURRENT SITUATION:
- Heart Rate: ${current_vitals.hr} bpm
- Trigger: ${trigger_reason}

AVAILABLE MEMORY ANCHORS:
${anchorList}

TASK: Choose the best memory anchor to help calm this patient. Respond ONLY with valid JSON (no markdown, no code blocks) in this exact format:
{
  "selected_anchor_index": <number>,
  "selected_anchor_title": "<string>",
  "internal_reasoning": "<string explaining why this anchor is best>",
  "confidence_score": <number between 0 and 1>
}

If no anchors are available, use index -1 and suggest a generic comfort approach.`;

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const latency = Date.now() - startTime;

    console.log(`[gemini] analyzed intervention in ${latency}ms`);

    // Parse JSON from response (remove markdown if present)
    let jsonStr = text;
    if (text.includes('```json')) {
      jsonStr = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
      jsonStr = text.split('```')[1].split('```')[0];
    }

    const decision = JSON.parse(jsonStr.trim());
    return {
      action: 'CALL_PATIENT',
      selected_anchor_id: decision.selected_anchor_index,
      selected_anchor_title: decision.selected_anchor_title,
      internal_reasoning: decision.internal_reasoning,
      confidence_score: decision.confidence_score,
      latency
    };
  } catch (error) {
    console.error('[gemini] Analysis failed:', error.message);
    throw error;
  }
}
