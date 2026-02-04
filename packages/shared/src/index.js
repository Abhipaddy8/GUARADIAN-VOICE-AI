export const VITALS_TOPIC = "vitals/stream";

export function isHighRiskVitals(vitals) {
  return vitals.hr > 100 || vitals.accel_delta > 25;
}

export function normalizeVitals(payload) {
  return {
    patient_id: payload.patient_id ?? "UNKNOWN",
    hr: Number(payload.hr ?? 0),
    accel_delta: Number(payload.accel_delta ?? 0),
    ts: Number(payload.ts ?? Date.now())
  };
}
