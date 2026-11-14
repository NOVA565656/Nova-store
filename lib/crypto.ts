import { createHash, randomBytes } from 'crypto';

// Generates a random 24-char string
export function generateVerificationKey(): string {
  return randomBytes(12).toString('hex');
}

// Hashes the key so we never store plaintext in the DB
export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}