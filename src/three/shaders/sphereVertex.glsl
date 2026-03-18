// Confidence Sphere Vertex Shader
// Each vertex is on a unit icosphere. aRadius drives radial deformation.
// radius=1.0 → on surface (nominal). <1.0 → crater inward. >1.0 → AI push outward.

attribute float aRadius;
attribute float aConfidence;
attribute float aPointSize;
attribute vec3 aGroupColor;

varying float vConfidence;
varying vec3 vGroupColor;
varying float vRadius;
varying vec3 vNormal;

uniform float uTime;
uniform float uBaseRadius;

void main() {
  vec3 normalDir = normalize(position);

  // Radial distance: aRadius maps confidence to surface deformation
  float r = aRadius * uBaseRadius;

  // Subtle breathing
  float breath = sin(uTime * 0.5) * 0.008;
  r += breath;

  vec3 finalPos = normalDir * r;

  vConfidence = aConfidence;
  vGroupColor = aGroupColor;
  vRadius = aRadius;
  vNormal = normalDir;

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aPointSize * (50.0 / -mvPosition.z);
}
