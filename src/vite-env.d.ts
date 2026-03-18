/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPPLS_KEY: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.glsl' {
  const value: string
  export default value
}

declare module 'icomesh' {
  export default function icomesh(order: number): {
    vertices: Float32Array
    triangles: Uint16Array | Uint32Array
  }
}
