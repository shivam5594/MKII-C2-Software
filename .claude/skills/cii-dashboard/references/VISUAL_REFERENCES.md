# CII Dashboard — Visual Reference Index

## Tier 1 References (Study These First)

### Anduril Lattice UI Screenshots
- **Asset tasking interface:** `developer.anduril.com/guides/tasks/listen` — left Assets panel, task dropdown, Execute Task button
- **Entity map visualizer:** `developer.anduril.com/samples/overview` — dark map, entity markers by type
- **Wind River integration:** `windriver.com/blog/Accelerating-Safety-Critical-Innovation-Wind-River-Anduril` — 14 screenshots including flight path overlays

### Palantir AIP Defense Demo
- **Main interface:** Dark map + right-side chat panel
- **Course-of-action cards:** AI generates 3 tactical options with risk assessment
- **ResearchGate labeled diagram:** `researchgate.net/figure/Palantir-AIP-interface-a-a-Source-Video-screenshot-from-Palantir-Palantir-AIP-for_fig4/381034070`

### Three.js Sphere References
- **Interactive Particle Sphere:** `codepen.io/VoXelo/pen/PwYJdVG` — dual-layer, ShaderMaterial, mouse-reactive
- **Morphing sphere:** `fjolt.com/article/javascript-three-js-morphing-sphere` — per-vertex noise displacement
- **Twisted spheres (Codrops):** `tympanus.net/codrops/2021/01/26/twisted-colorful-spheres-with-three-js/`
- **R3F particles tutorial:** `blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/`
- **FBO transitions:** `blog.loopspeed.co.uk/fbo-particles-simulation`

### Defense UX Firm Portfolios
- **Visual Logic:** `visuallogic.com/military-ux/` — Raytheon Patriot, Counter-UAS, EW dashboards
- **Merkur Design:** `merkurdesign.com/discovery/ux-ui-design-approach-in-human-machine-interfaces-within-the-defence-industry`

---

## Tier 2 References (Specific Components)

### Map Styling
- **Carto Dark Matter:** `basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` (free, no key)

### Sphere Math & Libraries
- **icomesh:** `github.com/mourner/icomesh` — fast icosphere generation
- **Spherical Harmonics visualizer:** `ed.ilogues.com/2016/02/19/interactive-spherical-harmonic-visualization`

### R3F Packages
- **particle-morph:** `github.com/mmdalipour/particle-morph`
- **r3f-particle-field:** `github.com/brettlyne/r3f-particle-field`

### Design Concepts
- **Behance "DroneOps":** Military drone dashboard concept
- **Behance "SWARM OS":** UAV swarm control interface
- **Dribbble military-ui:** `dribbble.com/tags/military-ui`

---

## Design Patterns to Follow

1. Dark-themed, map-centric canvas
2. Left panel = assets/state, right panel = actions/decisions
3. AI recommends, human approves
4. Single-operator, multi-asset
5. Explicit HITL gates
6. Sensor fusion as togglable layers
7. Monospace for data, sans-serif for labels
8. Status: cyan=nominal, amber=caution, red=critical, magenta=anomalous
9. Classification bar on every view
10. Configurable autonomy levels (future)
