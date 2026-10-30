# Architecture

Pixel Keep is a React/TypeScript browser game with a custom simulation loop. **Sekarrows** is the working title for the upcoming fortress-progression redesign. The GitHub repository, deployed URL, user-facing game title and save keys remain unchanged during this architecture-only patch.

## Source layout

```text
src/
├── main.tsx                       # Browser bootstrap
├── PixelKeep.tsx                  # Stable compatibility entry point
├── features/
│   └── defense/
│       └── PixelKeep.tsx          # Active game screen, simulation and UI
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
- **Feature:** `src/features/defense/PixelKeep.tsx` owns React state, pointer input, simulation orchestration, audio and composition for the current game.
- **Persistence:** `src/game/meta.ts` reads and writes the existing `pixelkeep-meta` localStorage key. Existing best-score and sound keys remain in the feature.

## Intentional limitations of the first cleanup

The feature component is **still large** and mixes simulation logic with screen composition. This first patch removes the duplicate, stale parallel implementations and creates a single source of truth for the data and reusable components. Splitting the simulation loop into a separate engine, extracting hooks and screens, introducing automated gameplay tests and adding strict linting are follow-up work. This patch does **not** claim those milestones are complete.

## Changes requiring care

- Do not silently rename localStorage keys or change existing save defaults.
- Treat `src/game/types.ts` and `src/game/state.ts` as a pair: the factory must initialize the complete required game state.
- The project uses a hand-authored pixel sprite format; preserve the cached rasterizer when refactoring rendering.
- The GitHub Pages base path remains `/Pixel-Keep/` until the repository is deliberately renamed.
- Run `npm run check` before merging; review a playable browser run for behavior-specific validation.

## Checks

```bash
npm install
npm run check
```

The `check` script runs TypeScript's `tsc --noEmit` and a Vite production build. A GitHub Actions workflow runs the same checks for pull requests.
