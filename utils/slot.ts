const INTERVAL = 300;
const BASE_TIMESTAMP = 1772568900;

let _nowOffsetMs = 0;

/**
 * Shift the "virtual now" used by all slot calculations.
 * --market +N  → N slots ahead of current
 * --market <ts> → align to that slot's start timestamp (seconds)
 */
export function setMarketOffset(arg: string) {
  if (arg.startsWith("+") || arg.startsWith("-")) {
    _nowOffsetMs = parseInt(arg) * INTERVAL * 1000;
  } else {
    const targetSec = parseInt(arg);
    const slotStart =
      BASE_TIMESTAMP +
      Math.floor((targetSec - BASE_TIMESTAMP) / INTERVAL) * INTERVAL;
    _nowOffsetMs = slotStart * 1000 - Date.now();
  }
}

/** offset: 0 = current slot, -1 = previous, 1 = next, etc. */
export function getSlotTS(offset = 0): { startTime: number; endTime: number } {
  const nowSec = Math.floor((Date.now() + _nowOffsetMs) / 1000);
  const slotTs =
    BASE_TIMESTAMP +
    Math.floor((nowSec - BASE_TIMESTAMP) / INTERVAL) * INTERVAL +
    offset * INTERVAL;
  return {
    startTime: slotTs * 1000,
    endTime: (slotTs + INTERVAL) * 1000,
  };
}
export type Slot = ReturnType<typeof getSlotTS>;

/** offset: 0 = current slot, -1 = previous, 1 = next, etc. */
export function getSlug(offset = 0) {
  const ts = getSlotTS(offset).startTime / 1000;
  return `btc-updown-5m-${ts}`;
}

/** Extract the Slot (startTime/endTime in ms) from a slug string. */
export function slotFromSlug(slug: string): Slot {
  const ts = parseInt(slug.split("-").at(-1)!);
  return { startTime: ts * 1000, endTime: (ts + INTERVAL) * 1000 };
}
