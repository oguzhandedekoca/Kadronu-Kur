import { Typography, Card, Button, Space, Divider, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PlayerCard from './PlayerCard';
import Confetti from './Confetti';
import { POSITION_COLORS, POSITION_LABELS } from '../types';
import type { PlayerInfo, Position } from '../types';

const { Title, Text } = Typography;

function PositionSummary({ team }: { team: PlayerInfo[] }) {
  const counts: Partial<Record<Position, number>> = {};
  team.forEach((p) => {
    const pos = p.position || '';
    counts[pos] = (counts[pos] || 0) + 1;
  });

  return (
    <Space wrap size={4}>
      {Object.entries(counts).map(([pos, count]) => (
        <Tag
          key={pos}
          color={POSITION_COLORS[pos as Position]}
          style={{ fontSize: 11 }}
        >
          {POSITION_LABELS[pos as Position]} x{count}
        </Tag>
      ))}
    </Space>
  );
}

export default function ResultView() {
  const { gameState, resetGame } = useGame();
  const navigate = useNavigate();

  if (!gameState) return null;

  const handleNewGame = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="result-view">
      <Confetti duration={5000} />

      <div className="result-header">
        <div className="result-header__trophy">🏆</div>
        <Title level={2} style={{ margin: 0 }}>
          Kadrolar Hazır!
        </Title>
        <Text type="secondary">İyi oyunlar!</Text>
      </div>

      <div className="result-teams">
        <Card className="glass-card result-team-card result-team-card--host">
          <div className="result-team__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="team-panel__dot"
                style={{ background: '#52c41a' }}
              />
              <Title level={3} style={{ margin: 0 }}>
                {gameState.host.name}
              </Title>
            </div>
            <Text type="secondary">{gameState.hostTeam.length} oyuncu</Text>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div className="result-team__list">
            {gameState.hostTeam.map((p, idx) => (
              <PlayerCard key={p.id} player={p} index={idx} compact />
            ))}
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <PositionSummary team={gameState.hostTeam} />
        </Card>

        <div className="result-vs">
          <div className="result-vs__circle">
            <span>VS</span>
          </div>
        </div>

        <Card className="glass-card result-team-card result-team-card--guest">
          <div className="result-team__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="team-panel__dot"
                style={{ background: '#1890ff' }}
              />
              <Title level={3} style={{ margin: 0 }}>
                {gameState.guest?.name}
              </Title>
            </div>
            <Text type="secondary">{gameState.guestTeam.length} oyuncu</Text>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div className="result-team__list">
            {gameState.guestTeam.map((p, idx) => (
              <PlayerCard key={p.id} player={p} index={idx} compact />
            ))}
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <PositionSummary team={gameState.guestTeam} />
        </Card>
      </div>

      <div className="result-actions">
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<ReloadOutlined />}
            onClick={handleNewGame}
            className="glow-btn"
          >
            Yeni Oyun
          </Button>
        </Space>
      </div>
    </div>
  );
}
