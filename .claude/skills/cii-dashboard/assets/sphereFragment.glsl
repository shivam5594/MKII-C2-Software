// Sphere Confidence Particle Fragment Shader
// Colors particles based on confidence level.
// Adds circular point shape and glow effect.

varying float vConfidence;
varying vec3 vGroupColor;
varying float vDistFromCenter;

uniform float uTime;

// MK-// brand colors as vec3
const vec3 CYAN = vec3(0.0, 0.898, 1.0);       // #00E5FF — nominal
const vec3 AMBER = vec3(0.788, 0.659, 0.298);   // #C9A84C — degraded
const vec3 WARNING = vec3(1.0, 0.42, 0.208);    // #FF6B35 — significant
const vec3 CRITICAL = vec3(0.886, 0.294, 0.29); // #E24B4A — failure
const vec3 ANOMALOUS = vec3(1.0, 0.0, 1.0);     // #FF00FF — spoof

void main() {
  // Circular point shape
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  // Soft edge
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Color based on confidence
  vec3 color;
  if (vDistFromCenter > 1.2) {
    // Anomalous — spoofed signal
    color = ANOMALOUS;
    // Pulsing effect for anomalous points
    alpha *= 0.7 + 0.3 * sin(uTime * 6.0);
  } else if (vConfidence >= 0.8) {
    color = CYAN;
  } else if (vConfidence >= 0.5) {
    color = mix(AMBER, CYAN, (vConfidence - 0.5) / 0.3);
  } else if (vConfidence >= 0.3) {
    color = mix(WARNING, AMBER, (vConfidence - 0.3) / 0.2);
  } else {
    color = mix(CRITICAL, WARNING, vConfidence / 0.3);
    // Critical points blink
    alpha *= 0.5 + 0.5 * step(0.5, fract(uTime * 1.0));
  }

  // Subtle glow halo
  float glow = exp(-dist * 4.0) * 0.3;
  color += glow * color;

  // Additive blending boost for bloom post-processing
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  if (luminance > 0.6) {
    color *= 1.2; // Push bright pixels for bloom pickup
  }

  gl_FragColor = vec4(color, alpha);
}
