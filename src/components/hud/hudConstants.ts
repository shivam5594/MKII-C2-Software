// HUD overlay shared constants — Garmin G1000/G3000 aviation standard
export const HUD_GREEN = '#00FF00'           // Primary symbology (standard aviation green)
export const HUD_GREEN_DIM = 'rgba(0, 255, 0, 0.5)'
export const HUD_AMBER = '#FFAA00'           // Warnings / VS descend
export const HUD_RED = '#FF0000'             // Critical
export const HUD_WHITE = '#FFFFFF'           // Secondary labels
export const HUD_BG = 'rgba(0, 0, 0, 0.55)' // Value box backgrounds
export const HUD_OUTLINE = 'rgba(0, 0, 0, 0.7)' // Dark outline for contrast over any map
export const HUD_FONT = "'JetBrains Mono', monospace"

// Stroke shadow filter ID (defined once in HudOverlay)
export const HUD_SHADOW_FILTER = 'hud-shadow'

// Scaling factors
export const PITCH_PX_PER_DEG = 5      // pixels per degree pitch
export const IAS_PX_PER_KT = 3.5       // pixels per knot
export const ALT_PX_PER_M = 0.6        // pixels per meter altitude
export const HDG_PX_PER_DEG = 5        // pixels per degree heading
