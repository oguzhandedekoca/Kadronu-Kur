import {
  doc,
  setDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  collection,
  query,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { GameState, SavedSquad } from '../types';

// --------------- Anonymous voter ID ---------------

export function getAnonId(): string {
  let id = localStorage.getItem('kk-anon-id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 11);
    localStorage.setItem('kk-anon-id', id);
  }
  return id;
}

// --------------- Save squad ---------------

export async function saveSquad(state: GameState): Promise<void> {
  const id = state.roomId;
  const ref = doc(db, 'squads', id);

  // Idempotent: skip if already saved
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return;
    tx.set(ref, {
      id,
      roomId: state.roomId,
      hostName: state.host.name,
      guestName: state.guest?.name ?? '',
      hostTeam: state.hostTeam,
      guestTeam: state.guestTeam,
      createdAt: serverTimestamp(),
      totalRating: 0,
      ratingCount: 0,
    });
  });
}

// --------------- List squads (real-time) ---------------

export function subscribeToSquads(
  callback: (squads: SavedSquad[]) => void,
): () => void {
  const q = query(collection(db, 'squads'));
  return onSnapshot(q, (snap) => {
    const squads = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: data.id ?? d.id,
        roomId: data.roomId ?? d.id,
        hostName: data.hostName ?? '',
        guestName: data.guestName ?? '',
        hostTeam: Array.isArray(data.hostTeam) ? data.hostTeam : [],
        guestTeam: Array.isArray(data.guestTeam) ? data.guestTeam : [],
        totalRating: typeof data.totalRating === 'number' ? data.totalRating : 0,
        ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : 0,
        createdAt: data.createdAt,
      } as SavedSquad;
    });
    callback(squads);
  });
}

// --------------- Rating ---------------

export async function rateSquad(
  squadId: string,
  value: number,
): Promise<void> {
  const oderId = getAnonId();
  const voteRef = doc(db, 'squads', squadId, 'votes', oderId);
  const squadRef = doc(db, 'squads', squadId);

  await runTransaction(db, async (tx) => {
    const [voteSnap, squadSnap] = await Promise.all([
      tx.get(voteRef),
      tx.get(squadRef),
    ]);

    if (!squadSnap.exists()) throw new Error('Squad not found');
    const squad = squadSnap.data() as SavedSquad;

    if (voteSnap.exists()) {
      const oldVal = voteSnap.data().value as number;
      tx.update(voteRef, { value });
      tx.update(squadRef, { totalRating: squad.totalRating - oldVal + value });
    } else {
      tx.set(voteRef, { value, oderId, createdAt: serverTimestamp() });
      tx.update(squadRef, {
        totalRating: squad.totalRating + value,
        ratingCount: squad.ratingCount + 1,
      });
    }
  });
}

export async function getUserVote(squadId: string): Promise<number | null> {
  const oderId = getAnonId();
  const ref = doc(db, 'squads', squadId, 'votes', oderId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().value as number) : null;
}
