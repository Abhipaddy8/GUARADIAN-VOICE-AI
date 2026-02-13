# File Review Guide: Functionality & Frontend Design

This guide shows you which files to review to understand and verify different aspects of the system.

---

## 🔍 Review by Category

## 1️⃣ CORE FUNCTIONALITY - Backend Services

### Vitals Ingestion & Risk Detection
**File:** `apps/ingestor/src/index.js` (65 LOC)

**What to review:**
- Lines 1-30: MQTT connection setup
- Lines 35-55: Message handler with risk detection logic
- Lines 23-26: The risk detection formula (HR > 100 OR accel > 25)

**Key functions:**
```javascript
isHighRiskVitals(vitals)      // Risk threshold logic
normalizeVitals(data)         // Data validation
```

**Expected flow:**
1. Receives vitals JSON
2. Normalizes data (validates types/ranges)
3. Checks if high-risk
4. If yes → publishes intervention request

---

### Orchestrator API & Decision Engine
**Files:**
- `apps/orchestrator/src/index.js` (250+ LOC) - Main server
- `apps/orchestrator/src/gemini.js` (60 LOC) - AI integration ⭐
- `apps/orchestrator/src/decision-engine.js` (50 LOC) - Decision logic
- `apps/orchestrator/src/db.js` (100 LOC) - Database operations

**What to review:**

#### In `index.js`:
- Lines 1-50: Imports & configuration
- Lines 50-80: Express app setup & health endpoint
- Lines 80-100: API route handlers
  - `/api/health` - System status
  - `/api/incidents` - Get incidents
  - `/api/anchors` - Get/post anchors
- Lines 100-180: MQTT message handler (THE CORE LOGIC)
  - Where intervention requests are received
  - Where Gemini decision engine is called
  - Where incidents are logged

#### In `gemini.js`: ⭐
- Lines 1-10: Gemini client initialization
- Lines 12-40: `analyzeIntervention()` function
  - Receives: vitals, trigger_reason, available_anchors
  - Builds prompt for Gemini 2.5
  - Returns: selected anchor + reasoning + confidence
  - **This is where the AI magic happens**

#### In `decision-engine.js`:
- Lines 1-25: `planIntervention()` function
  - Fetches patient anchors from database
  - Builds context object
  - Calls Gemini
  - Returns decision with fallback logic

#### In `db.js`:
- Lines 20-40: Schema (incidents + anchors tables)
- Lines 50-100: CRUD operations
  - `logIncident()` - Save decision to DB
  - `getIncidents()` - Retrieve incidents
  - `createAnchor()` - Save memory anchor
  - `getAnchors()` - Get anchors for patient

---

### Database (SQLite)
**File:** `apps/orchestrator/src/db.js`

**Key queries to understand:**
```sql
-- Store incidents with AI reasoning
INSERT INTO incidents
  (patient_id, reason, anchor_title, gemini_reasoning, confidence, status)
VALUES (?, ?, ?, ?, ?, ?)

-- Retrieve with AI data
SELECT id, patient_id, reason, anchor_title,
       gemini_reasoning, confidence, status, created_at
FROM incidents ORDER BY created_at DESC LIMIT 50
```

