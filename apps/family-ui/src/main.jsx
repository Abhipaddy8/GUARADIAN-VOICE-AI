import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [patientId, setPatientId] = useState("P001");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [anchors, setAnchors] = useState([]);
  const [status, setStatus] = useState("");

  async function loadAnchors() {
    try {
      const res = await fetch("/api/anchors");
      const data = await res.json();
      setAnchors(data.anchors || []);
    } catch (err) {
      console.error("Failed to load anchors", err);
    }
  }

  useEffect(() => {
    loadAnchors();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");

    if (!title || !story) {
      setStatus("Please add a title and a memory story.");
      return;
    }

    try {
      const res = await fetch("/api/anchors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, title, story })
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus(err.error || "Upload failed.");
        return;
      }

      setTitle("");
      setStory("");
      setStatus("Anchor saved.");
      loadAnchors();
    } catch (err) {
      console.error("Failed to save anchor", err);
      setStatus("Upload failed.");
    }
  }

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
        <div style={styles.panelTitle}>Add a Memory Anchor</div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Patient ID
            <input
              style={styles.input}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </label>
          <label style={styles.label}>
            Anchor Title
            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blue Jeep"
            />
          </label>
          <label style={styles.label}>
            Memory Story
            <textarea
              style={styles.textarea}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell us the memory in a few sentences"
              rows={4}
            />
          </label>
          <button style={styles.secondary} type="submit">Save Anchor</button>
          {status && <div style={styles.status}>{status}</div>}
        </form>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelTitle}>Recent Anchors</div>
        <div style={styles.panelBody}>
          {anchors.length === 0 ? (
            <div style={styles.empty}>No anchors yet.</div>
          ) : (
            anchors.map((anchor) => (
              <div key={anchor.id} style={styles.logItem}>
                <div style={styles.logLine}><strong>{anchor.title}</strong> • {anchor.patient_id}</div>
                <div style={styles.logMeta}>{anchor.story}</div>
              </div>
            ))
          )}
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
  },
  logLine: {
    fontSize: 14,
    marginBottom: 4
  },
  logMeta: {
    color: "#6b7280",
    fontSize: 12
  },
  form: {
    display: "grid",
    gap: 12
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 14,
    color: "#4b5563"
  },
  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 14
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 14
  },
  secondary: {
    background: "#1f2937",
    color: "#f9fafb",
    padding: "10px 16px",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    justifySelf: "start"
  },
  status: {
    fontSize: 13,
    color: "#4b5563"
  },
  empty: {
    color: "#6b7280",
    fontSize: 14
  }
};

createRoot(document.getElementById("root")).render(<App />);
