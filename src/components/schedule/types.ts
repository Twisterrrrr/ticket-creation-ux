import type { LockReason } from '@/lib/sessions';

export type AdminEventSessionRow = {
  id: string;
  startsAt: string;
  endsAt?: string | null;
  capacity?: number | null;
  soldCount: number;
  locked: boolean;
  lockReason?: LockReason;
  isCancelled: boolean;
  canceledAt?: string | null;
  cancelReason?: string | null;
};
