# MK-// CII Dashboard — Design System

## Brand-to-Web Token Mapping

All values derive from `mk2_brand_constants.js`. CSS custom properties are the single source of truth at runtime.

### tokens.css

```css
:root {
  /* ── Navy Ramp (backgrounds, surfaces) ── */
  --navy-900: #060A12;
  --navy-800: #0A0E1A;
  --navy-700: #0D1117;
  --navy-600: #131A24;
  --navy-500: #1A2332;
  --navy-400: #243044;
  --navy-300: #3A4A62;
  --navy-200: #5A6A82;
  --navy-100: #8899AA;

  /* ── Cyan Ramp (primary UI accent) ── */
  --cyan-700: #007A8A;
  --cyan-600: #00ACC1;
  --cyan-500: #00E5FF;
  --cyan-400: #00D4FF;
  --cyan-300: #33E8FF;
  --cyan-200: #80F0FF;
  --cyan-100: #B3F5FF;

  /* ── Amber Ramp (investor/strategic only) ── */
  --amber-500: #C9A84C;
  --amber-400: #D4B86A;
  --amber-300: #E0C888;
  --amber-200: #ECD8A6;
  --amber-100: #F5ECCC;

  /* ── Status Colors ── */
  --status-nominal: #00E5FF;
  --status-caution: #FFB800;
  --status-warning: #FF6B35;
  --status-critical: #E24B4A;
  --status-offline: #3A4A62;
  --status-active: #00FF88;

  /* ── Sphere Confidence Gradient ── */
  --sphere-nominal: #00E5FF;
  --sphere-degraded: #FFB800;
  --sphere-critical: #E24B4A;
  --sphere-anomalous: #FF00FF;
  --sphere-wireframe: rgba(0, 229, 255, 0.08);

  /* ── Classification Bar ── */
  --class-external: #00E5FF;
  --class-investor: #C9A84C;
  --class-internal: #5A6A7A;
  --class-classified: #E24B4A;

  /* ── Typography ── */
  --font-display: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;

  /* ── Type Scale ── */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 48px;

  /* ── Spacing ── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ── Border Radius ── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ── Shadows (glow effects for dark theme) ── */
  --glow-cyan: 0 0 20px rgba(0, 229, 255, 0.15);
  --glow-cyan-strong: 0 0 40px rgba(0, 229, 255, 0.3);
  --glow-amber: 0 0 20px rgba(201, 168, 76, 0.15);
  --glow-red: 0 0 20px rgba(226, 75, 74, 0.2);

  /* ── Panel dimensions ── */
  --panel-left-width: 280px;
  --panel-right-width: 320px;
  --topbar-height: 48px;
  --bottombar-height: 40px;
  --classbar-height: 4px;
}
```

### Tailwind Extend Config

```typescript
// tailwind.config.ts — extend section
{
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#060A12', 800: '#0A0E1A', 700: '#0D1117',
          600: '#131A24', 500: '#1A2332', 400: '#243044',
          300: '#3A4A62', 200: '#5A6A82', 100: '#8899AA',
        },
        cyan: {
          700: '#007A8A', 600: '#00ACC1', 500: '#00E5FF',
          400: '#00D4FF', 300: '#33E8FF', 200: '#80F0FF', 100: '#B3F5FF',
        },
        amber: {
          500: '#C9A84C', 400: '#D4B86A', 300: '#E0C888',
          200: '#ECD8A6', 100: '#F5ECCC',
        },
        status: {
          nominal: '#00E5FF', caution: '#FFB800',
          warning: '#FF6B35', critical: '#E24B4A',
          offline: '#3A4A62', active: '#00FF88',
        },
      },
      fontFamily: {
        display: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.15)',
        'glow-cyan-strong': '0 0 40px rgba(0, 229, 255, 0.3)',
        'glow-amber': '0 0 20px rgba(201, 168, 76, 0.15)',
        'glow-red': '0 0 20px rgba(226, 75, 74, 0.2)',
      },
    },
  },
}
```

---

## Component Patterns

### StatusLED
A 10px circle with glow. Four states: nominal (cyan), caution (amber), critical (red), offline (grey).
```
<div class="w-2.5 h-2.5 rounded-full bg-status-nominal shadow-glow-cyan" />
```

### ClassificationBar
Full-width, 4px tall, fixed at viewport top. Color from classification level.
```
<div class="fixed top-0 left-0 right-0 h-1 bg-amber-500 z-50" />
```

