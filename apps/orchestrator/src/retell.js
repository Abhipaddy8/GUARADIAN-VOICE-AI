const fetch = require('node-fetch');

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_FROM_NUMBER = process.env.RETELL_FROM_NUMBER;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

async function makeCall(patientPhone, escalationData) {
  // escalationData = {
  //   escalation_level: 1-4,
  //   memory_anchor: "First Grandchild",
  //   call_tone: "warm_personal",
  //   family_member_name: "Sarah",
  //   patient_name: "Dad",
  //   selected_anchor_index: 0
  // }

  try {
    console.log(`[retell] Initiating call to ${patientPhone} with escalation level ${escalationData.escalation_level}`);

    // IMPORTANT: Retell requires all dynamic variables to be strings
    const dynamicVariables = {
      escalation_level: String(escalationData.escalation_level),
      memory_anchor: String(escalationData.memory_anchor || ''),
      call_tone: String(escalationData.call_tone || ''),
      family_member_name: String(escalationData.family_member_name || ''),
      patient_name: String(escalationData.patient_name || '')
    };

    const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_number: RETELL_FROM_NUMBER,
        to_number: patientPhone,
        agent_id: RETELL_AGENT_ID,
        retell_llm_dynamic_variables: dynamicVariables
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Retell API error: ${data.message || response.statusText}`);
    }

    console.log(`[retell] ✓ Call initiated: ${data.call_id}`);
    return {
      success: true,
      call_id: data.call_id,
      status: data.status
    };
  } catch (err) {
    console.error(`[retell] ✗ Call failed: ${err.message}`);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = { makeCall };
