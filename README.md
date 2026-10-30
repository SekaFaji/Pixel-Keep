# Pixel Keep — Tap Defender

**Sekarrows** is the working title for the next design iteration: a small fortress-defense game focused on visually upgrading a keep between sieges. This repository currently contains the playable **Pixel Keep** prototype. The gameplay redesign has **not** been implemented yet.

**[Play the browser demo](https://sekafaji.github.io/Pixel-Keep/)** · [Architecture](docs/ARCHITECTURE.md)

## Current game

Defend a pixel-art castle by holding and dragging to aim your arrows. Survive escalating enemy waves, earn gold, improve your defenses and face bosses every fifth wave.

The existing prototype includes:

- Direct arrow aiming alongside automatic turrets, archers and anti-tunneler defenses.
- Enemy variants, bosses, wave modifiers and combat effects.
- In-run upgrades, permanent progression and a castle courtyard.
- A responsive browser UI with locally stored progression.

These features describe the **current prototype**, not promises for the Sekarrows redesign.

## Run locally

Requires a recent Node.js LTS version (Node 20+ recommended).

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run typecheck` | Run TypeScript checks without generating files |
| `npm run test` | Run combat, input and enemy-data regression tests |
| `npm run build` | Build the production web app |
| `npm run check` | Type-check, test and build |
| `npm run preview` | Preview a built app locally |

A GitHub Actions workflow runs `npm run check` on pull requests and pushes to `main`.

The `tests/` directory contains regression coverage for input mapping, wave startup, pause behavior, new-game state and enemy data. It is a starting point rather than full gameplay coverage.

## Controls

- **Hold and drag** in the battlefield to aim and fire arrows.
- **Shop / Upgrades** to browse purchases; opening panels pauses combat.
- **Next wave** after clearing the current wave.
- **Pause** to interrupt a run.

## Project structure

```text
src/
├── main.tsx                    # React bootstrap
├── PixelKeep.tsx               # Stable entry point
├── features/defense/
│   ├── PixelKeep.tsx           # Game screen and UI
│   ├── combat/controller.ts    # Combat rules and wave lifecycle
│   ├── input/defenseInput.ts   # Pointer input and coordinates
│   ├── audio/useGameAudio.ts   # Web Audio effects
│   └── useGameLoop.ts          # Animation frame scheduler
├── game/
│   ├── types.ts                # Game types
│   ├── sprites.ts              # Pixel art data
│   ├── config.ts               # World and camera constants
│   ├── enemies.ts              # Enemy behavior and stats
│   ├── state.ts                # New game state
│   └── meta.ts                 # Permanent upgrades and persistence
└── components/                 # Reusable pixel UI components
```

The app uses **React, TypeScript, Vite and Tailwind CSS**, with a custom simulation loop rather than a separate game engine. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries, refactor decisions and remaining technical debt.

## Development direction

The upcoming **Sekarrows** design is centered on fortress progression: start with a vulnerable outpost, earn resources through defense and visibly develop stronger walls and defensive structures. This direction is still being planned. The first engineering step is to remove duplicated source and establish a reliable build baseline.

## Project status

**Playable prototype / architecture refactor.** This is an independent learning and portfolio project by SekaFaji Games. The architecture has been modularized in stages; the main gameplay feature remains large and UI-heavy. Focused regression tests cover core invariants, but not full gameplay or browser behavior.

The GitHub Pages URL, Vite base path and existing browser save keys are intentionally unchanged during the structural cleanup.

© SekaFaji Games. No reuse license has been granted by this README.
