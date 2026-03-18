# CII Autonomy Dashboard — MK-//

## Skills
Before starting any task, read the skill at `.claude/skills/cii-dashboard/SKILL.md` and the relevant reference files it points to.

## Project Context
This is the CII autonomy dashboard for MK-//, an Indian defense company building loitering munitions with GPS-denied navigation. The dashboard visualizes a five-layer navigation fusion stack and EW countermeasure AI using paired 3D confidence spheres.

## Rules
- Always read the skill's DESIGN_SYSTEM.md before writing any CSS or component
- Always read DATA_MODELS.md before creating any TypeScript interface
- Always read ARCHITECTURE.md before creating any new file
- Dark theme only. Background: #060A12 or #0A0E1A
- Cyan (#00E5FF) is primary accent. Amber (#C9A84C) is investor-tier only
- JetBrains Mono for all data/numbers. Inter for headings/body
- GPU shaders for sphere animation — never animate 500+ points on CPU
- No light mode. No lorem ipsum. No generic fonts
- All placeholder text uses real GNC/defense terminology
