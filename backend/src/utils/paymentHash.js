import crypto from 'crypto';

export const createSha512Hash = (value) => crypto.createHash('sha512').update(value).digest('hex');

export const createHmacSha256Hash = (secret, value) => crypto.createHmac('sha256', secret).update(value).digest('hex');

export const safeSignatureCompare = (expected, received) => {
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};
