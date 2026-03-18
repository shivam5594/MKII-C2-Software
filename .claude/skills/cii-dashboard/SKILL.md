---
name: cii-dashboard
description: Build the MK-// CII autonomy dashboard — a defense-grade web application for visualizing loitering munition GNC, GPS-denied navigation confidence, and EW countermeasures. Use this skill for ANY task related to the CII dashboard frontend, including React components, Three.js/R3F 3D visualizations, the paired confidence sphere system, map-based C2 interfaces, design system tokens, or dashboard layout work. Also use when building any MK-// web UI, investor demo, or technical dashboard prototype. This skill covers the complete stack: React + TypeScript + Vite, React Three Fiber for 3D, Mapbox/MapLibre for geospatial, Tailwind CSS with MK-// brand tokens, and Framer Motion for transitions.
---

# CII Dashboard — MK-// Autonomy Visualization Platform

## What This Is

CII is MK-//'s web-based autonomy dashboard for its loitering munition platform. It visualizes the GNC stack — GPS-denied navigation, sensor fusion confidence, EW threat conditions, and AI countermeasure decisions — in a format that serves two audiences:

1. **Investor Demo** (Phase 1): A polished, limited-scope interactive demo that communicates what the autonomy AI does. Runs on simulated data. Optimized for "wow factor" and clarity in a 5-minute walkthrough.
2. **Technical Dashboard** (Phase 2+): A continuously developed operational interface for engineering review, flight test telemetry, and eventual field deployment. Connects to real telemetry streams.

Both share a single design system and component library. The investor demo is a curated subset of the technical dashboard's components.

## Before You Write Any Code

1. Read this SKILL.md completely
2. Read `references/DESIGN_SYSTEM.md` for all design tokens, color values, typography, and component patterns
3. Read `references/ARCHITECTURE.md` for file structure, component tree, and naming conventions
4. Read `references/DATA_MODELS.md` for TypeScript interfaces and data contracts
5. Read `references/PROJECT_SPEC.md` for the complete technical specification

## Tech Stack (Locked)

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 18+ with TypeScript | Industry standard, R3F ecosystem |
| Build | Vite 5+ | Fast HMR, ESM-native |
| 3D Rendering | React Three Fiber + drei + Three.js | Declarative 3D in React, GPU particles |
| Map | MapLibre GL JS (or Mapbox GL JS) | Open-source vector tiles, dark style |
| Styling | Tailwind CSS 3+ with CSS variables | Utility-first + brand token system |
| Animation | Framer Motion + GSAP (3D only) | Page transitions + complex 3D animation |
| State | Zustand | Lightweight, TypeScript-friendly |
| Charts | Recharts or Tremor | For 2D telemetry charts |
| Icons | Lucide React | Clean, consistent icon set |
| Monospace | JetBrains Mono (Google Fonts) | Data displays, code, telemetry readouts |
| Display Font | Inter (headings) or Space Grotesk | Clean geometric sans-serif |

## The Paired Confidence Sphere — Core Innovation

The signature visualization is two 3D point cloud spheres displayed side by side:

**Left Sphere: "THREAT" — What the LM Sees**
- Each point on the sphere represents an EW/navigation parameter
- Parameters are mapped to fixed (θ, φ) positions on the sphere using icosphere subdivision
- Radial distance from center = current confidence/health (1.0 = nominal on surface, <1.0 = degraded inward, >1.0 = anomalous outward)
- Color encodes severity: cyan (nominal) → amber (degraded) → red (critical)
- When GNSS is jammed, the GNSS-related points collapse inward; when a spoof is detected, those points push outward erratically
- The sphere deforms organically in real-time, creating an instantly readable "health shape"

**Right Sphere: "RESPONSE" — What the AI Does**
- Same structure, but parameters represent countermeasure activations
- When the left sphere shows GNSS collapse, the right sphere shows TERCOM/MagNav/Scene Matching points expanding outward (taking over navigation)
- The visual narrative: threat deforms left sphere → AI response reshapes right sphere to compensate
- A "healthy" system shows two roughly spherical shapes; an actively countering system shows complementary deformations

**Implementation Pattern:**
```
BufferGeometry + Float32Array positions in spherical coords
→ ShaderMaterial with per-vertex aRadius, aColor attributes
→ GPU-animated radial displacement via uTime uniform
→ useFrame() updates radius values from Zustand state
→ Bloom post-processing for glow effect
```

Use `icomesh` for uniform icosphere point distribution. Target 500-2000 points per sphere. Each point maps to a specific parameter via a lookup table defined in the data model.

## Layout Architecture

The dashboard follows the defense C2 convention established by Anduril Lattice and Palantir AIP:

