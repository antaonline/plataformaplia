const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 12 * 60 * 60;

export function resolveAccessTokenTtlSeconds(value?: string): number {
  const raw = value?.trim();
  if (!raw) {
    return DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
  }

  if (/^\d+$/.test(raw)) {
    return Number(raw);
  }

  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
  }
}
