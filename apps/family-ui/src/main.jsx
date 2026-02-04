import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>GuardianVoice</div>
          <h1 style={styles.title}>Anchor Vault</h1>
          <p style={styles.subtitle}>Help us create a familiar voice that feels like home.</p>
        </div>
        <button style={styles.primary}>Start Onboarding</button>
      </header>

      <section style={styles.cards}>
        {steps.map((step) => (
          <div key={step.title} style={styles.card}>
            <div style={styles.stepTag}>{step.tag}</div>
            <div style={styles.cardTitle}>{step.title}</div>
            <div style={styles.cardBody}>{step.body}</div>
          </div>
        ))}
      </section>

      <section style={styles.panel}>
        <div style={styles.panelTitle}>Recent Interventions</div>
        <div style={styles.panelBody}>
          <div style={styles.logItem}>Jan 18, 4:12pm — “Blue Jeep” anchor used</div>
          <div style={styles.logItem}>Jan 18, 9:36pm — “Garden Walk” anchor used</div>
          <div style={styles.logItem}>Jan 19, 7:04am — “Wedding Photo” anchor used</div>
        </div>
      </section>
    </div>
  );
}

const steps = [
  {
    tag: "Welcome",
    title: "A gentle hello",
    body: "We’ll walk you through how your voice helps create calm, with privacy first."
  },
  {
    tag: "Record",
    title: "Share a few memories",
    body: "Record short, natural clips in a quiet space. We guide you in real time."
  },
  {
    tag: "Preview",
    title: "Listen and confirm",
    body: "Hear how the voice sounds and add extra samples if you want."
  }
];

const styles = {
  page: {
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    padding: 32,
    background: "radial-gradient(circle at top, #fff3e0 0%, #f8f4ff 50%, #f1f5f9 100%)",
    minHeight: "100vh",
    color: "#1f2937"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap"
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    color: "#6b7280"
  },
  title: {
    fontSize: 36,
    margin: "6px 0"
  },
  subtitle: {
    maxWidth: 420,
    fontSize: 16,
    color: "#4b5563"
  },
  primary: {
    background: "#8d5a3b",
    color: "#fff7ed",
    padding: "12px 18px",
    border: "none",
    borderRadius: 999,
    fontSize: 14
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
    marginTop: 24
  },
  card: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 12px 30px rgba(30, 41, 59, 0.08)"
  },
  stepTag: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#8d5a3b"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: "6px 0"
  },
  cardBody: {
    fontSize: 14,
    color: "#4b5563"
  },
  panel: {
    marginTop: 24,
    background: "#fff",
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
    gap: 10
  },
  logItem: {
    background: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    fontSize: 14
  }
};

createRoot(document.getElementById("root")).render(<App />);
