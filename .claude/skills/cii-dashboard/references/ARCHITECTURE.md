# MK-// CII Dashboard — Architecture Reference

## Project Initialization

```bash
npm create vite@latest . -- --template react-ts
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install zustand framer-motion lucide-react recharts
npm install maplibre-gl
npm install icomesh
npm install -D tailwindcss @tailwindcss/vite
npm install -D @types/three
```

Fonts (add to index.html or via Google Fonts):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## File Structure

```
cii-dashboard/
├── public/
│   ├── favicon.svg
│   └── scenarios/
│       ├── nominal.json
│       ├── gnss-jam.json
│       └── spoof-attack.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   ├── tokens.css
│   │   └── globals.css
│   │
│   ├── types/
│   │   ├── navigation.ts
│   │   ├── ew.ts
│   │   ├── mission.ts
│   │   ├── sphere.ts
│   │   └── index.ts
│   │
│   ├── stores/
│   │   ├── missionStore.ts
│   │   ├── navigationStore.ts
│   │   ├── ewStore.ts
│   │   └── uiStore.ts
│   │
│   ├── data/
│   │   ├── parameterMap.ts
│   │   ├── scenarioEngine.ts
│   │   ├── mockTelemetry.ts
│   │   └── navParameters.ts
│   │
│   ├── hooks/
│   │   ├── useSimulation.ts
│   │   ├── useSphereData.ts
│   │   ├── useScenario.ts
│   │   └── useMapAssets.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Shell.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── BottomBar.tsx
│   │   │   ├── LeftPanel.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   └── ClassificationBar.tsx
│   │   │
│   │   ├── spheres/
│   │   │   ├── SphereViewport.tsx
│   │   │   ├── ConfidenceSphere.tsx
│   │   │   ├── SphereParticles.tsx
│   │   │   ├── ReferenceWireframe.tsx
│   │   │   ├── ParameterLabels.tsx
│   │   │   ├── ConnectionLines.tsx
│   │   │   └── SphereControls.tsx
│   │   │
│   │   ├── map/
│   │   │   ├── MapView.tsx
│   │   │   ├── AssetMarker.tsx
│   │   │   ├── FlightPath.tsx
│   │   │   ├── ThreatZone.tsx
│   │   │   └── WaypointMarker.tsx
│   │   │
│   │   ├── telemetry/
│   │   │   ├── TelemetryCard.tsx
│   │   │   ├── NavStackIndicator.tsx
│   │   │   ├── EWStatusStrip.tsx
│   │   │   ├── ConfidenceTimeline.tsx
│   │   │   └── MissionClock.tsx
│   │   │
│   │   ├── actions/
│   │   │   ├── AIActionFeed.tsx
│   │   │   ├── AIActionCard.tsx
│   │   │   ├── TaskQueue.tsx
│   │   │   ├── MITLGate.tsx
│   │   │   └── ScenarioPicker.tsx
│   │   │
│   │   └── common/
│   │       ├── StatusLED.tsx
│   │       ├── DataChip.tsx
│   │       ├── IconButton.tsx
│   │       ├── PanelHeader.tsx
│   │       ├── Tooltip.tsx
│   │       └── Logo.tsx
│   │
│   ├── three/
│   │   ├── shaders/
│   │   │   ├── sphereVertex.glsl
│   │   │   ├── sphereFragment.glsl
│   │   │   └── bloomComposite.glsl
│   │   ├── materials/
│   │   │   └── SphereMaterial.ts
│   │   └── geometries/
│   │       └── IcoSpherePoints.ts
│   │
│   └── utils/
│       ├── sphericalCoords.ts
│       ├── colorInterpolation.ts
│       └── formatters.ts
│
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Data Flow

```
Scenario JSON → scenarioEngine.ts → useSimulation hook
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            navigationStore       ewStore            missionStore
            (confidence vals)   (threat state)      (clock, phase)
                    │                    │                    │
                    ▼                    ▼                    ▼
            useSphereData         useSphereData       useMapAssets
            (left sphere)        (right sphere)      (map markers)
                    │                    │                    │
                    ▼                    ▼                    ▼
            SphereParticles      SphereParticles      MapView
            (GPU-rendered)       (GPU-rendered)     (MapLibre)
