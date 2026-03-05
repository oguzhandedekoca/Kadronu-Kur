import { ref, onValue, off } from 'firebase/database';
import { realtimeDb } from './config';
import type { WatchMatch, WatchMatchRecord } from '../types/watchMatch';

function parseMatches(snap: { val(): unknown }): { id: string; data: WatchMatch }[] {
  const val = snap.val() as WatchMatchRecord | null;
  if (!val || typeof val !== 'object') {
    return [];
  }

  const list: { id: string; data: WatchMatch }[] = Object.entries(val).map(
    ([id, data]) => ({
      id,
      data: data as WatchMatch,
    }),
  );

  // En son oynanan maç en üstte görünsün (tarih desc).
  list.sort((a, b) => {
    const aTime = new Date(a.data.date).getTime();
    const bTime = new Date(b.data.date).getTime();
    return bTime - aTime;
  });

  return list;
}

/**
 * Realtime Database "matches" altındaki maçları dinler (Watch uygulamasından gelen veriler).
 * Hata olursa (örn. permission-denied) onError çağrılır, callback boş liste alır.
 */
export function subscribeToMatches(
  callback: (matches: { id: string; data: WatchMatch }[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const matchesRef = ref(realtimeDb, 'matches');
  const listener = (snap: { val(): unknown }) => {
    callback(parseMatches(snap));
  };
  const errorListener = (error: Error) => {
    console.error('[matchService] Realtime DB error:', error);
    callback([]);
    onError?.(error);
  };
  onValue(matchesRef, listener, errorListener);
  return () => off(matchesRef);
}
