# MK-// CII Dashboard — Project Specification

## Context

MK-// is an indigenous Indian defense technology company building autonomous unmanned combat platforms. The first product is a loitering munition (Shahed-136 class) targeting the MoD Item 60 procurement specification: 500-1000 km range, 50 kg warhead, 200 kg MTOW, 6+ hour endurance, EO-guided with MITL engagement authorization.

The primary technical differentiator is **GPS-denied navigation** — a five-layer fusion architecture that maintains navigation in contested electromagnetic environments where GNSS is jammed or spoofed. No other Indian LM competitor offers this capability.

CII is the autonomy dashboard that visualizes this GNC stack for investors and engineers.

---

## Phase 1: Investor Demo (Current Priority)

### Goal
A deployable web application that runs three pre-scripted EW scenarios, showing investors in real-time how the AI detects threats and autonomously switches navigation sources. Must run entirely on simulated data with no backend dependency.

### Success Criteria
- An investor with no defense background understands within 30 seconds that the left sphere shows "what's being attacked" and the right sphere shows "how the AI responds"
- The GNSS jamming scenario visually demonstrates the value proposition: GNSS collapses → AI switches to terrain/visual/magnetic navigation → mission continues
- The dashboard looks as polished as Anduril Lattice or Palantir AIP demos
- Runs at 60fps on a modern laptop (M1/M2 MacBook or equivalent)
- Deploys to a single URL (Vercel/Netlify) shareable via link

### Demo Script (for investor walkthrough)

1. Open dashboard — nominal flight visible on map with healthy spheres
2. Click "GNSS Jamming" scenario — watch GNSS points on left sphere collapse inward over 15 seconds
3. AI action feed shows: "GNSS degradation detected" → "TERCOM/TAN activating" → "Navigation stable — GPS-denied mode"
4. Right sphere shows TERCOM/MagNav/SceneMatch points expanding (taking over)
5. Nav stack indicator shows GNSS bar collapse, TERCOM bar rise
6. Click "Spoofing Attack" — more dramatic: GNSS points spike outward erratically (spoof), then snap inward as AI rejects spoofed solution
7. Investor takeaway: "This AI can navigate without GPS. Nobody else in India can do this."

---

## Phase 2: Technical Dashboard (Future)

### Additional Features (not in Phase 1)
- Real telemetry ingestion via WebSocket
- Multi-asset tracking (5-drone launch formation)
- Full MIL-STD-2525 symbology
- EKF state visualization (covariance ellipsoid)
- Raw sensor data panels (IMU, baro, magnetometer time series)
- Flight test replay from logged telemetry files
- HITL simulation mode (operator clicks to inject threats)
- Multi-monitor layout support
- MITL authorization workflow with dual-key confirmation

---

## Five-Layer Navigation Architecture

The dashboard must accurately represent this architecture:

### Layer 1: INS/IMU (Always On)
- 15-state error-state EKF: 3 position, 3 velocity, 3 attitude, 3 gyro bias, 3 accel bias
- Tactical-grade MEMS minimum (0.1-1°/hr gyro bias stability)
- Runs continuously — all other layers are aiding sources
- Confidence degrades over time without aiding (drift)

### Layer 2: Hardened GNSS
- Multi-constellation: GPS + GLONASS + NavIC (L5 + S-band)
- RAIM/ARAIM integrity monitoring
- Anti-spoofing: inertial-GNSS cross-check (Kometa-M equivalent)
- Anti-jam: CRPA with null steering (Nasir equivalent)
- These are two architecturally distinct modules — never conflate them

### Layer 3: TERCOM / TAN
- Radar altimeter measures terrain profile
- Correlates against pre-loaded DEM (Digital Elevation Model)
- Works best over varied terrain, degrades over flat terrain or water
- Only emitting sensor — EMCON consideration

### Layer 4: MagNav
- Magnetometer measures Earth's magnetic field anomalies
- Correlates against pre-loaded magnetic anomaly map
- Passive, unjammable, works day/night/weather
- Coarse precision (~100-500m CEP alone)

### Layer 5: Scene Matching / DSMAC + VIO
- Downward-looking EO camera captures terrain imagery
- Correlates against pre-loaded geo-referenced image database
- Visual odometry for continuous motion estimation
- Weather-dependent (clouds, night = degraded)
- Highest precision at terminal phase

### Confidence-Preemptive Fusion
The fusion architecture uses a confidence-preemptive switching model. When any layer's confidence drops below a threshold, the EKF automatically reweights or disengages that source before it contaminates the solution. This is the AI decision-making the spheres visualize.

---

## EW Threat Scenarios

### Scenario 1: Nominal Flight
- All systems operational, GNSS confidence 0.95-0.99
- Gentle random noise on all parameters
- Duration: 60 seconds — establishes baseline

### Scenario 2: Progressive GNSS Jamming
- t=0-8s: Nominal cruise
- t=8-15s: GNSS signal degradation begins (vehicle-mounted jammer enters range)
  - L1 SNR drops first, then L5, NavIC S-band most resilient
  - Left sphere: GNSS cluster points move inward
- t=15-25s: AI detects jamming, activates TERCOM and MagNav
  - Anti-jam module activates, CRPA null steering toward jammer
  - Right sphere: TERCOM and MagNav points expand outward
- t=25-45s: Full GPS-denied navigation established
  - GNSS confidence < 0.05
  - TERCOM + MagNav + Scene Match maintain navigation
  - Fusion confidence recovers to 0.85+, CEP ~50m
- t=45-60s: Stable GPS-denied cruise

### Scenario 3: Spoofing Attack + Detection
- t=0-5s: Nominal cruise
- t=5-12s: Subtle spoofing — GNSS position drifts
  - Left sphere: GNSS points push OUTWARD (anomalous, >1.0)
  - Inertial-GNSS cross-check delta grows
- t=12-18s: Spoof detected — cross-check exceeds threshold
  - Left sphere: GNSS points spike erratically (magenta)
  - Action: "Spoofing detected — GNSS integrity FAIL"
- t=18-25s: GNSS solution REJECTED
  - Falls back to INS + TERCOM + Scene Match
  - Left sphere: GNSS points collapse to zero
  - Right sphere: alternative sources expand
- t=25-60s: Clean navigation without GNSS

---

## Brand System

- **Logo:** MK in white, -// in cyan (#00E5FF) on dark backgrounds
- **Background:** #060A12 to #0A0E1A
- **Primary accent:** Cyan (#00E5FF)
- **Classification bar:** Amber (#C9A84C) for investor demo
- **Typography:** Inter for headings/body, JetBrains Mono for data
- **No light mode.** Dark theme is operational doctrine for defense CIC environments.

---

## Competitive Positioning

The CII dashboard must visually communicate that MK-// operates at the same software sophistication level as:

| Company | Product | Valuation |
|---------|---------|-----------|
| Anduril | Lattice | $28B |
| Palantir | AIP/Maven | $250B+ |
| Shield AI | Hivemind | $4.5B |
| L3Harris | AMORPHOUS | $47B mkt cap |

MK-// is pre-revenue, but CII should demonstrate equivalent technical depth in the GNC/navigation domain. The sphere visualization is the differentiator — nobody else shows their autonomy AI's internal decision-making this transparently.
