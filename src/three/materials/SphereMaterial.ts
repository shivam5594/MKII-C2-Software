import * as THREE from 'three'
import sphereVertexShader from '../shaders/sphereVertex.glsl?raw'
import sphereFragmentShader from '../shaders/sphereFragment.glsl?raw'

export function createSphereMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: sphereVertexShader,
    fragmentShader: sphereFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uBaseRadius: { value: 1.0 },
    },
    transparent: true,
    depthWrite: true,
    blending: THREE.NormalBlending,
  })
}
