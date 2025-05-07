import { createHttp2App } from '../index';
import express from 'express';

describe('HTTP/2 Server', () => {
  test('createHttp2App should return an Express app', () => {
    const app = createHttp2App();
    expect(app).toBeDefined();
    // Check if it has Express app properties
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
    expect(typeof app.use).toBe('function');
  });
}); 