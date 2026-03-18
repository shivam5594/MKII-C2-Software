// Sphere Confidence Particle Vertex Shader
// Each vertex represents a navigation/EW parameter.
// aRadius controls radial distance from sphere center (data-driven).
// aConfidence drives color mixing in fragment shader.

attribute float aRadius;
attribute float aConfidence;
attribute float aPointSize;
attribute vec3 aGroupColor;

varying float vConfidence;
varying vec3 vGroupColor;
varying float vDistFromCenter;

uniform float uTime;
uniform float uBaseRadius;
uniform float uMinRadius;
uniform float uMaxRadius;
uniform float uPulseIntensity;

void main() {
  // Compute radial distance from confidence
  // confidence=1.0 → on sphere surface (uBaseRadius)
  // confidence=0.0 → at center (uMinRadius)
  // confidence>1.0 → outside sphere (anomalous)
  float r = mix(uMinRadius, uBaseRadius, clamp(aRadius, 0.0, 1.0));

  // Handle anomalous (>1.0) — extend beyond surface
  if (aRadius > 1.0) {
    r = uBaseRadius + (aRadius - 1.0) * uBaseRadius * 0.5;
    r = min(r, uMaxRadius);
  }

  // Subtle breathing animation
  float breath = sin(uTime * 0.5) * 0.02 * uPulseIntensity;
  r += breath;

  // Critical parameters pulse
  if (aConfidence < 0.3) {
    float pulse = sin(uTime * 3.14159) * 0.05;
    r += pulse;
  }

  // Compute final position along the vertex normal (radial direction)
  vec3 normalDir = normalize(position);
  vec3 finalPos = normalDir * r;

  // Point size: larger for critical, smaller for nominal
  float size = aPointSize;
  if (aConfidence < 0.3) {
    size *= 1.5; // Critical parameters are more visible
  }

  vConfidence = aConfidence;
  vGroupColor = aGroupColor;
  vDistFromCenter = r / uBaseRadius;

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Attenuate point size by distance from camera
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
