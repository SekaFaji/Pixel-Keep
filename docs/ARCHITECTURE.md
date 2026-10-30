# Architecture

Pixel Keep is a React/TypeScript browser game with a custom simulation loop. **Sekarrows** is the working title for the upcoming fortress-progression redesign. The GitHub repository, deployed URL, user-facing game title and save keys remain unchanged during this architecture-only patch.

## Source layout

```text
src/
├── main.tsx                       # Browser bootstrap
├── PixelKeep.tsx                  # Stable compatibility entry point
├── features/
│   └── defense/
│       ├── PixelKeep.tsx          # Active game screen and UI composition
│       ├── useGameLoop.ts         # Animation frame scheduler
│       ├── combat/controller.ts   # Combat simulation and wave lifecycle
│       ├── input/defenseInput.ts  # Pointer handling and coordinate mapping
│       └── audio/useGameAudio.ts  # Web Audio sound effects
├── game/
│   ├── types.ts                   # Shared game and save-state types
│   ├── sprites.ts                 # Pixel art source data
│   ├── config.ts                  # World layout and camera configuration
│   ├── enemies.ts                 # Enemy catalog, scaling and selection
│   ├── state.ts                   # New-run state factory
│   └── meta.ts                    # Permanent progression and persistence
└── components/
    ├── PixelSprite.tsx            # Cached sprite rasterizer
    ├── PixButton.tsx              # Shared pixel-style button
    └── UpgradeCard.tsx            # Shared upgrade card
```

## Runtime boundaries

- **Game data:** type definitions, enemy data, world configuration and sprite source live in `src/game`. They do not import React.
- **Presentation:** shared visual components live in `src/components`. They should not own combat rules or persistence.
- **Feature:** `src/features/defense/PixelKeep.tsx` owns UI state and composition; its frame driver, imperative combat controller, input adapter and Web Audio hook live in their own modules.
- **Simulation:** `src/features/defense/combat/controller.ts` uses injected mutable references and callbacks to avoid coupling combat rules to React.
- **Input:** pure coordinate helpers are exported alongside the pointer event adapters so they can be independently tested.
- **Persistence:** `src/game/meta.ts` reads and writes the existing `pixelkeep-meta` localStorage key. Existing best-score and sound keys remain in the feature.

## Intentional limitations of the first cleanup

The screen component is **still large** and includes purchases, upgrade definitions and multiple menus. The simulation and frame scheduler are now extracted, but the combat controller is still imperative and uses injected callbacks. Further decomposition of UI, isolating state transitions, expanding automated tests, adding strict linting, and improving dependency locking remain follow-up work. No visual or mechanical redesign is part of this patch.

## Changes requiring care

- Do not silently rename localStorage keys or change existing save defaults.
- Treat `src/game/types.ts` and `src/game/state.ts` as a pair: the factory must initialize the complete required game state.
- The project uses a hand-authored pixel sprite format; preserve the cached rasterizer when refactoring rendering.
- The GitHub Pages base path remains `/Pixel-Keep/` until the repository is deliberately renamed.
- Run `npm run check` before merging; the CI command now runs type checking, Node-based TypeScript regression tests and the production build. Review a playable browser run for behavior-specific validation.

## Checks

```bash
npm install
npm run check
```

The `check` script runs TypeScript's `tsc --noEmit`, regression tests using `tsx --test`, and a Vite production build. A GitHub Actions workflow runs the same checks for pull requests.
