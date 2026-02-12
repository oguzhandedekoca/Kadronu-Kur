import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';
import type { GameState, GamePlayer, PlayerInfo, PlayerRole } from '../types';

// --------------- helpers ---------------
const roomRef = (roomId: string) => doc(db, 'rooms', roomId);

// --------------- Room lifecycle ---------------

export async function createRoom(
  roomId: string,
  host: GamePlayer,
): Promise<void> {
  await setDoc(roomRef(roomId), {
    roomId,
    status: 'waiting',
    host,
    guest: null,
    players: [],
    hostDice: null,
    guestDice: null,
    currentTurn: 'host',
    firstPicker: null,
    hostTeam: [],
    guestTeam: [],
    createdAt: serverTimestamp(),
  });
}

export async function joinRoom(
  roomId: string,
  guest: GamePlayer,
): Promise<boolean> {
  const ref = roomRef(roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data();
  if (data.guest) return false; // room full
  await updateDoc(ref, { guest, status: 'adding_players' });
  return true;
}

export async function roomExists(roomId: string): Promise<boolean> {
  const snap = await getDoc(roomRef(roomId));
  return snap.exists();
}

/** Delete a room (e.g. admin only) */
export async function deleteRoom(roomId: string): Promise<void> {
  await deleteDoc(roomRef(roomId));
}

// --------------- Real-time ---------------

export function subscribeToRoom(
  roomId: string,
  callback: (state: GameState | null) => void,
): () => void {
  return onSnapshot(roomRef(roomId), (snap) => {
    callback(snap.exists() ? (snap.data() as GameState) : null);
  });
}

// --------------- Player pool ---------------

export async function addPlayer(
  roomId: string,
  player: PlayerInfo,
): Promise<void> {
  const ref = roomRef(roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  await updateDoc(ref, { players: [...(data.players || []), player] });
}

export async function removePlayer(
  roomId: string,
  playerId: string,
): Promise<void> {
  const ref = roomRef(roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  await updateDoc(ref, {
    players: (data.players || []).filter((p: PlayerInfo) => p.id !== playerId),
  });
}

// --------------- Game phases ---------------

export async function startRolling(roomId: string): Promise<void> {
  await updateDoc(roomRef(roomId), {
    status: 'rolling',
    hostDice: null,
    guestDice: null,
    firstPicker: null,
  });
}

/** Atomic dice set + winner detection via transaction */
export async function setDiceValue(
  roomId: string,
  role: PlayerRole,
  value: number,
): Promise<void> {
  const ref = roomRef(roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Room not found');
    const data = snap.data() as GameState;

    const updates: Record<string, unknown> = {};
    if (role === 'host') updates.hostDice = value;
    else updates.guestDice = value;

    const hd = role === 'host' ? value : data.hostDice;
    const gd = role === 'guest' ? value : data.guestDice;

    if (hd !== null && gd !== null && hd !== gd) {
      const winner: PlayerRole = hd > gd ? 'host' : 'guest';
      updates.firstPicker = winner;
      updates.currentTurn = winner;
    }
    tx.update(ref, updates);
  });
}

export async function resetDice(roomId: string): Promise<void> {
  await updateDoc(roomRef(roomId), {
    hostDice: null,
    guestDice: null,
    firstPicker: null,
  });
}

/** Start draft: auto-add host & guest as team captains (first members) */
export async function startDraft(roomId: string): Promise<void> {
  const ref = roomRef(roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data() as GameState;
    tx.update(ref, {
      status: 'drafting',
      hostTeam: [{ id: data.host.id, name: data.host.name, position: '' }],
      guestTeam: [
        {
          id: data.guest?.id ?? '',
          name: data.guest?.name ?? '',
          position: '',
        },
      ],
    });
  });
}

// --------------- Join requests ---------------

/** Atomic: only one pending request at a time */
export async function sendJoinRequest(
  roomId: string,
  request: { name: string; id: string },
): Promise<boolean> {
  const ref = roomRef(roomId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return false;
    const data = snap.data();
    if (data.guest) return false;
    if (data.joinRequest?.status === 'pending') return false;
    tx.update(ref, { joinRequest: { ...request, status: 'pending' } });
    return true;
  });
}

export async function approveJoinRequest(roomId: string): Promise<void> {
  const ref = roomRef(roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const data = snap.data() as GameState;
    if (!data.joinRequest || data.joinRequest.status !== 'pending') return;
    tx.update(ref, {
      guest: { name: data.joinRequest.name, id: data.joinRequest.id },
      status: 'adding_players',
      joinRequest: null,
    });
  });
}

export async function denyJoinRequest(roomId: string): Promise<void> {
  await updateDoc(roomRef(roomId), { 'joinRequest.status': 'denied' });
}

export async function clearJoinRequest(roomId: string): Promise<void> {
  await updateDoc(roomRef(roomId), { joinRequest: null });
}

// --------------- Public rooms ---------------

export function subscribeToPublicRooms(
  callback: (rooms: GameState[]) => void,
): () => void {
  const q = query(
    collection(db, 'rooms'),
    where('status', '==', 'waiting'),
  );
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs
      .map((d) => d.data() as GameState)
      .filter((r) => !r.guest);
    callback(rooms);
  });
}

// --------------- Squad saving ---------------

export async function markSquadSaved(roomId: string): Promise<void> {
  await updateDoc(roomRef(roomId), { squadSaved: true });
}

/** Atomic pick: remove from pool → add to team → switch turn */
export async function pickPlayer(
  roomId: string,
  playerId: string,
): Promise<void> {
  const ref = roomRef(roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Room not found');
    const data = snap.data() as GameState;

    const player = data.players.find((p: PlayerInfo) => p.id === playerId);
    if (!player) throw new Error('Player not found');

    const remaining = data.players.filter(
      (p: PlayerInfo) => p.id !== playerId,
    );
    const done = remaining.length === 0;
    const nextTurn: PlayerRole =
      data.currentTurn === 'host' ? 'guest' : 'host';

    const updates: Record<string, unknown> = {
      players: remaining,
      currentTurn: done ? data.currentTurn : nextTurn,
      status: done ? 'completed' : 'drafting',
    };

    if (data.currentTurn === 'host') {
      updates.hostTeam = [...data.hostTeam, player];
    } else {
      updates.guestTeam = [...data.guestTeam, player];
    }
    tx.update(ref, updates);
  });
}
