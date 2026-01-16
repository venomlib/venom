import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeduplicationCache } from '../../../src/api/helpers/deduplication-cache.js';

describe('DeduplicationCache', () => {
  let cache: DeduplicationCache;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (cache) {
      cache.dispose();
    }
    vi.useRealTimers();
  });

  describe('add', () => {
    it('should add new entries and return true', () => {
      cache = new DeduplicationCache();
      const result = cache.add('msg1', 'serialized-content-1');
      expect(result).toBe(true);
    });

    it('should return false for duplicate entries', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'serialized-content-1');
      const result = cache.add('msg2', 'serialized-content-1');
      expect(result).toBe(false);
    });

    it('should update existing entry id on duplicate', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'serialized-content-1');
      cache.add('msg2', 'serialized-content-1');
      const entry = cache.get('serialized-content-1');
      expect(entry?.id).toBe('msg2');
    });
  });

  describe('has', () => {
    it('should return true when entry exists with matching id', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'serialized-content-1');
      expect(cache.has('msg1', 'serialized-content-1')).toBe(true);
    });

    it('should return false when entry exists with different id', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'serialized-content-1');
      expect(cache.has('msg2', 'serialized-content-1')).toBe(false);
    });

    it('should return false when entry does not exist', () => {
      cache = new DeduplicationCache();
      expect(cache.has('msg1', 'nonexistent')).toBe(false);
    });
  });

  describe('get', () => {
    it('should return entry when it exists', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'serialized-content-1');
      const entry = cache.get('serialized-content-1');
      expect(entry).toBeDefined();
      expect(entry?.id).toBe('msg1');
    });

    it('should return undefined when entry does not exist', () => {
      cache = new DeduplicationCache();
      expect(cache.get('nonexistent')).toBeUndefined();
    });
  });

  describe('updateId', () => {
    it('should update the id of an existing entry', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'serialized-content-1');
      const result = cache.updateId('serialized-content-1', 'msg2');
      expect(result).toBe(true);
      expect(cache.get('serialized-content-1')?.id).toBe('msg2');
    });

    it('should return false when entry does not exist', () => {
      cache = new DeduplicationCache();
      const result = cache.updateId('nonexistent', 'msg1');
      expect(result).toBe(false);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      const ttlMs = 1000;
      cache = new DeduplicationCache(ttlMs);
      cache.add('msg1', 'serialized-content-1');

      expect(cache.get('serialized-content-1')).toBeDefined();

      vi.advanceTimersByTime(ttlMs + 100);

      expect(cache.get('serialized-content-1')).toBeUndefined();
    });

    it('should expire entries checked via has()', () => {
      const ttlMs = 1000;
      cache = new DeduplicationCache(ttlMs);
      cache.add('msg1', 'serialized-content-1');

      vi.advanceTimersByTime(ttlMs + 100);

      expect(cache.has('msg1', 'serialized-content-1')).toBe(false);
    });
  });

  describe('dispose', () => {
    it('should clear all entries', () => {
      cache = new DeduplicationCache();
      cache.add('msg1', 'content1');
      cache.add('msg2', 'content2');
      cache.dispose();
      expect(cache.get('content1')).toBeUndefined();
      expect(cache.get('content2')).toBeUndefined();
    });
  });
});