```

### Store Design (Zustand)

```typescript
// navigationStore.ts
interface NavigationState {
  insImu: number;
  gnss: number;
  tercom: number;
  magNav: number;
  sceneMatch: number;
  parameters: Record<string, ParameterState>;
  activeSource: 'GNSS' | 'TERCOM' | 'MAGNAV' | 'SCENE_MATCH' | 'INS_ONLY';
  updateConfidence: (layer: string, value: number) => void;
  updateParameter: (id: string, state: Partial<ParameterState>) => void;
  setActiveSource: (source: string) => void;
}
```

---

## Scenario JSON Format

Each scenario is a timeline of state changes with linear interpolation between keyframes:

```json
{
  "id": "gnss-jam",
  "name": "GNSS Jamming Attack",
  "description": "Progressive GNSS degradation with autonomous nav source switching",
  "duration_seconds": 60,
  "timeline": [
    {
      "t": 0,
      "nav": { "gnss": 0.98, "insImu": 0.99, "tercom": 0.0, "magNav": 0.0, "sceneMatch": 0.0 },
      "ew": { "jammingDetected": false, "spoofDetected": false },
      "mission": { "phase": "CRUISE", "altitude_m": 3000 }
    },
    {
      "t": 8,
      "nav": { "gnss": 0.72 },
      "ew": { "jammingDetected": true, "jamPower_dBm": -85 },
      "actions": [{ "type": "ALERT", "message": "GNSS signal degradation detected" }]
    },
    {
      "t": 15,
      "nav": { "gnss": 0.31, "tercom": 0.65, "magNav": 0.45 },
      "actions": [{ "type": "NAV_SWITCH", "from": "GNSS", "to": "TERCOM", "confidence": 0.65 }]
    },
    {
      "t": 25,
      "nav": { "gnss": 0.04, "tercom": 0.88, "magNav": 0.72, "sceneMatch": 0.81 },
      "actions": [{ "type": "FUSION_UPDATE", "message": "Multi-source fusion active" }]
    },
    {
      "t": 45,
      "nav": { "gnss": 0.02, "tercom": 0.91, "magNav": 0.78, "sceneMatch": 0.94 },
      "ew": { "jamPower_dBm": -62 },
      "actions": [{ "type": "STATUS", "message": "Navigation stable — GPS-denied mode" }]
    }
  ]
}
```

---

## Rendering Strategy

### Sphere (React Three Fiber)

```tsx
<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
  <ambientLight intensity={0.1} />
  <group position={[-2.5, 0, 0]}>
    <ConfidenceSphere data={threatSphereData} label="THREAT CONDITION" />
    <ReferenceWireframe radius={1.0} />
  </group>
  <group position={[2.5, 0, 0]}>
    <ConfidenceSphere data={responseSphereData} label="AI RESPONSE" />
    <ReferenceWireframe radius={1.0} />
  </group>
  <OrbitControls enablePan={false} maxDistance={10} minDistance={3} />
  <EffectComposer>
    <Bloom luminanceThreshold={0.6} intensity={0.5} radius={0.8} />
  </EffectComposer>
</Canvas>
```

### Map (MapLibre)

Free dark tile source (no API key):
```
https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | MAP view |
| `2` | SPHERE view |
| `3` | SPLIT view |
| `[` | Toggle left panel |
| `]` | Toggle right panel |
| `Space` | Play/pause scenario |
| `←` / `→` | Scrub timeline |
| `N` / `J` / `S` | Load Nominal / Jam / Spoof scenario |
| `Esc` | Close any modal |

---

## Build & Deploy

```bash
npm run dev       # Vite dev server, port 5173
npm run build     # Output to dist/
npm run preview   # Preview production build
```

Deploy to Vercel/Netlify as static site. No backend, no env vars required for mock-data version.
