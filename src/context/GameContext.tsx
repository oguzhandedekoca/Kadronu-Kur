import { createContext, useContext, useState, useCallback } from 'react';
import type { GameState, PlayerInfo, PlayerRole, Position } from '../types';

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  role: PlayerRole | null;
  gameState: GameState | null;
  createRoom: (hostName: string) => string;
  joinRoom: (roomId: string, guestName: string) => boolean;
  addPlayer: (name: string, position: Position) => void;
  removePlayer: (playerId: string) => void;
  startRolling: () => void;
  setDice: (role: PlayerRole, value: number) => void;
  resetDice: () => void;
  startDraft: () => void;
  pickPlayer: (playerId: string) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const createRoom = useCallback((hostName: string): string => {
    const roomId = generateRoomCode();
    setRole('host');
    setPlayerName(hostName);
    setGameState({
      roomId,
      status: 'waiting',
      host: { name: hostName, id: generateId() },
      guest: null,
      players: [],
      hostDice: null,
      guestDice: null,
      currentTurn: 'host',
      firstPicker: null,
      hostTeam: [],
      guestTeam: [],
    });
    return roomId;
  }, []);

  const joinRoom = useCallback((_roomId: string, guestName: string): boolean => {
    setRole('guest');
    setPlayerName(guestName);
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        guest: { name: guestName, id: generateId() },
        status: 'adding_players',
      };
    });
    return true;
  }, []);

  const addPlayer = useCallback((name: string, position: Position) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: [...prev.players, { id: generateId(), name, position }],
      };
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        players: prev.players.filter((p) => p.id !== playerId),
      };
    });
  }, []);

  const startRolling = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'rolling', hostDice: null, guestDice: null, firstPicker: null };
    });
  }, []);

  const setDice = useCallback((diceRole: PlayerRole, value: number) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (diceRole === 'host') {
        updated.hostDice = value;
      } else {
        updated.guestDice = value;
      }
      if (updated.hostDice !== null && updated.guestDice !== null) {
        if (updated.hostDice !== updated.guestDice) {
          updated.firstPicker =
            updated.hostDice > updated.guestDice ? 'host' : 'guest';
          updated.currentTurn = updated.firstPicker;
        }
        // tie: firstPicker stays null, UI will prompt re-roll
      }
      return updated;
    });
  }, []);

  const resetDice = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, hostDice: null, guestDice: null, firstPicker: null };
    });
  }, []);

  const startDraft = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'drafting' };
    });
  }, []);

  const pickPlayer = useCallback((playerId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const player = prev.players.find((p) => p.id === playerId);
      if (!player) return prev;

      const newPlayers = prev.players.filter((p) => p.id !== playerId);
      const newHostTeam =
        prev.currentTurn === 'host'
          ? [...prev.hostTeam, player]
          : prev.hostTeam;
      const newGuestTeam =
        prev.currentTurn === 'guest'
          ? [...prev.guestTeam, player]
          : prev.guestTeam;

      const isCompleted = newPlayers.length === 0;
      const newTurn: PlayerRole =
        prev.currentTurn === 'host' ? 'guest' : 'host';

      return {
        ...prev,
        players: newPlayers,
        hostTeam: newHostTeam,
        guestTeam: newGuestTeam,
        currentTurn: isCompleted ? prev.currentTurn : newTurn,
        status: isCompleted ? 'completed' : 'drafting',
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
    setRole(null);
    setPlayerName('');
  }, []);

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        role,
        gameState,
        createRoom,
        joinRoom,
        addPlayer,
        removePlayer,
        startRolling,
        setDice,
        resetDice,
        startDraft,
        pickPlayer,
        resetGame,
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
