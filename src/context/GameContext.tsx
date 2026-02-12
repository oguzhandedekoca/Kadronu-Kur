import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { GameState, PlayerRole, Position } from '../types';
import * as svc from '../firebase/roomService';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */
interface GameContextType {
  /* identity */
  playerId: string | null;
  playerName: string;
  role: PlayerRole | null;

  /* state from Firestore */
  gameState: GameState | null;
  loading: boolean;

  /* room management */
  createRoom: (hostName: string) => Promise<string>;
  joinRoom: (roomId: string, guestName: string) => Promise<boolean>;
  subscribeToRoom: (roomId: string) => () => void;

  /* game actions — all write to Firestore */
  addPlayer: (name: string, position: Position) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  startRolling: () => Promise<void>;
  rollDice: (value: number) => Promise<void>;
  resetDice: () => Promise<void>;
  startDraft: () => Promise<void>;
  pickPlayer: (id: string) => Promise<void>;
  resetGame: () => void;

  /* join request actions */
  approveJoinRequest: () => Promise<void>;
  denyJoinRequest: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

/* -------------------------------------------------- */
/*  Helpers                                            */
/* -------------------------------------------------- */
function genRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

function genId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/* per-room session in sessionStorage (tab-scoped) */
function saveSession(roomId: string, pid: string, name: string) {
  sessionStorage.setItem(`kk-${roomId}-pid`, pid);
  sessionStorage.setItem(`kk-${roomId}-name`, name);
}

function getSession(roomId: string) {
  const pid = sessionStorage.getItem(`kk-${roomId}-pid`);
  const name = sessionStorage.getItem(`kk-${roomId}-name`);
  return pid && name ? { playerId: pid, playerName: name } : null;
}

/* -------------------------------------------------- */
/*  Provider                                           */
/* -------------------------------------------------- */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  /* ---------- room management ---------- */

  const createRoom = useCallback(async (hostName: string): Promise<string> => {
    const roomId = genRoomCode();
    const id = genId();
    await svc.createRoom(roomId, { name: hostName, id });
    setPlayerId(id);
    setPlayerName(hostName);
    setRole('host');
    saveSession(roomId, id, hostName);
    return roomId;
  }, []);

  const joinRoom = useCallback(
    async (roomId: string, guestName: string): Promise<boolean> => {
      const id = genId();
      const ok = await svc.joinRoom(roomId, { name: guestName, id });
      if (!ok) return false;
      setPlayerId(id);
      setPlayerName(guestName);
      setRole('guest');
      saveSession(roomId, id, guestName);
      // optimistic local update
      setGameState((prev) =>
        prev ? { ...prev, guest: { name: guestName, id }, status: 'adding_players' } : prev,
      );
      return true;
    },
    [],
  );

  const subscribeToRoom = useCallback((roomId: string): (() => void) => {
    if (unsubRef.current) unsubRef.current();
    setLoading(true);

    // try to restore identity from session
    const session = getSession(roomId);
    if (session) {
      setPlayerId(session.playerId);
      setPlayerName(session.playerName);
    }

    const unsub = svc.subscribeToRoom(roomId, (state) => {
      setLoading(false);
      setGameState(state);

      // determine role from latest session
      const s = getSession(roomId);
      if (s && state) {
        if (state.host?.id === s.playerId) setRole('host');
        else if (state.guest?.id === s.playerId) setRole('guest');
      }
    });

    unsubRef.current = unsub;
    return unsub;
  }, []);

  /* ---------- game actions ---------- */

  const addPlayer = useCallback(
    async (name: string, position: Position) => {
      if (!gameState) return;
      await svc.addPlayer(gameState.roomId, { id: genId(), name, position });
    },
    [gameState],
  );

  const removePlayer = useCallback(
    async (pid: string) => {
      if (!gameState) return;
      await svc.removePlayer(gameState.roomId, pid);
    },
    [gameState],
  );

  const startRolling = useCallback(async () => {
    if (!gameState) return;
    await svc.startRolling(gameState.roomId);
  }, [gameState]);

  const rollDice = useCallback(
    async (value: number) => {
      if (!gameState || !role) return;
      await svc.setDiceValue(gameState.roomId, role, value);
    },
    [gameState, role],
  );

  const resetDice = useCallback(async () => {
    if (!gameState) return;
    await svc.resetDice(gameState.roomId);
  }, [gameState]);

  const startDraft = useCallback(async () => {
    if (!gameState) return;
    await svc.startDraft(gameState.roomId);
  }, [gameState]);

  const pickPlayer = useCallback(
    async (pid: string) => {
      if (!gameState) return;
      await svc.pickPlayer(gameState.roomId, pid);
    },
    [gameState],
  );

  const resetGame = useCallback(() => {
    if (unsubRef.current) unsubRef.current();
    setGameState(null);
    setRole(null);
    setPlayerId(null);
    setPlayerName('');
  }, []);

  /* ---------- join request actions ---------- */

  const approveJoinRequest = useCallback(async () => {
    if (!gameState) return;
    await svc.approveJoinRequest(gameState.roomId);
  }, [gameState]);

  const denyJoinRequest = useCallback(async () => {
    if (!gameState) return;
    await svc.denyJoinRequest(gameState.roomId);
  }, [gameState]);

  return (
    <GameContext.Provider
      value={{
        playerId,
        playerName,
        role,
        gameState,
        loading,
        createRoom,
        joinRoom,
        subscribeToRoom,
        addPlayer,
        removePlayer,
        startRolling,
        rollDice,
        resetDice,
        startDraft,
        pickPlayer,
        resetGame,
        approveJoinRequest,
        denyJoinRequest,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
