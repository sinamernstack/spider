import { createHash } from 'crypto';

export function makeJobId(parts: Record<string, any>) {
  const str = Object.keys(parts)
    .sort()
    .map(k => `${k}=${String(parts[k])}`)
    .join('|');
  return createHash('sha256').update(str).digest('hex');
}

export default makeJobId;
