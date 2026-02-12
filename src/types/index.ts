export type Position = 'GK' | 'DEF' | 'MID' | 'FWD' | '';

export type GameStatus =
  | 'waiting'
  | 'adding_players'
  | 'rolling'
  | 'drafting'
  | 'completed';

export type PlayerRole = 'host' | 'guest';

export interface PlayerInfo {
  id: string;
  name: string;
  position: Position;
}

export interface GamePlayer {
  name: string;
  id: string;
}

export interface JoinRequest {
  name: string;
  id: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface GameState {
  roomId: string;
  status: GameStatus;
  host: GamePlayer;
  guest: GamePlayer | null;
  players: PlayerInfo[];
  hostDice: number | null;
  guestDice: number | null;
  currentTurn: PlayerRole;
  firstPicker: PlayerRole | null;
  hostTeam: PlayerInfo[];
  guestTeam: PlayerInfo[];
  joinRequest?: JoinRequest | null;
  squadSaved?: boolean;
}

export interface SavedSquad {
  id: string;
  roomId: string;
  hostName: string;
  guestName: string;
  hostTeam: PlayerInfo[];
  guestTeam: PlayerInfo[];
  createdAt: unknown;
  totalRating: number;
  ratingCount: number;
}

export const POSITION_COLORS: Record<Position, string> = {
  GK: '#fa8c16',
  DEF: '#1890ff',
  MID: '#52c41a',
  FWD: '#f5222d',
  '': '#8c8c8c',
};

export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Kaleci',
  DEF: 'Defans',
  MID: 'Orta Saha',
  FWD: 'Forvet',
  '': 'Belirsiz',
};
