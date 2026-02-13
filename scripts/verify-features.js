#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const net = require("net");

const args = process.argv.slice(2);
const baseUrlArgIndex = args.indexOf("--base-url");
const baseUrl = baseUrlArgIndex !== -1 && args[baseUrlArgIndex + 1]
  ? args[baseUrlArgIndex + 1]
  : "http://localhost:4001";

const results = [];
const totalTests = 12;

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, cancel: () => clearTimeout(id) };
}

async function fetchJson(url, options = {}) {
  const { controller, cancel } = withTimeout(5000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (err) {
      json = null;
    }
    return { res, json, text };
  } finally {
    cancel();
  }
}

function recordResult(index, feature, status, details) {
  results.push({ index, feature, status, details });
  console.log(`[${index}/${totalTests}] ${feature}... ${status} ${details ? "- " + details : ""}`);
}

function buildVerificationReport() {
  const now = new Date().toISOString();
  const passed = results.filter((r) => r.status === "✅ PASS").length;
  const failed = results.filter((r) => r.status === "❌ FAIL").length;
  const skipped = results.filter((r) => r.status.startsWith("⚠️ SKIP")).length;
  const ready = failed === 0 ? "YES" : "NO";

  const lines = [];
  lines.push("# GuardianVoice AI — Feature Verification Report\n");
  lines.push(`**Generated:** ${now}`);
  lines.push(`**Base URL:** ${baseUrl}`);
  lines.push(`**Node Version:** ${process.version}\n`);
  lines.push("## Results\n");
  lines.push("| # | Feature | Status | Details |");
  lines.push("|---|---------|--------|---------|");

  for (const r of results) {
    lines.push(`| ${r.index} | ${r.feature} | ${r.status} | ${r.details || ""} |`);
  }

  lines.push("\n## Summary\n");
  lines.push(`- **Total:** ${totalTests}`);
  lines.push(`- **Passed:** ${passed}`);
  lines.push(`- **Failed:** ${failed}`);
  lines.push(`- **Skipped:** ${skipped}\n`);
  lines.push(`## System Ready: ${ready}`);

  return lines.join("\n");
}

