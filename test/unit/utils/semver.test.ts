import { describe, it, expect } from 'vitest';
import { upToDate } from '../../../src/utils/semver.js';

describe('upToDate', () => {
  describe('valid semantic versions', () => {
    it('should return true when versions are equal', () => {
      expect(upToDate('1.0.0', '1.0.0')).toBe(true);
      expect(upToDate('2.3.4', '2.3.4')).toBe(true);
    });

    it('should return true when local is newer (major)', () => {
      expect(upToDate('2.0.0', '1.0.0')).toBe(true);
      expect(upToDate('10.0.0', '9.0.0')).toBe(true);
    });

    it('should return true when local is newer (minor)', () => {
      expect(upToDate('1.2.0', '1.1.0')).toBe(true);
      expect(upToDate('1.10.0', '1.9.0')).toBe(true);
    });

    it('should return true when local is newer (patch)', () => {
      expect(upToDate('1.0.2', '1.0.1')).toBe(true);
      expect(upToDate('1.0.10', '1.0.9')).toBe(true);
    });

    it('should return false when local is older', () => {
      expect(upToDate('1.0.0', '2.0.0')).toBe(false);
      expect(upToDate('1.0.0', '1.1.0')).toBe(false);
      expect(upToDate('1.0.0', '1.0.1')).toBe(false);
    });
  });

  describe('partial versions', () => {
    it('should handle two-part versions', () => {
      expect(upToDate('1.0', '1.0')).toBe(true);
      expect(upToDate('1.1', '1.0')).toBe(true);
      expect(upToDate('1.0', '1.1')).toBe(false);
    });

    it('should handle single-part versions', () => {
      expect(upToDate('2', '1')).toBe(true);
      expect(upToDate('1', '2')).toBe(false);
      expect(upToDate('1', '1')).toBe(true);
    });

    it('should compare mixed partial versions correctly', () => {
      expect(upToDate('1.0.0', '1.0')).toBe(true);
      expect(upToDate('1.0', '1.0.0')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty strings', () => {
      expect(upToDate('', '1.0.0')).toBe(false);
      expect(upToDate('1.0.0', '')).toBe(false);
      expect(upToDate('', '')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(upToDate(null as unknown as string, '1.0.0')).toBe(false);
      expect(upToDate('1.0.0', undefined as unknown as string)).toBe(false);
    });

    it('should handle non-semver strings with string comparison', () => {
      expect(upToDate('abc', 'abc')).toBe(true);
      expect(upToDate('b', 'a')).toBe(true);
      expect(upToDate('a', 'b')).toBe(false);
    });
  });
});
