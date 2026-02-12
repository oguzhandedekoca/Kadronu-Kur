import { POSITION_COLORS } from '../types';
import type { PlayerInfo, Position } from '../types';

interface Props {
  hostTeam: PlayerInfo[];
  guestTeam: PlayerInfo[];
  hostName: string;
  guestName: string;
}

/**
 * Place players in rows based on their position.
 * For 7-a-side: GK (1) — DEF row — MID row — FWD row
 * Players without position go into MID.
 * Captain (index 0) is displayed but marked.
 */
function arrangeRows(team: PlayerInfo[]): {
  gk: PlayerInfo[];
  def: PlayerInfo[];
  mid: PlayerInfo[];
  fwd: PlayerInfo[];
} {
  const gk: PlayerInfo[] = [];
  const def: PlayerInfo[] = [];
  const mid: PlayerInfo[] = [];
  const fwd: PlayerInfo[] = [];

  team.forEach((p) => {
    switch (p.position) {
      case 'GK':
        gk.push(p);
        break;
      case 'DEF':
        def.push(p);
        break;
      case 'FWD':
        fwd.push(p);
        break;
      case 'MID':
      default:
        mid.push(p);
        break;
    }
  });

  return { gk, def, mid, fwd };
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
  const { gk, def, mid, fwd } = arrangeRows(team);
  const isHost = side === 'host';

  // For host: GK at bottom (near own goal), FWD at top (near center)
  // For guest: GK at top, FWD at bottom (mirrored)
  const rows = isHost ? [fwd, mid, def, gk] : [gk, def, mid, fwd];

  return (
    <div className={`pitch-half pitch-half--${side}`}>
      <div className="pitch-half__label">{name}</div>
      {rows.map((row, ri) => (
        <div key={ri} className="pitch-row">
          {row.map((p) => (
            <PlayerDot
              key={p.id}
              player={p}
              isCaptain={p.id === team[0]?.id}
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
          {/* Center line */}
          <div className="pitch__center-line" />
          <div className="pitch__center-circle" />

          {/* Host half (bottom) */}
          <HalfPitch team={hostTeam} name={hostName} side="host" />

          {/* Guest half (top) */}
          <HalfPitch team={guestTeam} name={guestName} side="guest" />
        </div>
      </div>
    </div>
  );
}
