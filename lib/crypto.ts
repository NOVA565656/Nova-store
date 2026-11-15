import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

// --- P3: Verification Keys ---
export function generateVerificationKey(): string {
  return randomBytes(12).toString('hex');
}

export function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// --- P8: Facebook Token Encryption ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET;
  
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be set in environment variables (>=32 chars)');
  }
  
  return createHash('sha256').update(secret).digest();
}

export function encryptToken(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
}

export function decryptToken(encryptedData: string): string {
  const [ivHex, encryptedHex, tagHex] = encryptedData.split(':');
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}