import { describe, it, expect } from 'vitest';
import { base64MimeType } from '../../../src/api/helpers/base64-mimetype.js';

describe('base64MimeType', () => {
  it('should extract mime type from valid data URI', () => {
    expect(base64MimeType('data:image/png;base64,iVBORw0KGgo=')).toBe(
      'image/png'
    );
    expect(base64MimeType('data:image/jpeg;base64,/9j/4AAQ=')).toBe(
      'image/jpeg'
    );
    expect(base64MimeType('data:application/pdf;base64,JVBERi0=')).toBe(
      'application/pdf'
    );
  });

  it('should handle mime types with special characters', () => {
    expect(base64MimeType('data:image/svg+xml;base64,PHN2Zz4=')).toBe(
      'image/svg+xml'
    );
    expect(
      base64MimeType('data:application/vnd.ms-excel;base64,UEsDBBQ=')
    ).toBe('application/vnd.ms-excel');
  });

  it('should return null for invalid inputs', () => {
    expect(base64MimeType('')).toBe(null);
    expect(base64MimeType('not a data uri')).toBe(null);
    expect(base64MimeType('data:;base64,abc')).toBe(null);
  });

  it('should return null for non-string inputs', () => {
    expect(base64MimeType(null as unknown as string)).toBe(null);
    expect(base64MimeType(undefined as unknown as string)).toBe(null);
    expect(base64MimeType(123 as unknown as string)).toBe(null);
    expect(base64MimeType({} as unknown as string)).toBe(null);
  });

  it('should handle data URIs without base64 encoding marker', () => {
    expect(base64MimeType('data:text/plain,Hello')).toBe('text/plain');
  });
});
