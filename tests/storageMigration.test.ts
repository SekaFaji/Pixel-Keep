import { test } from "node:test";
import assert from "node:assert/strict";
import { readSave, writeSave, type StorageAdapter } from "../src/game/storage";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage: StorageAdapter = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  return { storage, values };
}

test("renamed game migrates every existing Pixel Keep save value", () => {
  const fixtures = [
    ["meta", "pixelkeep-meta", "sekarrow-meta", '{"gold":45,"rubies":2}'],
    ["best", "pixelkeep-best", "sekarrow-best", "123"],
    ["sound", "pixelkeep-sound", "sekarrow-sound", "off"],
    ["howto", "pixelkeep-howto", "sekarrow-howto", "1"],
  ] as const;
  for (const [key, oldKey, newKey, value] of fixtures) {
    const { storage, values } = memoryStorage({ [oldKey]: value });
    assert.equal(readSave(key, storage), value);
    assert.equal(values.get(newKey), value);
    assert.equal(values.get(oldKey), value, "legacy saves are not deleted");
  }
});

test("new Sekarrow value takes precedence over old progress", () => {
  const { storage, values } = memoryStorage({
    "pixelkeep-best": "11",
    "sekarrow-best": "250",
  });
  assert.equal(readSave("best", storage), "250");
  assert.equal(values.get("sekarrow-best"), "250");
});

test("missing keys are not invented", () => {
  const { storage, values } = memoryStorage();
  assert.equal(readSave("meta", storage), null);
  assert.equal(values.size, 0);
});

test("new saves are written only under Sekarrow keys", () => {
  const { storage, values } = memoryStorage();
  writeSave("howto", "1", storage);
  assert.equal(values.get("sekarrow-howto"), "1");
  assert.equal(values.has("pixelkeep-howto"), false);
});

test("read-only browser storage can still load legacy saves", () => {
  const storage: StorageAdapter = {
    getItem: (key) => key === "pixelkeep-meta" ? '{"gold":8}' : null,
    setItem: () => { throw new Error("Storage denied"); },
  };
  assert.equal(readSave("meta", storage), '{"gold":8}');
  assert.doesNotThrow(() => writeSave("meta", "{}", storage));
});

test("private or sandboxed storage does not crash game startup", () => {
  const storage: StorageAdapter = {
    getItem: () => { throw new Error("Storage unavailable"); },
    setItem: () => { throw new Error("Storage unavailable"); },
  };
  assert.equal(readSave("sound", storage), null);
  assert.doesNotThrow(() => writeSave("sound", "off", storage));
});
