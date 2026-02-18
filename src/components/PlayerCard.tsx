import { Tag, Select } from 'antd';
import { CloseOutlined, CrownOutlined } from '@ant-design/icons';
import type { PlayerInfo, Position } from '../types';
import { POSITION_COLORS, POSITION_LABELS } from '../types';

interface PlayerCardProps {
  player: PlayerInfo;
  selectable?: boolean;
  onClick?: () => void;
  index?: number;
  showRemove?: boolean;
  onRemove?: () => void;
  compact?: boolean;
  isCaptain?: boolean;
  /** Lobi: tıklayınca mevki seçimi (tek tek mevki atama) */
  showPositionSelect?: boolean;
  onPositionChange?: (playerId: string, position: Position) => void;
}

export default function PlayerCard({
  player,
  selectable = false,
  onClick,
  index,
  showRemove = false,
  onRemove,
  compact = false,
  isCaptain = false,
  showPositionSelect = false,
  onPositionChange,
}: PlayerCardProps) {
  const posColor = player.position
    ? POSITION_COLORS[player.position]
    : '#555';

  return (
    <div
      className={`player-card ${selectable ? 'player-card--selectable' : ''} ${compact ? 'player-card--compact' : ''}`}
      onClick={selectable ? onClick : undefined}
      style={{
        '--pos-color': posColor,
      } as React.CSSProperties}
    >
      {/* Position accent stripe */}
      <div
        className="player-card__stripe"
        style={{ background: posColor }}
      />

      <div className="player-card__inner">
        {index !== undefined && (
          <span className="player-card__index">{index + 1}</span>
        )}
        <div
          className="player-card__avatar"
          style={{
            background: `linear-gradient(135deg, ${posColor}33, ${posColor}11)`,
            borderColor: posColor,
          }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div className="player-card__info">
          <span className="player-card__name">
            {isCaptain && (
              <CrownOutlined style={{ color: '#faad14', marginRight: 4, fontSize: 12 }} />
            )}
            {player.name}
            {isCaptain && (
              <span style={{ color: '#faad14', fontSize: 10, marginLeft: 4 }}>(K)</span>
            )}
          </span>
          {player.position && !showPositionSelect && (
            <Tag
              color={posColor}
              style={{ margin: 0, fontSize: 10, lineHeight: '18px', padding: '0 6px' }}
            >
              {POSITION_LABELS[player.position]}
            </Tag>
          )}
          {showPositionSelect && onPositionChange && (
            <Select
              size="small"
              placeholder="Mevki"
              value={player.position || undefined}
              onChange={(v) => onPositionChange(player.id, v ?? '')}
              allowClear
              options={[
                { value: 'GK', label: POSITION_LABELS['GK'] },
                { value: 'DEF', label: POSITION_LABELS['DEF'] },
                { value: 'MID', label: POSITION_LABELS['MID'] },
                { value: 'FWD', label: POSITION_LABELS['FWD'] },
              ]}
              style={{ width: 90, marginTop: 4 }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
        {showRemove && onRemove && (
          <button
            className="player-card__remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <CloseOutlined />
          </button>
        )}
      </div>
    </div>
  );
}
