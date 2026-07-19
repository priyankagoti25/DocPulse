import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.createHash('sha256').update(env.JWT_SECRET).digest();

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decrypt(payload: string): string {
  const parts = payload.split(':');
  const ivB64 = parts[0];
  const authTagB64 = parts[1];
  const dataB64 = parts[2];
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error('Invalid encrypted payload format');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
