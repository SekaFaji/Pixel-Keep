# 🏰 Pixel Keep — Tap Defender

A pixel-art tap defense game by **SekaFaji Games**. Hold the keep: every invader — goblin, orc, or croissant — wants your gate down.

## Play it

Live build on GitHub Pages: https://sekafaji.github.io/Pixel-Keep/

## Run it locally

```bash
npm install
npm run dev
```

## How to play

- **Hold / drag anywhere** on the field to rain arrows from the castle
- Arrows fly their full range past your aim — red arrows are distance crits (2× range)
- Buy **turrets** (anti-air), **archers** (anti-ground) and **earthworm turrets** — the only unit that can hit tunnelers
- Bosses arrive every 5th wave: Dragon, Croissant King, Crêpe Wraith, Muffin Colossus, Baguette Baron
- 44 enemy breeds: goblins, orcs, knights, the undead (skeletons, zombies, ghosts), beasts (spiders, yetis, scorpions, harpies), the Bakery Legion (croissants, baguettes, donuts, macarons, churros, éclairs…) and tunnelers (moles, grubs, deathworms)
- The map widens every wave — FORTIFY grows your keep
- Rubies drop from bosses; spend them on speed toggles, auto shoot & auto next

## Project structure

```
src/
├── PixelKeep.tsx              # main game component
├── game/
│   ├── sprites.ts             # all pixel-art sprites
│   ├── enemies.ts              # enemy stats, spawn rules, bosses
│   ├── types.ts                # shared type definitions
│   ├── config.ts               # positions, camera, world dressing
│   ├── state.ts                # initial game state
│   └── meta.ts                 # meta-progression & shop data
└── components/
    ├── PixelSprite.tsx         # sprite renderer
    ├── PixButton.tsx           # pixel button
    └── UpgradeCard.tsx         # shop upgrade card
```

## Tech

React + TypeScript + Vite + Tailwind CSS. No game engine — hand-rolled game loop.

© SekaFaji Games.
