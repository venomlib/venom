import { describe, it, expect } from 'vitest';
import { filenameFromMimeType } from '../../../src/api/helpers/filename-from-mimetype.js';

describe('filenameFromMimeType', () => {
  it('should return original filename when extensions match', () => {
    expect(filenameFromMimeType('photo.jpg', 'image/jpeg')).toBe('photo.jpg');
    expect(filenameFromMimeType('document.pdf', 'application/pdf')).toBe(
      'document.pdf'
    );
    expect(filenameFromMimeType('image.png', 'image/png')).toBe('image.png');
  });

  it('should change extension when mime type differs', () => {
    expect(filenameFromMimeType('photo.jpg', 'image/png')).toBe('photo.png');
    expect(filenameFromMimeType('file.txt', 'application/pdf')).toBe('file.pdf');
  });

  it('should handle filenames without extension', () => {
    expect(filenameFromMimeType('photo', 'image/jpeg')).toBe('photo.jpg');
    expect(filenameFromMimeType('document', 'application/pdf')).toBe(
      'document.pdf'
    );
  });

  it('should return original filename when mime type has no known extension', () => {
    expect(filenameFromMimeType('file.dat', 'application/x-unknown')).toBe(
      'file.dat'
    );
  });

  it('should handle audio and video mime types', () => {
    expect(filenameFromMimeType('audio.wav', 'audio/mpeg')).toBe('audio.mpga');
    expect(filenameFromMimeType('video.avi', 'video/mp4')).toBe('video.mp4');
  });

  it('should handle WebP images', () => {
    expect(filenameFromMimeType('image.jpg', 'image/webp')).toBe('image.webp');
  });
});