```
┌─────────────────────────────────────────────────────┐
│ TOP BAR: MK-// logo | Mission Clock | Status LEDs   │
│          Classification Bar (amber for investor)     │
├──────────┬──────────────────────────┬───────────────┤
│          │                          │               │
│  LEFT    │    CENTER VIEWPORT       │    RIGHT      │
│  PANEL   │                          │    PANEL      │
│          │  Map view (default)      │               │
│ Asset    │  OR                      │  AI Actions   │
│ List     │  Sphere view             │  Feed         │
│          │  OR                      │               │
│ Nav      │  Split (map + spheres)   │  Task Queue   │
│ Stack    │                          │               │
│ Status   │                          │  Telemetry    │
│          │                          │  Cards        │
│          │                          │               │
├──────────┴──────────────────────────┴───────────────┤
│ BOTTOM BAR: Nav source indicators | EW status strip  │
│             Confidence bars | MITL authorization      │
└─────────────────────────────────────────────────────┘
```

Panels are collapsible. Center viewport has three modes toggled by tabs or keyboard shortcuts:
1. **MAP** — MapLibre with dark style, asset markers, flight paths, threat zones
2. **SPHERES** — Full-viewport paired confidence spheres with parameter labels
3. **SPLIT** — Map top, spheres bottom (or left/right)

## Component Naming & Organization

All components follow this convention:
- PascalCase for component names
- `*.tsx` for components, `*.ts` for utilities/types/stores
- Colocate styles with components when component-specific
- Shared design tokens live in `src/styles/tokens.css` and `tailwind.config.ts`

```
src/
├── components/
│   ├── layout/           # Shell, TopBar, BottomBar, Panels
│   ├── map/              # MapView, AssetMarker, FlightPath, ThreatZone
│   ├── spheres/          # ConfidenceSphere, SphereViewport, ParameterLabel
│   ├── telemetry/        # TelemetryCard, NavStackIndicator, EWStatusStrip
│   ├── actions/          # AIActionFeed, TaskQueue, MITLGate
│   ├── common/           # StatusLED, ClassificationBar, DataChip, IconButton
│   └── charts/           # ConfidenceTimeline, SignalStrengthChart
├── three/                # Three.js specific: shaders, geometries, materials
│   ├── shaders/          # GLSL vertex/fragment shaders
│   ├── SphereParticles.tsx
│   └── BloomPostProcessing.tsx
├── stores/               # Zustand stores
│   ├── missionStore.ts
│   ├── navigationStore.ts
│   └── ewStore.ts
├── data/                 # Mock data generators, parameter maps
│   ├── mockTelemetry.ts
│   ├── parameterMap.ts   # Maps sphere points to nav/EW parameters
│   └── scenarios.ts      # Pre-built demo scenarios (jam, spoof, nominal)
├── hooks/                # Custom hooks
│   ├── useAnimationFrame.ts
│   ├── useSphereGeometry.ts
│   └── useSimulation.ts
├── styles/
│   ├── tokens.css        # CSS custom properties from brand system
│   └── globals.css
├── types/                # TypeScript type definitions
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Critical Design Rules

1. **Dark theme is mandatory.** Background: `--navy-900` (#060A12) or `--navy-800` (#0A0E1A). No light mode.
2. **Cyan is the primary accent.** `--cyan-500` (#00E5FF) for interactive elements, data highlights, active states.
3. **Amber is investor/strategic only.** `--amber-500` (#C9A84C) for classification bars and premium callouts.
4. **Red means critical/hostile.** Never decorative. Reserved for threats, failures, and classified markings.
5. **No decorative gradients.** Gradients are data-driven only (confidence scales, signal strength).
6. **Monospace for data.** All numerical readouts, telemetry values, coordinates, and timestamps use JetBrains Mono.
7. **Classification bar on every view.** Thin strip (4px) at the very top of the viewport. Amber for investor, grey for internal.
8. **MIL-STD-2525 color convention.** Blue/cyan = friendly, red = hostile, amber/yellow = unknown.
9. **No lorem ipsum.** All placeholder text must use real defense/GNC terminology.
10. **GPU shaders for sphere animation.** Never animate 500+ point positions on the CPU via useFrame. Use ShaderMaterial with uniforms.

## Investor Demo Specifics

The investor demo runs three pre-scripted scenarios accessible via a scenario picker:

1. **Nominal Flight** — All systems green, sphere is round, smooth cruise at 3000m AGL
2. **GNSS Jamming** — Progressive signal degradation, left sphere collapses at GNSS points, right sphere shows TERCOM/MagNav activation, navigation continues
3. **Spoofing Attack + Counter** — GNSS points on left sphere spike outward erratically, Kometa-M equivalent detection triggers, right sphere shows inertial cross-check lock and GNSS rejection, clean handoff to scene matching

Each scenario auto-plays over ~60 seconds with a timeline scrubber. Investor can pause, rewind, or jump between scenarios.

## Performance Targets

- 60fps minimum during sphere animation (GPU-driven)
- First contentful paint < 1.5s
- Total bundle < 500KB gzipped (excluding map tiles)
- Sphere render with 1000 points: < 2ms per frame
- Map with 50 assets: smooth pan/zoom at 60fps

## What NOT to Build

- No authentication/login system
- No real telemetry ingestion (mock data only for now)
- No mobile responsive layout (desktop-first, 1920×1080 minimum)
- No backend/API server (everything runs client-side)
- No unit tests in Phase 1 (focus on visual output)
