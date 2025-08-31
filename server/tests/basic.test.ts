import { describe, test, expect } from '@jest/globals';

describe('Basic Test Suite', () => {
  test('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle string operations', () => {
    const message = 'Hello, World!';
    expect(message).toContain('Hello');
    expect(message.length).toBeGreaterThan(0);
  });

  test('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });
});
