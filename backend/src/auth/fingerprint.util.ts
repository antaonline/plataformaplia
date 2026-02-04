import * as crypto from 'crypto'

export function generateFingerprint(req: any): string {
  const raw = [
    req.headers['user-agent'],
    req.headers['accept-language'],
    req.ip?.split('.').slice(0, 3).join('.'), // IP parcial
  ].join('|')

  return crypto.createHash('sha256').update(raw).digest('hex')
}