**What changed in this project:**
- Added `gemini_reasoning` column (AI's explanation)
- Added `confidence` column (0.0-1.0 score)
- Both store in database for audit trail

---

## 2️⃣ FRONTEND DESIGN & FUNCTIONALITY

### Admin Dashboard (Clinical Interface)
**File:** `apps/admin-ui/src/main.jsx` (250 LOC)

**What to review:**

#### Layout Structure (Lines 1-50):
- React functional component
- useState for incidents
- useEffect for polling API

#### Key Components:
1. **Header** (Lines 60-75):
   - Project branding
   - Live status badge

2. **Patient Fleet View** (Lines 80-120):
   - Grid layout (3 mock patients)
   - Heart rate display
   - Status indicators

3. **Crisis Monitor Section** (Lines 125-145):
   - Webots placeholder
   - Vitals 60-second window

4. **Incident Log** (Lines 150-200) ⭐ **MOST IMPORTANT FOR THIS PROJECT**:
   - Real-time incident display
   - Shows AI reasoning from Gemini
   - Shows confidence scores
   - Updates every 4 seconds

#### Key styling insights:
- Georgia serif font (clinical, professional)
- Muted earth tones (calming)
- Color scheme: #1c1f24 (dark), #fefae0 (cream), #163b2f (green)

#### The Incident Display Logic (THE KEY PART):
```jsx
{incidents.map((incident) => (
  <div key={incident.id} style={styles.logItem}>
    <div style={styles.logLine}>
      <strong>{incident.patient_id}</strong> • {incident.reason}
    </div>
    <div style={styles.logMeta}>
      <strong>Anchor:</strong> {incident.anchor_title}
    </div>
    {incident.gemini_reasoning && (
      <div style={styles.logReasoning}>
        <strong>AI Reasoning:</strong>
        {formatReasoning(incident.gemini_reasoning)}
      </div>
    )}
    <div style={styles.logMeta}>
      Confidence: {(incident.confidence * 100).toFixed(0)}% •
      Status: {incident.status}
    </div>
  </div>
))}
```

**What this shows:**
- Real-time data binding to API
- Displays Gemini's reasoning
- Shows confidence scores (95% when working)
- Shows memory anchor selected
- Shows incident status

---

### Family Portal (Memory Management)
**File:** `apps/family-ui/src/main.jsx` (200 LOC)

**What to review:**

#### Layout Structure:
- React component similar to admin UI
- useEffect fetches anchors from API

#### Key Sections:

1. **Header** (Warm, family-friendly):
   - Palatino serif font
   - Warm gradient (pink/orange/yellow)
   - "The Anchor Vault"

2. **Onboarding Flow** (Lines 50-100):
   - 3-step card explanation
   - "What are memory anchors?"
   - "Why they help"
   - "How to create them"

3. **Add Memory Anchor Form** (Lines 105-150):
   - Text input for title
   - Textarea for story
   - Submit button
   - Calls `POST /api/anchors`

4. **Anchor List** (Lines 155-180):
   - Shows all anchors for patient
   - Display title + story
   - Created date

#### Key styling:
- Palatino serif (warm, literary)
- Gradient background (calming)
- Color: #d4a574 (warm tan), #e8c9a0 (lighter)

---

## 3️⃣ DATA FLOW VERIFICATION

### To verify the complete data flow:

1. **Start with Ingestor** (`apps/ingestor/src/index.js`):
   - Understand how vitals are received
   - See the risk detection logic (line ~24)

2. **Follow to Orchestrator** (`apps/orchestrator/src/index.js`):
   - See MQTT handler that receives interventions (line ~90)
   - See where Gemini is called (line ~105)

3. **Check Gemini Integration** (`apps/orchestrator/src/gemini.js`):
   - See the AI prompt being sent (line ~20)
   - See JSON response parsing (line ~45)

4. **Check Database** (`apps/orchestrator/src/db.js`):
   - See where data is stored (line ~60)
   - See the incident schema (line ~20)

5. **Verify API** (`apps/orchestrator/src/index.js`):
   - See `/api/incidents` endpoint (line ~35)
   - See how it queries database

6. **Check Admin UI** (`apps/admin-ui/src/main.jsx`):
   - See polling logic (line ~15)
   - See how incidents are displayed (line ~150)

---

## 4️⃣ CONFIGURATION & DEPLOYMENT

### Environment Configuration
**Files:**
- `apps/orchestrator/.env`
- `apps/ingestor/.env`

**What to check:**
```env
# Orchestrator - verify these are set:
MQTT_URL=mqtt://localhost:1883
API_PORT=4001
DB_PATH=./data/guardianvoice.db
GEMINI_API_KEY=AIzaSyAk2qdyJFTw2Q4R2ApL-QqVBS5KAWD2_Ac
GEMINI_MODEL=gemini-2.5-flash
```

**What each does:**
- `MQTT_URL` - Where to find the broker
- `API_PORT` - Port for Express server
- `DB_PATH` - Where SQLite database lives
- `GEMINI_API_KEY` - AI service credentials ⭐
- `GEMINI_MODEL` - Which AI model to use

---

## 5️⃣ TESTING & DEMO

### Demo Scripts (Review these to understand the flow)

**Vitals Simulator** (`scripts/vitals-simulator.js`):
- Lines 20-50: Shows the 5 phases (normal → crisis → recovery)
- Lines 55-80: How realistic vitals patterns are generated
- Useful for understanding expected vitals ranges

**Demo Scenario** (`scripts/demo-scenario.js`):
- Lines 20-60: The 6-phase demo sequence
- Each phase represents a different clinical state
- Shows realistic timing and HR progression

**Seed Demo Data** (`scripts/seed-demo-data.js`):
- Lines 15-45: Example memory anchors
- Shows the format: patient_id, title, story
- Used to populate database with demo data

---

## 6️⃣ SHARED UTILITIES

### Vitals Validation Logic
**File:** `packages/shared/src/index.js` (15 LOC)

**What to review:**
```javascript
// The risk threshold
isHighRiskVitals(vitals)
// Returns: vitals.hr > 100 || vitals.accel_delta > 25

// Data normalization
normalizeVitals(payload)
// Ensures all fields present and correct type
```

These functions are used by both ingestor and orchestrator to ensure consistency.

---

## 📋 Quick Reference: What to Review

### To Understand the AI Decision-Making:
1. **First:** `apps/orchestrator/src/gemini.js` - See the prompt
2. **Second:** `apps/orchestrator/src/decision-engine.js` - See the logic
3. **Third:** `apps/orchestrator/src/index.js` (lines 100-120) - See integration

### To Understand the UI:
1. **First:** `apps/admin-ui/src/main.jsx` (lines 150-200) - Incident display
2. **Second:** `apps/admin-ui/src/main.jsx` (lines 1-50) - Data fetching
3. **Third:** Check `/api/incidents` response in browser console

### To Understand the Data Flow:
1. Start: `apps/ingestor/src/index.js`
2. Middle: `apps/orchestrator/src/index.js`
3. End: `apps/admin-ui/src/main.jsx`

### To Understand the Database:
1. **Schema:** `apps/orchestrator/src/db.js` (lines 20-40)
2. **Queries:** `apps/orchestrator/src/db.js` (lines 50-100)
3. **Live data:** Query SQLite directly
   ```bash
   sqlite3 apps/orchestrator/data/guardianvoice.db
   SELECT * FROM incidents LIMIT 1;
   ```

---

## 🧪 Testing Checklist

### Backend Functionality:
- [ ] Vitals arrive at ingestor
- [ ] Risk detection triggers (HR > 100)
- [ ] Intervention published to MQTT
- [ ] Orchestrator receives intervention
- [ ] Gemini called successfully
- [ ] Confidence score > 80%
- [ ] Incident logged to database
- [ ] Health endpoint returns correct metrics

### Frontend Functionality:
- [ ] Admin UI loads at http://localhost:5173
- [ ] Incidents appear in real-time
- [ ] Gemini reasoning visible
- [ ] Confidence scores displayed
- [ ] Family UI loads at http://localhost:5174
- [ ] Can create new memory anchors
- [ ] Anchors appear in list

### End-to-End:
- [ ] Run `npm run seed`
- [ ] Run `npm run demo`
- [ ] Watch admin UI for 48 seconds
- [ ] See incidents with 95%+ confidence
- [ ] See AI reasoning for each decision

---

## 🎯 Key Files by Priority

### Must Review (Core System):
1. **ARCHITECT.md** (this system overview)
2. `apps/orchestrator/src/index.js` (main server)
3. `apps/orchestrator/src/gemini.js` (AI integration)
4. `apps/admin-ui/src/main.jsx` (UI)
5. `apps/orchestrator/src/db.js` (database)

### Should Review (Important):
6. `apps/ingestor/src/index.js` (vitals processing)
7. `apps/orchestrator/src/decision-engine.js` (decision logic)
8. `apps/family-ui/src/main.jsx` (family portal)
9. `packages/shared/src/index.js` (validation)

### Nice to Review (Context):
10. `scripts/demo-scenario.js` (demo flow)
11. `scripts/vitals-simulator.js` (test data)
12. DEPLOYMENT.md (production setup)
13. QUICKSTART.md (how to run)

---

## 💡 Tips for Review

**When reading backend code:**
- Follow the MQTT message path end-to-end
- Look for where Gemini is called
- See how data transforms at each step
- Check error handling/fallbacks

**When reading frontend code:**
- See how data is fetched from API
- Notice polling intervals (4 seconds for admin)
- Look at how AI reasoning is displayed
- Check styling for user experience

**When testing:**
- Use browser dev tools (Network tab) to see API calls
- Check browser console for React warnings
- Run demo scenario to see real data
- Monitor orchestrator logs for Gemini latency

---

## 📊 Expected Results When Everything Works

### From Admin UI:
```
P001 • VITALS_TRIGGER
Anchor: First Grandchild
AI Reasoning: The patient's heart rate is elevated... (95% confidence)
Confidence: 95% • Status: queued
```

### From Orchestrator Logs:
```
[orchestrator] 🚨 intervention for P001
[gemini] Using model: gemini-2.5-flash
[gemini] analyzed intervention in 7328ms
[orchestrator] ✓ latency: 7330ms, confidence: 95%
```

### From API Response:
```json
{
  "incidents": [{
    "patient_id": "P001",
    "anchor_title": "First Grandchild",
    "gemini_reasoning": "The memory of holding Emma gently...",
    "confidence": 0.95,
    "status": "queued"
  }]
}
```

---

**This guide will help you understand every part of the system. Start with ARCHITECT.md, then follow the file review paths above!** 📖
