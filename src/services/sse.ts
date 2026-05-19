import EventSource from 'react-native-sse';
import { API_V1_URL } from '../config/env';
import { getTokens } from './api';
import type { SearchProgressEvent } from '../types/api';

export interface ProgressStreamHandlers {
  onEvent: (event: SearchProgressEvent) => void;
  onError?: (error: unknown) => void;
}

export interface ProgressStreamHandle {
  close: () => void;
}

// O backend emite cada evento com nome explícito (ServerSentEvent.event(phase)).
// A lib precisa registrar listeners por nome — o canal default 'message' só
// recebe eventos SEM nome, então sem isso a stream chega mas é silenciosamente
// descartada e o ProcessingScreen fica travado.
type ProgressEventName =
  | 'queued'
  | 'processing'
  | 'source_progress'
  | 'completed'
  | 'failed';

const PROGRESS_EVENT_NAMES: ProgressEventName[] = [
  'queued',
  'processing',
  'source_progress',
  'completed',
  'failed',
];

export function streamSearchProgress(
  searchId: string,
  handlers: ProgressStreamHandlers,
): ProgressStreamHandle {
  const token = getTokens()?.accessToken;
  const url = `${API_V1_URL}/searches/${searchId}/stream`;

  const headers: Record<string, string> = { Accept: 'text/event-stream' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const es = new EventSource<ProgressEventName>(url, { headers });

  const handleData = (event: any) => {
    if (!event?.data) return;
    try {
      const parsed = JSON.parse(event.data) as SearchProgressEvent;
      handlers.onEvent(parsed);
    } catch (err) {
      handlers.onError?.(err);
    }
  };

  PROGRESS_EVENT_NAMES.forEach((name) => {
    es.addEventListener(name, handleData);
  });
  // Fallback: caso o backend mude de ideia e mande eventos sem nome.
  es.addEventListener('message', handleData);

  es.addEventListener('error', (event: any) => {
    handlers.onError?.(event);
  });

  return {
    close: () => {
      try {
        es.removeAllEventListeners();
        es.close();
      } catch {
        /* noop */
      }
    },
  };
}
