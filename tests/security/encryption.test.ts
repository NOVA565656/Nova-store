// @security:encryption
import { describe, it, expect } from 'vitest';
import { hashKey, generateVerificationKey, encryptToken, decryptToken } from '../../lib/crypto';

describe('@security:encryption — verification keys', () => {
  it('never returns the plaintext hash as the key itself', () => {
    const plaintext = generateVerificationKey();
    const hashed = hashKey(plaintext);
    expect(hashed).not.toBe(plaintext);
    expect(hashed.length).toBe(64);
  });
});

describe('@security:encryption — FB token encryption at rest', () => {
  it('encrypts and decrypts a token correctly', () => {
    const token = 'EAABsbCS1iHgBO7ZC...';
    const encrypted = encryptToken(token);
    
    expect(encrypted).not.toBe(token);
    expect(encrypted.split(':').length).toBe(3); // iv:encrypted:tag
    
    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(token);
  });

  it('fails to decrypt a tampered token', () => {
    const token = 'EAABsbCS1iHgBO7ZC...';
    const encrypted = encryptToken(token);
    const tampered = encrypted.slice(0, -4) + '0000'; // Corrupt the auth tag
    
    expect(() => decryptToken(tampered)).toThrow();
  });
});