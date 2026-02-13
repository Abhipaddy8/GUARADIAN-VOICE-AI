import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Helper to format AI reasoning for display
function formatReasoning(text) {
  if (text.includes("Error analyzing with Gemini")) {
    return "🔄 Using fallback anchor selection (Gemini API unavailable)";
  }
  if (text.includes("No memory anchors configured")) {
    return "ℹ️ No custom anchors - using generic comfort approach";
  }
  return text.substring(0, 150) + (text.length > 150 ? "..." : "");
}

function App() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/incidents");
        const data = await res.json();
        if (!cancelled) setIncidents(data.incidents || []);
      } catch (err) {
        console.error("Failed to load incidents", err);
      }
    }

    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>GuardianVoice AI</div>
          <h1 style={styles.title}>Clinical Command Center</h1>
        </div>
        <div style={styles.badge}>Live</div>
      </header>

      <section style={styles.grid}>
        {patients.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <div style={styles.cardName}>{p.name}</div>
                <div style={styles.cardMeta}>{p.id}</div>
              </div>
              <div style={styles.cardStatus}>{p.status}</div>
            </div>
            <div style={styles.hrRow}>
              <span>Heart Rate</span>
              <strong>{p.hr} bpm</strong>
            </div>
            <div style={styles.thoughtBox}>
              Gemini: "Assessing memory anchor and de-escalation pathway..."
            </div>
          </div>
        ))}
      </section>

      <section style={styles.panel}>
        <div style={styles.panelTitle}>Crisis Monitor</div>
        <div style={styles.panelBody}>
          <div style={styles.stream}>Webots Stream Placeholder</div>
          <div style={styles.vitals}>Vitals 60s Rolling Window</div>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelTitle}>Incident Log</div>
        <div style={styles.panelBodyColumn}>
          {incidents.length === 0 ? (
            <div style={styles.empty}>No incidents yet.</div>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} style={styles.logItem}>
                <div style={styles.logLine}>
                  <strong>{incident.patient_id}</strong> • {incident.reason}
                </div>
                <div style={styles.logMeta}>
                  <strong>Anchor:</strong> {incident.anchor_title || "Anchor pending"}
                </div>
                {incident.gemini_reasoning && (
                  <div style={styles.logReasoning}>
                    <strong>AI Reasoning:</strong> {formatReasoning(incident.gemini_reasoning)}
                  </div>
                )}
                <div style={styles.logMeta}>
                  {incident.confidence && (
                    <>Confidence: {(incident.confidence * 100).toFixed(0)}% • </>
                  )}
                  Status: {incident.status}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

const patients = [
  { id: "P001", name: "Rose M.", status: "Calm", hr: 78 },
  { id: "P002", name: "James K.", status: "Agitated", hr: 112 },
  { id: "P003", name: "Evelyn T.", status: "Monitoring", hr: 94 }
];

const styles = {
  page: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: 32,
    background: "linear-gradient(135deg, #f6f4ef 0%, #e9eef5 100%)",
    minHeight: "100vh",
    color: "#1c1f24"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    color: "#6b7280"
  },
  title: {
    fontSize: 32,
    margin: "6px 0 0"
  },
  badge: {
    background: "#163b2f",
    color: "#fefae0",
    padding: "6px 14px",
    borderRadius: 999
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 12px 30px rgba(18, 24, 40, 0.08)"
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  cardName: {
    fontSize: 18,
    fontWeight: 600
  },
  cardMeta: {
    fontSize: 12,
    color: "#6b7280"
  },
  cardStatus: {
    fontSize: 12,
    background: "#edf2ff",
    padding: "4px 10px",
    borderRadius: 999
  },
  hrRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 14
  },
  thoughtBox: {
    marginTop: 12,
    background: "#f6f4ef",
    borderRadius: 12,
    padding: 12,
    fontSize: 13
  },
  panel: {
    marginTop: 24,
    background: "#ffffff",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 12px 30px rgba(18, 24, 40, 0.08)"
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12
  },
  panelBody: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 16
  },
  panelBodyColumn: {
    display: "grid",
    gap: 10
  },
  stream: {
    background: "#1c1f24",
    color: "#fefae0",
    minHeight: 180,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  vitals: {
    background: "#f6f4ef",
    minHeight: 180,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logItem: {
    background: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    fontSize: 14
  },
  logLine: {
    fontSize: 14,
    marginBottom: 4
  },
  logMeta: {
    color: "#6b7280",
    fontSize: 12
  },
  logReasoning: {
    marginTop: 8,
    padding: 8,
    background: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.4
  },
  empty: {
    color: "#6b7280",
    fontSize: 14
  }
};

createRoot(document.getElementById("root")).render(<App />);
