import crypto from 'crypto';

export function verifyIzipaySignature(body: any, secret: string) {
  const payload = JSON.stringify(body);
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return signature === body.signature;
}
