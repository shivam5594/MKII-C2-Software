// Confidence Sphere Fragment Shader
// Clean dots with confidence-based coloring.
// Nominal = cyan. Degraded = amber→red. AI push (>1.0) = green.

varying float vConfidence;
varying vec3 vGroupColor;
varying float vRadius;
varying vec3 vNormal;

uniform float uTime;

const vec3 CYAN = vec3(0.0, 0.898, 1.0);       // #00E5FF — nominal
const vec3 AMBER = vec3(0.788, 0.659, 0.298);   // #C9A84C — degraded
const vec3 WARNING = vec3(1.0, 0.42, 0.208);    // #FF6B35 — significant
const vec3 CRITICAL = vec3(0.886, 0.294, 0.29); // #E24B4A — failure
const vec3 ANOMALOUS = vec3(1.0, 0.0, 1.0);     // #FF00FF — spoof
const vec3 AI_PUSH = vec3(0.0, 1.0, 0.533);     // #00FF88 — AI response boost

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.45) discard;

  float alpha = 1.0 - smoothstep(0.38, 0.45, dist);

  vec3 color;

  if (vRadius > 1.05) {
    // AI is pushing this point outward — distinct green
    color = AI_PUSH;
  } else if (vRadius > 1.2) {
    // Anomalous / spoof
    color = ANOMALOUS;
    alpha *= 0.7 + 0.3 * sin(uTime * 6.0);
  } else if (vConfidence >= 0.8) {
    color = CYAN;
  } else if (vConfidence >= 0.5) {
    color = mix(AMBER, CYAN, (vConfidence - 0.5) / 0.3);
  } else if (vConfidence >= 0.3) {
    color = mix(WARNING, AMBER, (vConfidence - 0.3) / 0.2);
  } else {
    color = mix(CRITICAL, WARNING, vConfidence / 0.3);
    alpha *= 0.5 + 0.5 * step(0.5, fract(uTime * 1.0));
  }

  gl_FragColor = vec4(color, alpha);
}
