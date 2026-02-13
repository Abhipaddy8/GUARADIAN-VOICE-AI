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
    gemini_reasoning TEXT,
    confidence REAL,
    status TEXT NOT NULL,
    call_id TEXT,
    escalation_level INTEGER,
    call_tone TEXT,
    call_error TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS anchors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT,
    onboarding_status TEXT DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT,
    voice_sample_url TEXT,
    retell_voice_id TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS voice_recordings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_member_id INTEGER NOT NULL,
    audio_path TEXT NOT NULL,
    duration_seconds REAL,
    upload_status TEXT DEFAULT 'uploaded',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (family_member_id) REFERENCES family_members(id)
  );
`);

const insertIncident = db.prepare(
  "INSERT INTO incidents (patient_id, reason, anchor_title, gemini_reasoning, confidence, status, call_id, escalation_level, call_tone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
const updateIncident = db.prepare(
  "UPDATE incidents SET status = ?, call_id = ?, call_error = ? WHERE id = ?"
);
const listIncidents = db.prepare(
  "SELECT id, patient_id, reason, anchor_title, gemini_reasoning, confidence, status, call_id, escalation_level, call_tone, created_at FROM incidents ORDER BY created_at DESC LIMIT 50"
);

const insertAnchor = db.prepare(
  "INSERT INTO anchors (patient_id, title, story, created_at) VALUES (?, ?, ?, ?)"
);
const listAnchors = db.prepare(
  "SELECT id, patient_id, title, story, created_at FROM anchors ORDER BY created_at DESC LIMIT 50"
);

export function logIncident({ patient_id, reason, anchor_title, gemini_reasoning, confidence, status, call_id, escalation_level, call_tone }) {
  const created_at = Date.now();
  const info = insertIncident.run(
    patient_id,
    reason,
    anchor_title ?? null,
    gemini_reasoning ?? null,
    confidence ?? null,
    status,
    call_id ?? null,
    escalation_level ?? null,
    call_tone ?? null,
    created_at
  );
  return { id: info.lastInsertRowid, created_at };
}

export function setIncidentStatus({ id, status, call_id, call_error }) {
  updateIncident.run(status, call_id ?? null, call_error ?? null, id);
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

// Patient functions
const insertPatient = db.prepare(
  "INSERT INTO patients (id, name, phone_number, onboarding_status, created_at) VALUES (?, ?, ?, ?, ?)"
);
const getPatientById = db.prepare("SELECT * FROM patients WHERE id = ?");
const listPatients = db.prepare("SELECT * FROM patients ORDER BY created_at DESC");
const updatePatientStatus = db.prepare("UPDATE patients SET onboarding_status = ? WHERE id = ?");

export function createPatient({ id, name, phone_number }) {
  const created_at = Date.now();
  insertPatient.run(id, name, phone_number, 'pending', created_at);
  return { id, created_at };
}

export function getPatient(id) {
  return getPatientById.get(id);
}

export function getPatients() {
  return listPatients.all();
}

export function updateOnboardingStatus(id, status) {
  updatePatientStatus.run(status, id);
}

// Family member functions
const insertFamilyMember = db.prepare(
  "INSERT INTO family_members (patient_id, name, relationship, voice_sample_url, retell_voice_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
);
const getFamilyMembersByPatient = db.prepare("SELECT * FROM family_members WHERE patient_id = ?");
const updateFamilyVoice = db.prepare("UPDATE family_members SET retell_voice_id = ? WHERE id = ?");

export function createFamilyMember({ patient_id, name, relationship }) {
  const created_at = Date.now();
  const info = insertFamilyMember.run(patient_id, name, relationship, null, null, created_at);
  return { id: info.lastInsertRowid, created_at };
}

export function getFamilyMembers(patient_id) {
  return getFamilyMembersByPatient.all(patient_id);
}

export function setFamilyVoice(id, retell_voice_id) {
  updateFamilyVoice.run(retell_voice_id, id);
}

// Voice recording functions
const insertVoiceRecording = db.prepare(
  "INSERT INTO voice_recordings (family_member_id, audio_path, duration_seconds, upload_status, created_at) VALUES (?, ?, ?, ?, ?)"
);
const getVoiceRecordingById = db.prepare("SELECT * FROM voice_recordings WHERE id = ?");

export function createVoiceRecording({ family_member_id, audio_path, duration_seconds }) {
  const created_at = Date.now();
  const info = insertVoiceRecording.run(family_member_id, audio_path, duration_seconds, 'uploaded', created_at);
  return { id: info.lastInsertRowid, created_at };
}

export function getVoiceRecording(id) {
  return getVoiceRecordingById.get(id);
}
