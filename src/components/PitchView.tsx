import { useState, useMemo, useEffect } from 'react';
import { Typography } from 'antd';
import { POSITION_COLORS } from '../types';
import type { PlayerInfo, Position } from '../types';

const { Text } = Typography;

interface Props {
  hostTeam: PlayerInfo[];
  guestTeam: PlayerInfo[];
  hostName: string;
  guestName: string;
}

/** Formation: 1 GK, 2 DEF, 3 MID, 1 FWD. Fill remaining with no-position players. */
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

function buildFormation(team: PlayerInfo[]): PlayerInfo[][] {
  const rows: PlayerInfo[][] = [[], [], [], []];

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

type Side = 'host' | 'guest';

interface SlotKey {
  side: Side;
  rowIndex: number;
  slotIndex: number;
}

function PlayerDot({
  player,
  isCaptain,
  side,
  rowIndex,
  slotIndex,
  onSwap,
}: {
  player: PlayerInfo;
  isCaptain: boolean;
  side: Side;
  rowIndex: number;
  slotIndex: number;
  onSwap: (from: SlotKey, to: SlotKey) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const bg = player.position
    ? POSITION_COLORS[player.position]
    : side === 'host'
      ? '#52c41a'
      : '#1890ff';

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ side, rowIndex, slotIndex } as SlotKey),
    );
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', player.name);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const from = JSON.parse(e.dataTransfer.getData('application/json')) as SlotKey;
      if (from.side !== side) return;
      if (from.rowIndex === rowIndex && from.slotIndex === slotIndex) return;
      onSwap(from, { side, rowIndex, slotIndex });
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`pitch-player ${isDragging ? 'pitch-player--dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
  rows,
  name,
  side,
  captainId,
  rowOrder,
  onSwap,
}: {
  rows: PlayerInfo[][];
  name: string;
  side: Side;
  captainId: string | undefined;
  rowOrder: number[];
  onSwap: (from: SlotKey, to: SlotKey) => void;
}) {
  return (
    <div className={`pitch-half pitch-half--${side}`}>
      <div className="pitch-half__label">{name}</div>
      {rowOrder.map((rowIndex) => (
        <div key={rowIndex} className="pitch-row pitch-row--drop">
          {rows[rowIndex]?.map((p, slotIndex) => (
            <PlayerDot
              key={`${p.id}-${rowIndex}-${slotIndex}`}
              player={p}
              isCaptain={p.id === captainId}
              side={side}
              rowIndex={rowIndex}
              slotIndex={slotIndex}
              onSwap={onSwap}
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
  const hostTeamKey = hostTeam.map((p) => p.id).sort().join(',');
  const guestTeamKey = guestTeam.map((p) => p.id).sort().join(',');

  const initialHost = useMemo(() => buildFormation(hostTeam), [hostTeamKey]);
  const initialGuest = useMemo(() => buildFormation(guestTeam), [guestTeamKey]);

  const [hostFormation, setHostFormation] = useState<PlayerInfo[][]>(() => initialHost);
  const [guestFormation, setGuestFormation] = useState<PlayerInfo[][]>(() => initialGuest);

  useEffect(() => {
    setHostFormation(initialHost);
    setGuestFormation(initialGuest);
  }, [initialHost, initialGuest]);

  const handleSwap = (from: SlotKey, to: SlotKey) => {
    if (from.side !== to.side) return;
    const setFormation = from.side === 'host' ? setHostFormation : setGuestFormation;
    const formation = from.side === 'host' ? hostFormation : guestFormation;

    const next = formation.map((row) => [...row]);
    const fromRow = next[from.rowIndex];
    const toRow = next[to.rowIndex];
    if (!fromRow?.[from.slotIndex] || !toRow?.[to.slotIndex]) return;

    const a = fromRow[from.slotIndex];
    const b = toRow[to.slotIndex];
    fromRow[from.slotIndex] = b;
    toRow[to.slotIndex] = a;
    setFormation(next);
  };

  const hostRowOrder = [3, 2, 1, 0];
  const guestRowOrder = [0, 1, 2, 3];
  const captainIdHost = hostTeam[0]?.id;
  const captainIdGuest = guestTeam[0]?.id;

  return (
    <div className="pitch-container">
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 8, fontSize: 12 }}>
        Oyuncuları sürükleyerek yerlerini değiştirebilirsin
      </Text>
      <div className="pitch">
        <div className="pitch__field">
          <div className="pitch__center-line" />
          <div className="pitch__center-circle" />

          <HalfPitch
            rows={hostFormation}
            name={hostName}
            side="host"
            captainId={captainIdHost}
            rowOrder={hostRowOrder}
            onSwap={handleSwap}
          />
          <HalfPitch
            rows={guestFormation}
            name={guestName}
            side="guest"
            captainId={captainIdGuest}
            rowOrder={guestRowOrder}
            onSwap={handleSwap}
          />
        </div>
      </div>
    </div>
  );
}
