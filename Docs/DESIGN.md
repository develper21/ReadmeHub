# 🎨 Design System

## ReadMeAI – Dark Clay. Developer-First. AI-Powered.

This document defines the visual design system, UI components, and user experience guidelines for **ReadMeAI**. The goal is to create a modern, soft "clay" (neumorphism) interface that feels tactile and focused — a calm dark canvas where AI-generated content pops.

---

## 1. Design Principles

| | | |
|:---:|:---:|:---:|
| 🧑‍💻 **Developer-Centered**<br>Simple and intuitive for developers shipping projects. | 🧈 **Soft & Tactile (Clay)**<br>Neumorphic depth, rounded corners, no harsh edges. | ⚛️ **Consistent**<br>Follow a unified token system across every page. |

Supporting principles:
- **Content first** — the README preview is the hero of every screen
- **Calm dark canvas** — low-noise surfaces, accent color used sparingly for actions
- **Motion with meaning** — Framer Motion only for entrance/feedback, never decoration

## 2. Color Palette

Primary colors used across the application (HSL tokens from `src/index.css`).

### Dark Theme (default)

| Swatch | Token | Value | Usage |
|--------|-------|-------|-------|
| 🟩 | **Primary** | `hsl(160 45% 50%)` — `#16a97a` | Main brand color. Buttons, links, active states, gradients |
| 🟨 | **Accent** | `hsl(45 80% 55%)` — `#eab308` | Highlights, warnings-adjacent accents, "Pro" badges |
| ⬛ | **Background** | `hsl(160 20% 8%)` — `#0f1a17` | App canvas |
| ▦ | **Card** | `hsl(160 18% 12%)` — `#182420` | Cards, panels, popovers |
| ▫ | **Muted** | `hsl(160 15% 16%)` / `hsl(140 10% 55%)` | Secondary surfaces / secondary text |
| 🟥 | **Error** | `hsl(0 60% 45%)` — `#b91c1c` | Error messages, validation, destructive actions |
| ⬜ | **Border/Input** | `hsl(160 15% 18%)` | Subtle outlines, form fields |

### Light Theme

| Swatch | Token | Value | Usage |
|--------|-------|-------|-------|
| 🟩 | **Primary** | `hsl(160 45% 40%)` — `#15803d`-ish green | Main brand color |
| 🟨 | **Accent** | `hsl(45 90% 60%)` — `#facc15` | Accent highlights |
| ⬜ | **Background** | `hsl(140 20% 96%)` | App canvas |
| ▦ | **Card** | `hsl(140 25% 97%)` | Cards, panels |

### Gradients & Clay Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-hero` | `linear-gradient(135deg, hsl(160 45% 50%), hsl(140 50% 40%))` | Hero text-gradient, primary CTA backgrounds (`bg-hero`, `text-gradient`) |
| `--gradient-accent` | `linear-gradient(135deg, hsl(45 80% 55%), hsl(35 75% 45%))` | Accent gradient (`bg-accent-gradient`) |
| `--clay-shadow` | `8px 8px 16px dark, -4px -4px 12px light` | Raised clay cards (`clay`, `clay-sm`, `clay-lg`) |
| `--clay-shadow-pressed` | inset shadow pair | Pressed/active clay state (`clay-pressed`, `clay-inset`) |

> Radius scale: `--radius: 1.25rem` base (`rounded-xl = +4px`, `2xl = +8px`, `3xl = +16px`) — everything is soft and rounded.

## 3. Typography

We use **Space Grotesk** for display and **Nunito** for body — modern, geometric, and highly readable.

| | | | |
|---|---|---|---|
| **Aa** | **Space Grotesk**<br>Display / Headings<br>Font-display — 400–700 | **Aa** | **Nunito**<br>Body / UI Text<br>Font-body — 400–900 |

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Hero title | Space Grotesk | `text-4xl → 6xl` (36–60px) | Bold (700) |
| Section heading | Space Grotesk | `text-2xl / 3xl` (24–30px) | Semibold (600) |
| Card title | Space Grotesk | `text-lg / xl` (18–20px) | Semibold (600) |
| Body | Nunito | `text-base` (16px) | Regular (400) |
| Secondary text | Nunito | `text-sm` (14px) | Regular (400), `text-muted-foreground` |
| Buttons / labels | Nunito | `text-sm → base` | Semibold (600) |

## 4. UI Components

Standard components used throughout the application (shadcn/ui primitives, clay-themed).

### Buttons

| Variant | Style |
|---------|-------|
| **Primary** | `bg-hero` gradient, white text, rounded-full, clay shadow on hover |
| **Secondary** | `bg-secondary text-secondary-foreground`, soft clay surface |
| **Ghost** | Transparent, `hover:bg-muted` |
| **Destructive** | `bg-destructive` red, white text |
| **Accent** | `bg-accent-gradient`, amber gradient for Pro actions |

### Cards & Surfaces

| Component | Style |
|-----------|-------|
| Clay card | `.clay` / `.clay-sm` / `.clay-lg` — gradient surface + dual shadow |
| Pressed state | `.clay-pressed` inset shadow (selected/active) |
| Inset well | `.clay-inset` — inputs, progress wells, heatmap cells |
| Glass overlay | translucent `bg-card/80 backdrop-blur` for navbars/drawers |

### Form Controls

- **Input / Textarea** — `clay-inset` well, rounded-xl, focus ring in primary
- **Select / Combobox** — shadcn Select with clay surface
- **Checkbox / Switch** — rounded, primary when active

### Feedback

| Component | Usage |
|-----------|-------|
| **Toast** (sonner/shadcn) | Success = primary green, Error = destructive red |
| **Skeletons** | Clay shimmer while AI generates (never spinners alone) |
| **Progress** | Inset clay track + gradient fill (usage bars) |
| **Heatmap** | Contribution grid — muted → primary green scale |

### Markdown Preview

The generated README preview uses the same token system:
- Code blocks — inset dark well, mono font (system mono stack)
- Badges — rendered as-is from shields.io
- Headings — Space Grotesk with `text-gradient` accents on H1/H2

## 5. Layout & Spacing

- **Container** — centered, max-width `1400px`, 2rem padding
- **Spacing scale** — Tailwind default (4px base); cards use `p-6`, sections `gap-8`
- **Radii** — everything ≥ `rounded-xl`; pills for buttons/badges
- **Dark mode** — class-based (`darkMode: ["class"]`), `.dark` on `<html>`, default dark
