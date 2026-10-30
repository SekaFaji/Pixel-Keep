import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { META_DEFAULT } from "../src/game/meta";
import { PauseOverlay, ConfirmQuitOverlay, ArmoryOverlay } from "../src/features/defense/ui/GameOverlays";

test("pause overlay preserves actions and explanatory copy", () => {
  const markup = renderToStaticMarkup(React.createElement(PauseOverlay, {
    onResume: () => {},
    onMainMenu: () => {},
  }));
  assert.match(markup, /PAUSED/);
  assert.match(markup, /RESUME/);
  assert.match(markup, /MAIN MENU/);
});

test("quit confirmation still explains the consequences", () => {
  const markup = renderToStaticMarkup(React.createElement(ConfirmQuitOverlay, {
    onKeepDefending: () => {},
    onQuitToMenu: () => {},
  }));
  assert.match(markup, /LEAVE THIS RUN/);
  assert.match(markup, /KEEP DEFENDING/);
  assert.match(markup, /QUIT TO MENU/);
});

test("armory lists permanent upgrades without needing a running game", () => {
  const markup = renderToStaticMarkup(React.createElement(ArmoryOverlay, {
    meta: { ...META_DEFAULT },
    buyMeta: () => {},
    onClose: () => {},
  }));
  assert.match(markup, /THE ARMORY/);
  assert.match(markup, /REINFORCED WALLS/);
  assert.match(markup, /CLOSE/);
});