async function run() {
  // Test 1: Health Endpoint
  try {
    const { res, json } = await fetchJson(`${baseUrl}/api/health`);
    if (res.ok && json && Object.prototype.hasOwnProperty.call(json, "ok")) {
      recordResult(1, "Health Endpoint", "✅ PASS", `${res.status} OK, ok: ${json.ok}`);
    } else {
      recordResult(1, "Health Endpoint", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(1, "Health Endpoint", "❌ FAIL", err.message);
  }

  // Test 2: List Incidents
  let cachedIncidents = null;
  try {
    const { res, json } = await fetchJson(`${baseUrl}/api/incidents`);
    if (res.ok && json && Array.isArray(json.incidents)) {
      cachedIncidents = json.incidents;
      recordResult(2, "List Incidents", "✅ PASS", `${res.status} OK, ${json.incidents.length} incidents`);
    } else {
      recordResult(2, "List Incidents", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(2, "List Incidents", "❌ FAIL", err.message);
  }

  // Test 3: List Anchors
  try {
    const { res, json } = await fetchJson(`${baseUrl}/api/anchors`);
    if (res.ok && json && Array.isArray(json.anchors)) {
      recordResult(3, "List Anchors", "✅ PASS", `${res.status} OK, ${json.anchors.length} anchors`);
    } else {
      recordResult(3, "List Anchors", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(3, "List Anchors", "❌ FAIL", err.message);
  }

  // Test 4: Create Anchor
  try {
    const { res, json } = await fetchJson(`${baseUrl}/api/anchors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: "TEST001",
        title: "Test Memory",
        story: "This is a test memory anchor for verification."
      })
    });
    if (res.ok && json && json.anchor && json.anchor.id) {
      recordResult(4, "Create Anchor", "✅ PASS", `Created anchor id ${json.anchor.id}`);
    } else {
      recordResult(4, "Create Anchor", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(4, "Create Anchor", "❌ FAIL", err.message);
  }

  // Test 5: Incidents Have Escalation Data
  try {
    const incidents = cachedIncidents ?? [];
    if (incidents.length === 0) {
      recordResult(5, "Incidents Have Escalation Data", "⚠️ SKIP", "No incidents in database to verify");
    } else {
      const match = incidents.find(
        (i) => typeof i.escalation_level === "number" && typeof i.call_tone === "string"
      );
      if (match) {
        recordResult(5, "Incidents Have Escalation Data", "✅ PASS", "Escalation level + call_tone present");
      } else {
        recordResult(5, "Incidents Have Escalation Data", "❌ FAIL", "No incidents with escalation data");
      }
    }
  } catch (err) {
    recordResult(5, "Incidents Have Escalation Data", "❌ FAIL", err.message);
  }

  // Test 6: Incidents Have Call Status
  try {
    const incidents = cachedIncidents ?? [];
    const valid = new Set(["called", "error", "monitored", "queued", "stubbed", "pending"]);
    if (incidents.length === 0) {
      recordResult(6, "Incidents Have Call Status", "⚠️ SKIP", "No incidents in database to verify");
    } else {
      const match = incidents.find((i) => valid.has(i.status));
      if (match) {
        recordResult(6, "Incidents Have Call Status", "✅ PASS", "Status present" );
      } else {
        recordResult(6, "Incidents Have Call Status", "❌ FAIL", "No incident has recognized status" );
      }
    }
  } catch (err) {
    recordResult(6, "Incidents Have Call Status", "❌ FAIL", err.message);
  }

  // Test 7: Demo Call Endpoint Exists
  try {
    const { res } = await fetchJson(`${baseUrl}/api/demo-call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: "+0000000000" })
    });
    if (res.status === 404) {
      recordResult(7, "Demo Call Endpoint Exists", "❌ FAIL", "404 Not Found" );
    } else {
      recordResult(7, "Demo Call Endpoint Exists", "✅ PASS", `Status ${res.status}` );
    }
  } catch (err) {
    recordResult(7, "Demo Call Endpoint Exists", "❌ FAIL", err.message);
  }

  // Test 8: Demo Call Validates Phone Format
  try {
    const { res, json } = await fetchJson(`${baseUrl}/api/demo-call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: "invalid" })
    });
    const errorText = json && json.error ? String(json.error) : "";
    if (res.status === 400 && errorText.toLowerCase().includes("country code")) {
      recordResult(8, "Demo Call Validates Phone Format", "✅ PASS", errorText);
    } else {
      recordResult(8, "Demo Call Validates Phone Format", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(8, "Demo Call Validates Phone Format", "❌ FAIL", err.message);
  }

  // Test 9: Patients Endpoint
  try {
    const { res, json } = await fetchJson(`${baseUrl}/api/patients`);
    if (res.ok && json && Array.isArray(json.patients)) {
      recordResult(9, "Patients Endpoint", "✅ PASS", `${res.status} OK, ${json.patients.length} patients`);
    } else {
      recordResult(9, "Patients Endpoint", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(9, "Patients Endpoint", "❌ FAIL", err.message);
  }

  // Test 10: Admin UI Accessible
  try {
    const adminUrl = baseUrl.replace(/:\d+$/, ":5173");
    const { res, text } = await fetchJson(adminUrl);
    if (res.ok && text && text.includes("GuardianVoice")) {
      recordResult(10, "Admin UI Accessible", "✅ PASS", `${res.status} OK`);
    } else {
      recordResult(10, "Admin UI Accessible", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(10, "Admin UI Accessible", "❌ FAIL", "Admin UI not running on port 5173");
  }

  // Test 11: Family UI Accessible
  try {
    const familyUrl = baseUrl.replace(/:\d+$/, ":5174");
    const { res, text } = await fetchJson(familyUrl);
    if (res.ok && text && (text.includes("GuardianVoice") || text.includes("Anchor"))) {
      recordResult(11, "Family UI Accessible", "✅ PASS", `${res.status} OK`);
    } else {
      recordResult(11, "Family UI Accessible", "❌ FAIL", `Status ${res.status}`);
    }
  } catch (err) {
    recordResult(11, "Family UI Accessible", "❌ FAIL", "Family UI not running on port 5174");
  }

  // Test 12: MQTT Broker Running
  await new Promise((resolve) => {
    const socket = net.createConnection(1883, "localhost");
    const timer = setTimeout(() => {
      socket.destroy();
      recordResult(12, "MQTT Broker Running", "❌ FAIL", "Connection timeout");
      resolve();
    }, 3000);

    socket.on("connect", () => {
      clearTimeout(timer);
      socket.end();
      recordResult(12, "MQTT Broker Running", "✅ PASS", "Connected to port 1883");
      resolve();
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      recordResult(12, "MQTT Broker Running", "❌ FAIL", err.message);
      resolve();
    });
  });

  const report = buildVerificationReport();
  const outputPath = path.join(process.cwd(), "VERIFICATION.md");
  fs.writeFileSync(outputPath, report, "utf8");

  const failed = results.some((r) => r.status === "❌ FAIL");
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  recordResult(results.length + 1, "Verifier", "❌ FAIL", err.message);
  const report = buildVerificationReport();
  const outputPath = path.join(process.cwd(), "VERIFICATION.md");
  fs.writeFileSync(outputPath, report, "utf8");
  process.exit(1);
});
