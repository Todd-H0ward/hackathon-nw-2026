import { useEffect, useRef, useState } from 'react';

import { xenochoiceWsUrl } from './client';
import type { StateSnapshot, StreamMessage } from './types';

/** Cap on how often buffered WS pushes are applied to React state (10 Hz). */
const FLUSH_MS = 100;
const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 15_000;
/** Give up instead of hammering a dead or unknown experiment forever. */
const RECONNECT_MAX_ATTEMPTS = 6;

export type StreamStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'failed';

/**
 * The backend is documented as `{experimentId, payload}`, but tolerate a bare
 * snapshot too: guessing wrong would silently freeze the lab with an empty
 * buffer and no error anywhere.
 */
const parseSnapshot = (raw: unknown): StateSnapshot | null => {
  if (typeof raw !== 'string') return null;

  let data: StreamMessage | StateSnapshot;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  const snapshot =
    data && typeof data === 'object' && 'payload' in data ? data.payload : data;

  if (
    snapshot &&
    typeof snapshot === 'object' &&
    'tick' in snapshot &&
    'metrics' in snapshot
  ) {
    return snapshot as StateSnapshot;
  }

  console.warn('[xenochoice] unrecognised stream frame', data);
  return null;
};

/**
 * Subscribes to `/experiments/{id}/stream`. The backend can push well past
 * 10 Hz once an experiment is running, so incoming snapshots are buffered and
 * only the latest one is flushed to `onSnapshot` on a fixed interval —
 * applying every message to React/Three.js state directly reintroduces the
 * per-tick jank the planet viewport was fixed for.
 *
 * `onSnapshot` receives the experiment id that produced the frame, so callers
 * never have to guess which world a late snapshot belongs to.
 */
export const useExperimentStream = (
  experimentId: string | null,
  enabled: boolean,
  onSnapshot: (snapshot: StateSnapshot, experimentId: string) => void,
): StreamStatus => {
  const onSnapshotRef = useRef(onSnapshot);
  onSnapshotRef.current = onSnapshot;

  const [status, setStatus] = useState<StreamStatus>('idle');

  useEffect(() => {
    if (!experimentId || !enabled) {
      setStatus('idle');
      return;
    }

    let socket: WebSocket | null = null;
    let flushTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let latest: StateSnapshot | null = null;
    let attempt = 0;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      setStatus(attempt === 0 ? 'connecting' : 'reconnecting');

      socket = new WebSocket(
        xenochoiceWsUrl(`/experiments/${experimentId}/stream`),
      );

      socket.onopen = () => {
        if (stopped) return;
        attempt = 0;
        setStatus('open');
      };

      socket.onmessage = (event) => {
        const snapshot = parseSnapshot(event.data);
        if (snapshot) latest = snapshot;
      };

      socket.onclose = () => {
        if (stopped) return;
        attempt += 1;

        if (attempt > RECONNECT_MAX_ATTEMPTS) {
          setStatus('failed');
          return;
        }

        setStatus('reconnecting');
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** (attempt - 1),
          RECONNECT_MAX_MS,
        );
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => socket?.close();
    };

    connect();
    flushTimer = setInterval(() => {
      if (latest) {
        onSnapshotRef.current(latest, experimentId);
        latest = null;
      }
    }, FLUSH_MS);

    return () => {
      stopped = true;
      if (flushTimer) clearInterval(flushTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [experimentId, enabled]);

  return status;
};
