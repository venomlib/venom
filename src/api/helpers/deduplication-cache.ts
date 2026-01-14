import { AckType } from '../model/enum/index.js';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // Clean up every minute

interface CacheEntry {
  id: AckType | string;
  timestamp: number;
}

export class DeduplicationCache {
  private cache: Map<string, CacheEntry>;
  private ttlMs: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    this.cache = new Map();
    this.ttlMs = ttlMs;
    this.startCleanupTimer();
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.removeExpired();
    }, CLEANUP_INTERVAL_MS);

    // Don't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  private removeExpired() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  add(id: AckType | string, serialized: string): boolean {
    const existing = this.cache.get(serialized);

    if (existing) {
      // Update existing entry
      existing.id = id;
      existing.timestamp = Date.now();
      return false;
    }

    this.cache.set(serialized, {
      id,
      timestamp: Date.now()
    });
    return true;
  }

  has(id: AckType | string, serialized: string): boolean {
    const entry = this.cache.get(serialized);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(serialized);
      return false;
    }

    return entry.id === id;
  }

  get(serialized: string): CacheEntry | undefined {
    const entry = this.cache.get(serialized);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(serialized);
      return undefined;
    }

    return entry;
  }

  updateId(serialized: string, newId: AckType | string): boolean {
    const entry = this.cache.get(serialized);
    if (!entry) {
      return false;
    }

    entry.id = newId;
    entry.timestamp = Date.now();
    return true;
  }

  dispose() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

// Backwards compatibility alias
export { DeduplicationCache as callbackWile };
