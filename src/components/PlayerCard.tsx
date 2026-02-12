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
  return (
    <div
      className={`player-card ${selectable ? 'player-card--selectable' : ''} ${compact ? 'player-card--compact' : ''}`}
      onClick={selectable ? onClick : undefined}
    >
      <div className="player-card__inner">
        {index !== undefined && (
          <span className="player-card__index">{index + 1}</span>
        )}
        <div
          className="player-card__avatar"
          style={{
            borderColor: player.position
              ? POSITION_COLORS[player.position]
              : '#555',
          }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        <div className="player-card__info">
          <span className="player-card__name">{player.name}</span>
          {player.position && (
            <Tag
              color={POSITION_COLORS[player.position]}
              style={{ margin: 0, fontSize: 11 }}
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
