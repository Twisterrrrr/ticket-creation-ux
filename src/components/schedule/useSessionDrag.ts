import { useCallback, useRef, useState } from 'react';
import { isoToDateInput } from '@/lib/sessions';

type GridConfig = {
  slotMinutes: number;
  slotPx: number;
  dayStartHour: number;
  dayEndHourExclusive: number;
};

type SessionInterval = {
  sessionId: string;
  startMs: number;
  endMs: number;
  isCancelled: boolean;
  isLocked: boolean;
};

type SessionGeometry = {
  startIso: string;
  endIso?: string;
  topPx: number;
  leftPx: number;
  widthPx: number;
  heightPx: number;
  dayDate: string;
} | null;

type ProposedPosition = {
  startIso: string;
  topPx: number;
  leftPx: number;
  widthPx: number;
  heightPx: number;
};

export type DragState =
  | { phase: 'idle' }
  | {
      phase: 'dragging';
      sessionId: string;
      proposed: ProposedPosition;
      isValid: boolean;
      invalidReason?: 'OUT_OF_RANGE' | 'CONFLICT' | 'NOT_DRAGGABLE';
    };

type UseDragOptions = {
  config: GridConfig;
  intervalsForDay: SessionInterval[];
  canDragSession: (sessionId: string) => boolean;
  getSessionById: (sessionId: string) => SessionGeometry;
  onDropValid: (sessionId: string, prefillStartIso: string) => void;
};

export function useSessionDrag({ canDragSession, getSessionById, onDropValid }: UseDragOptions) {
  const [drag, setDrag] = useState<DragState>({ phase: 'idle' });
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const onSessionPointerDown = useCallback(
    (e: React.PointerEvent, sessionId: string) => {
      if (!canDragSession(sessionId)) return;
      startPos.current = { x: e.clientX, y: e.clientY };
      sessionIdRef.current = sessionId;

      const geo = getSessionById(sessionId);
      if (!geo) return;

      const handleMove = (ev: PointerEvent) => {
        if (!startPos.current) return;
        const dx = ev.clientX - startPos.current.x;
        const dy = ev.clientY - startPos.current.y;
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

        setDrag({
          phase: 'dragging',
          sessionId,
          proposed: {
            startIso: geo.startIso,
            topPx: geo.topPx + dy,
            leftPx: geo.leftPx + dx,
            widthPx: geo.widthPx,
            heightPx: geo.heightPx,
          },
          isValid: true,
        });
      };

      const handleUp = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);

        setDrag((prev) => {
          if (prev.phase === 'dragging' && prev.isValid) {
            onDropValid(prev.sessionId, prev.proposed.startIso);
          }
          return { phase: 'idle' };
        });

        startPos.current = null;
        sessionIdRef.current = null;
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [canDragSession, getSessionById, onDropValid],
  );

  const cancelDrag = useCallback(() => {
    setDrag({ phase: 'idle' });
  }, []);

  return { drag, onSessionPointerDown, cancelDrag };
}
