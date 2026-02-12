import { useMemo } from 'react';
import { POSITION_COLORS } from '../types';
import type { PlayerInfo, Position } from '../types';

interface Props {
  hostTeam: PlayerInfo[];
  guestTeam: PlayerInfo[];
  hostName: string;
  guestName: string;
}

/** Formation: 1 GK, 2 DEF, 3 MID, 1 FWD. Fill remaining with no-position players (shuffled). */
const SLOTS: { position: Position; count: number }[] = [
  { position: 'GK', count: 1 },
  { position: 'DEF', count: 2 },
  { position: 'MID', count: 3 },
  { position: 'FWD', count: 1 },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Assign 7 players to rows: [GK], [DEF, DEF], [MID, MID, MID], [FWD].
 * Players with position go to their row; rest fill empty slots randomly.
 */
function buildFormation(team: PlayerInfo[]): PlayerInfo[][] {
  const rows: PlayerInfo[][] = [[], [], [], []]; // GK, DEF, MID, FWD

  const byPos: Record<string, PlayerInfo[]> = { GK: [], DEF: [], MID: [], FWD: [], '': [] };
  team.forEach((p) => {
    const key = p.position || '';
    if (!byPos[key]) byPos[key] = [];
    byPos[key].push(p);
  });

  const noPosition = shuffle(byPos[''] ?? []);
  let noIdx = 0;

  SLOTS.forEach((slot, rowIndex) => {
    const available = byPos[slot.position] ?? [];
    for (let i = 0; i < slot.count; i++) {
      if (available[i]) {
        rows[rowIndex].push(available[i]);
      } else if (noPosition[noIdx] !== undefined) {
        rows[rowIndex].push(noPosition[noIdx++]);
      }
    }
  });

  return rows;
}

function PlayerDot({
  player,
  isCaptain,
  side,
}: {
  player: PlayerInfo;
  isCaptain: boolean;
  side: 'host' | 'guest';
}) {
  const bg = player.position
    ? POSITION_COLORS[player.position]
    : side === 'host'
      ? '#52c41a'
      : '#1890ff';

  return (
    <div className="pitch-player">
      <div
        className={`pitch-player__dot ${isCaptain ? 'pitch-player__dot--captain' : ''}`}
        style={{ background: bg }}
      >
        {isCaptain && <span className="pitch-player__badge">C</span>}
      </div>
      <span className="pitch-player__name">{player.name}</span>
    </div>
  );
}

function HalfPitch({
  team,
  name,
  side,
}: {
  team: PlayerInfo[];
  name: string;
  side: 'host' | 'guest';
}) {
  const teamKey = team.map((p) => p.id).sort().join(',');
  const rows = useMemo(() => buildFormation(team), [teamKey]);
  const captainId = team[0]?.id;

  // Host half: bottom = own goal → show GK row at bottom → order [3,2,1,0] (FWD top, GK bottom)
  // Guest half: top = own goal → show GK row at top → order [0,1,2,3]
  const rowOrder = side === 'host' ? [3, 2, 1, 0] : [0, 1, 2, 3];

  return (
    <div className={`pitch-half pitch-half--${side}`}>
      <div className="pitch-half__label">{name}</div>
      {rowOrder.map((rowIndex) => (
        <div key={rowIndex} className="pitch-row">
          {rows[rowIndex]?.map((p) => (
            <PlayerDot
              key={p.id}
              player={p}
              isCaptain={p.id === captainId}
              side={side}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PitchView({
  hostTeam,
  guestTeam,
  hostName,
  guestName,
}: Props) {
  return (
    <div className="pitch-container">
      <div className="pitch">
        <div className="pitch__field">
          <div className="pitch__center-line" />
          <div className="pitch__center-circle" />

          <HalfPitch team={hostTeam} name={hostName} side="host" />
          <HalfPitch team={guestTeam} name={guestName} side="guest" />
        </div>
      </div>
    </div>
  );
}
