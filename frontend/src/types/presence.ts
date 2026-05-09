export const PRESENCE_UPDATED_EVENT = 'presence:updated';

export type PresenceStatus = 'OFFLINE' | 'ONLINE' | 'IN_GAME';

export type PresenceUpdatedEvent = {
  userId: string;
  publicStatus: PresenceStatus;
  internalStatus?: 'OFFLINE' | 'ONLINE' | 'MATCHING' | 'IN_GAME';
  at?: string;
  version?: number;
};
