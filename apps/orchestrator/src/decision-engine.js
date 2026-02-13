import { analyzeIntervention } from './gemini.js';
import { getAnchors } from './db.js';

// Analyze escalation level based on vitals
function analyzeEscalation(vitals) {
  const hr = vitals.hr || 0;
  const accel = vitals.accel_delta || 0;

  if (hr > 130 || accel > 50) return 4; // Critical
  if (hr > 115 || accel > 35) return 3; // Severe
  if (hr > 100 || accel > 25) return 2; // Moderate
  return 1; // Mild
}

// Get call tone based on escalation level
function getCallTone(escalationLevel) {
  const tones = {
    1: 'gentle',
    2: 'warm_personal',
    3: 'urgent',
    4: 'emergency'
  };
  return tones[escalationLevel] || 'gentle';
}

export async function planIntervention({ patient_id, vitals, reason }) {
  // Fetch patient memory anchors from database
  const allAnchors = getAnchors();
  const anchors = allAnchors.filter(a => a.patient_id === patient_id);

  if (anchors.length === 0) {
    // Fallback if no anchors configured
    const escalationLevel = analyzeEscalation(vitals);
    const callTone = getCallTone(escalationLevel);
    console.log(`[decision-engine] No anchors for ${patient_id}, using fallback`);
    return {
      action: 'CALL_PATIENT',
      anchor_id: null,
      anchor_title: 'Generic Comfort',
      reasoning: 'No personalized memory anchors configured - using generic comfort approach',
      confidence: 0.5,
      latency: 0,
      escalation_level: escalationLevel,
      call_tone: callTone
    };
  }

  // Build context for Gemini
  const context = {
    current_vitals: vitals,
    trigger_reason: reason,
    available_anchors: anchors.map(a => ({
      id: a.id,
      title: a.title,
      story: a.story
    }))
  };

  try {
    // Analyze escalation level
    const escalationLevel = analyzeEscalation(vitals);
    const callTone = getCallTone(escalationLevel);

    // Get Gemini decision
    const decision = await analyzeIntervention(context);

    // Map selected index back to actual anchor if valid
    let selectedAnchor = null;
    if (decision.selected_anchor_id >= 0 && decision.selected_anchor_id < anchors.length) {
      selectedAnchor = anchors[decision.selected_anchor_id];
    }

    return {
      action: decision.action,
      anchor_id: selectedAnchor?.id || null,
      anchor_title: decision.selected_anchor_title,
      reasoning: decision.internal_reasoning,
      confidence: decision.confidence_score,
      latency: decision.latency,
      escalation_level: escalationLevel,
      call_tone: callTone
    };
  } catch (error) {
    const escalationLevel = analyzeEscalation(vitals);
    const callTone = getCallTone(escalationLevel);
    console.error(`[decision-engine] Gemini analysis failed, using fallback:`, error.message);

    // Fallback to first anchor on error
    const fallbackAnchor = anchors[0];
    return {
      action: 'CALL_PATIENT',
      anchor_id: fallbackAnchor.id,
      anchor_title: fallbackAnchor.title,
      reasoning: `Error analyzing with Gemini: ${error.message}. Using first available anchor as fallback.`,
      confidence: 0.3,
      latency: 0,
      escalation_level: escalationLevel,
      call_tone: callTone
    };
  }
}