### DataChip
Small pill displaying a label + value. Monospace value. Border color matches status.
```
┌─────────────────┐
│ GNSS  ▸ 98.2%   │  ← cyan border, mono value
└─────────────────┘
```

### TelemetryCard
Rectangular card on navy-700 background. Title in small caps, value in large mono, trend sparkline below.
```
┌──────────────────────┐
│  ALTITUDE AGL         │  ← text-xs, uppercase, navy-100
│  3,247 m              │  ← text-xl, mono, cyan-500
│  ▁▂▃▄▅▆▇█▇▆▅         │  ← sparkline, cyan-400 @ 30% opacity
│  ↑ +12m/s             │  ← text-xs, status-active
└──────────────────────┘
```

### AIActionCard
Right panel feed item. Shows AI decision with timestamp, action type icon, and approval status.
```
┌──────────────────────────────┐
│ ⚡ NAV SOURCE SWITCH          │  ← action type
│ GNSS → TERCOM/TAN            │  ← detail, mono
│ Confidence: 0.34 → 0.91      │  ← before/after
│ 14:23:07.442  ✓ AUTO-APPROVED │  ← timestamp + status
└──────────────────────────────┘
```

### MITLGate
Modal overlay requiring operator confirmation before engagement. Red border, pulsing. Two buttons: AUTHORIZE (green) and ABORT (red). Countdown timer optional.

### NavStackIndicator
Horizontal bar showing all five navigation layers with their current confidence as fill percentage:
```
INS/IMU  ████████████████████  98%
GNSS     ██░░░░░░░░░░░░░░░░░░  12%  ← RED, jammed
TERCOM   ████████████████░░░░  82%  ← CYAN, active aiding
MagNav   ████████████░░░░░░░░  61%  ← CYAN
ScMatch  ██████████████████░░  91%  ← CYAN, primary
```

---

## Sphere Visual Language

### Point Size
- Base point size: 3px (at default zoom)
- Active/selected parameter: 6px with glow ring
- Hovered parameter: 5px with tooltip

### Point Color Encoding
```
Confidence 1.0+  → cyan-500 (#00E5FF)     nominal, on surface
Confidence 0.7   → cyan-300 (#33E8FF)     slight degradation
Confidence 0.5   → amber-500 (#C9A84C)    moderate degradation
Confidence 0.3   → status-warning (#FF6B35) significant
Confidence <0.1  → status-critical (#E24B4A) failure
Anomalous >1.2   → magenta (#FF00FF)       spoof indicator
```

### Reference Sphere
A faint wireframe icosphere at r=1.0 rendered behind the point cloud. `--sphere-wireframe` color. Provides spatial reference so viewers can see deformation relative to the nominal shape.

### Sphere Labels
Parameter names rendered as HTML overlays (not 3D text) positioned via CSS transforms from projected 3D coordinates. Font: JetBrains Mono, 10px, navy-100. Active labels: cyan-500.

### Connection Lines
Optional thin lines between related parameters (e.g., all GNSS-related points connected). Line opacity = average confidence of connected points. Creates visible "constellation" patterns.

---

## Animation Guidelines

- **Sphere point transitions:** 300ms ease-out for confidence changes. Never instant.
- **Panel collapse/expand:** 200ms ease-in-out via Framer Motion `layout` prop.
- **Scenario transitions:** 1.5s crossfade between scenarios.
- **Status LED blink:** Critical status blinks at 1Hz (500ms on, 500ms off).
- **Map flight path:** Animated dashed line, 2px, cyan-400.
- **Action feed new item:** Slide in from right, 250ms.

---

## Logo Rendering (Web)

The MK-// logo SVG paths are available in `assets/brand-tokens.ts`. Render as inline SVG:
- On dark backgrounds: MK in white (#FFFFFF), -// in cyan (#00E5FF)
- In TopBar: 32px height, left-aligned with 16px left padding
- In loading/splash: centered, 120px height, with fade-in animation

---

## Accessibility Notes

- Minimum contrast ratio 4.5:1 for body text (navy-100 on navy-800 = 4.8:1 ✓)
- Status colors always paired with icon or text label (never color alone)
- Keyboard navigable panels (Tab, Escape to close)
- Focus rings: 2px cyan-500 outline with 2px offset
