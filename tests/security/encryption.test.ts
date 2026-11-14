// @security:encryption
import { describe, it, expect } from 'vitest';
import { hashKey, generateVerificationKey } from '../../lib/crypto';

describe('@security:encryption — key storage', () => {
  it('never returns the plaintext hash as the key itself', () => {
    const plaintext = generateVerificationKey();
    const hashed = hashKey(plaintext);
    
    expect(hashed).not.toBe(plaintext);
    expect(hashed.length).toBe(64); // SHA-256 hex length
  });

  it('generates unique keys every time', () => {
    const k1 = generateVerificationKey();
    const k2 = generateVerificationKey();
    
    expect(k1).not.toBe(k2);
  });
});