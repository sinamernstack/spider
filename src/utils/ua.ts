import UserAgent from 'user-agents';

export function randomUA(): string {
  return new UserAgent({ deviceCategory: 'desktop' }).toString();
}
