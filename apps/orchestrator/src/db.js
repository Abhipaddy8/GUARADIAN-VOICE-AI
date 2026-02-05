import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "guardianvoice.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Basic schema for hackathon demo
// Keep it simple and explicit for portability.
db.exec(`
  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    anchor_title TEXT,
    status TEXT NOT NULL,
    call_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS anchors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

const insertIncident = db.prepare(
  "INSERT INTO incidents (patient_id, reason, anchor_title, status, call_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
);
const updateIncident = db.prepare(
  "UPDATE incidents SET status = ?, call_id = ? WHERE id = ?"
);
const listIncidents = db.prepare(
  "SELECT id, patient_id, reason, anchor_title, status, call_id, created_at FROM incidents ORDER BY created_at DESC LIMIT 50"
);

const insertAnchor = db.prepare(
  "INSERT INTO anchors (patient_id, title, story, created_at) VALUES (?, ?, ?, ?)"
);
const listAnchors = db.prepare(
  "SELECT id, patient_id, title, story, created_at FROM anchors ORDER BY created_at DESC LIMIT 50"
);

export function logIncident({ patient_id, reason, anchor_title, status, call_id }) {
  const created_at = Date.now();
  const info = insertIncident.run(patient_id, reason, anchor_title ?? null, status, call_id ?? null, created_at);
  return { id: info.lastInsertRowid, created_at };
}

export function setIncidentStatus({ id, status, call_id }) {
  updateIncident.run(status, call_id ?? null, id);
}

export function getIncidents() {
  return listIncidents.all();
}

export function createAnchor({ patient_id, title, story }) {
  const created_at = Date.now();
  const info = insertAnchor.run(patient_id, title, story, created_at);
  return { id: info.lastInsertRowid, created_at };
}

export function getAnchors() {
  return listAnchors.all();
}
