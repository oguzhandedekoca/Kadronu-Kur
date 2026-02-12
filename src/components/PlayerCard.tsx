import { Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { PlayerInfo } from '../types';
import { POSITION_COLORS, POSITION_LABELS } from '../types';

interface PlayerCardProps {
  player: PlayerInfo;
  selectable?: boolean;
  onClick?: () => void;
  index?: number;
  showRemove?: boolean;
  onRemove?: () => void;
  compact?: boolean;
}

export default function PlayerCard({
  player,
  selectable = false,
  onClick,
  index,
  showRemove = false,
  onRemove,
  compact = false,
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
          <span className="player-card__name">{player.name}</span>
          {player.position && (
            <Tag
              color={posColor}
              style={{ margin: 0, fontSize: 10, lineHeight: '18px', padding: '0 6px' }}
            >
              {POSITION_LABELS[player.position]}
            </Tag>
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
