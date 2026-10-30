/**
 * Sekarrow browser save storage.
 *
 * The game was formerly published as Pixel Keep on the same GitHub Pages
 * origin. Read the old keys once when the new ones are absent, then store
 * values under the current product name without discarding existing saves.
 * Legacy key names are deliberately kept here only for migration.
 */
const CURRENT_KEYS = {
  meta: "sekarrow-meta",
  best: "sekarrow-best",
  sound: "sekarrow-sound",
  howto: "sekarrow-howto",
} as const;

const LEGACY_KEYS = {
  meta: "pixelkeep-meta",
  best: "pixelkeep-best",
  sound: "pixelkeep-sound",
  howto: "pixelkeep-howto",
} as const;

export type SaveKey = keyof typeof CURRENT_KEYS;

export type StorageAdapter = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): StorageAdapter | undefined {
  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function readSave(key: SaveKey, storage: StorageAdapter | undefined = browserStorage()): string | null {
  if (!storage) return null;
  try {
    const current = storage.getItem(CURRENT_KEYS[key]);
    if (current !== null) return current;
    const legacy = storage.getItem(LEGACY_KEYS[key]);
    if (legacy !== null) {
      try {
        storage.setItem(CURRENT_KEYS[key], legacy);
      } catch {
        // Storage may be read-only: still return the existing saved value.
      }
    }
    return legacy;
  } catch {
    return null;
  }
}

export function writeSave(key: SaveKey, value: string, storage: StorageAdapter | undefined = browserStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(CURRENT_KEYS[key], value);
  } catch {
    // Browsers may deny storage in private or sandboxed contexts.
  }
}
