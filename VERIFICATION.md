# GuardianVoice AI — Feature Verification Report

**Generated:** 2026-02-13T06:47:33.806Z
**Base URL:** http://localhost:4001
**Node Version:** v22.22.0

## Results

| # | Feature | Status | Details |
|---|---------|--------|---------|
| 1 | Health Endpoint | ✅ PASS | 200 OK, ok: true |
| 2 | List Incidents | ✅ PASS | 200 OK, 0 incidents |
| 3 | List Anchors | ✅ PASS | 200 OK, 0 anchors |
| 4 | Create Anchor | ✅ PASS | Created anchor id 1 |
| 5 | Incidents Have Escalation Data | ⚠️ SKIP | No incidents in database to verify |
| 6 | Incidents Have Call Status | ⚠️ SKIP | No incidents in database to verify |
| 7 | Demo Call Endpoint Exists | ✅ PASS | Status 200 |
| 8 | Demo Call Validates Phone Format | ✅ PASS | Phone number must include country code (e.g. +1234567890) |
| 9 | Patients Endpoint | ✅ PASS | 200 OK, 0 patients |
| 10 | Admin UI Accessible | ✅ PASS | 200 OK |
| 11 | Family UI Accessible | ✅ PASS | 200 OK |
| 12 | MQTT Broker Running | ✅ PASS | Connected to port 1883 |

## Summary

- **Total:** 12
- **Passed:** 10
- **Failed:** 0
- **Skipped:** 2

## System Ready: YES