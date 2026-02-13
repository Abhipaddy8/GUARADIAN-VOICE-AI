# GuardianVoice AI — Feature Verification Report

**Generated:** 2026-02-13T06:44:48.908Z
**Base URL:** http://localhost:4001
**Node Version:** v22.22.0

## Results

| # | Feature | Status | Details |
|---|---------|--------|---------|
| 1 | Health Endpoint | ❌ FAIL | fetch failed |
| 2 | List Incidents | ❌ FAIL | fetch failed |
| 3 | List Anchors | ❌ FAIL | fetch failed |
| 4 | Create Anchor | ❌ FAIL | fetch failed |
| 5 | Incidents Have Escalation Data | ⚠️ SKIP | No incidents in database to verify |
| 6 | Incidents Have Call Status | ⚠️ SKIP | No incidents in database to verify |
| 7 | Demo Call Endpoint Exists | ❌ FAIL | fetch failed |
| 8 | Demo Call Validates Phone Format | ❌ FAIL | fetch failed |
| 9 | Patients Endpoint | ❌ FAIL | fetch failed |
| 10 | Admin UI Accessible | ❌ FAIL | Admin UI not running on port 5173 |
| 11 | Family UI Accessible | ❌ FAIL | Family UI not running on port 5174 |
| 12 | MQTT Broker Running | ❌ FAIL | connect ECONNREFUSED 127.0.0.1:1883 |

## Summary

- **Total:** 12
- **Passed:** 0
- **Failed:** 10
- **Skipped:** 2

## System Ready: NO