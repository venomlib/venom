import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setLogger,
  getLogger,
  log,
  logInfo,
  logSuccess,
  logFail,
  logWarn,
  type LoggerFunction
} from '../../../src/utils/logger.js';

describe('logger', () => {
  let mockLogger: LoggerFunction;

  beforeEach(() => {
    mockLogger = vi.fn();
    setLogger(null); // Reset to default logger
  });

  describe('setLogger / getLogger', () => {
    it('should set a custom logger', () => {
      setLogger(mockLogger);
      expect(getLogger()).toBe(mockLogger);
    });

    it('should reset to default logger when null is passed', () => {
      setLogger(mockLogger);
      setLogger(null);
      const defaultLogger = getLogger();
      expect(defaultLogger).not.toBe(mockLogger);
    });
  });

  describe('log', () => {
    it('should call custom logger with message and level', () => {
      setLogger(mockLogger);
      log('test message', 'info');
      expect(mockLogger).toHaveBeenCalledWith('test message', 'info');
    });

    it('should default to info level', () => {
      setLogger(mockLogger);
      log('test message');
      expect(mockLogger).toHaveBeenCalledWith('test message', 'info');
    });
  });

  describe('level-specific functions', () => {
    beforeEach(() => {
      setLogger(mockLogger);
    });

    it('logInfo should call with info level', () => {
      logInfo('info message');
      expect(mockLogger).toHaveBeenCalledWith('info message', 'info');
    });

    it('logSuccess should call with success level', () => {
      logSuccess('success message');
      expect(mockLogger).toHaveBeenCalledWith('success message', 'success');
    });

    it('logFail should call with fail level', () => {
      logFail('fail message');
      expect(mockLogger).toHaveBeenCalledWith('fail message', 'fail');
    });

    it('logWarn should call with warn level', () => {
      logWarn('warn message');
      expect(mockLogger).toHaveBeenCalledWith('warn message', 'warn');
    });
  });

  describe('default logger', () => {
    it('should log to console with prefix', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      setLogger(null);

      log('test message', 'info');
      expect(consoleSpy).toHaveBeenCalledWith('[INFO] test message');

      log('success!', 'success');
      expect(consoleSpy).toHaveBeenCalledWith('[SUCCESS] success!');

      log('failed!', 'fail');
      expect(consoleSpy).toHaveBeenCalledWith('[FAIL] failed!');

      log('warning!', 'warn');
      expect(consoleSpy).toHaveBeenCalledWith('[WARN] warning!');

      consoleSpy.mockRestore();
    });
  });
});
