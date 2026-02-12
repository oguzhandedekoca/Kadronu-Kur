import { useState } from 'react';
import {
  Input,
  Button,
  Select,
  Card,
  Typography,
  Space,
  Empty,
  Badge,
  message,
  Tooltip,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  CopyOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useGame } from '../context/GameContext';
import type { Position } from '../types';
import { POSITION_LABELS } from '../types';
import PlayerCard from './PlayerCard';

const { Title, Text } = Typography;

export default function LobbyView() {
  const {
    gameState,
    addPlayer,
    removePlayer,
    startRolling,
    approveJoinRequest,
    denyJoinRequest,
  } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState<Position>('');
  const [adding, setAdding] = useState(false);

  if (!gameState) return null;

  const isWaiting = gameState.status === 'waiting';

  /* Copy room CODE only */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.roomId);
    message.success('Oda kodu kopyalandı!');
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) {
      message.warning('Oyuncu adı gir!');
      return;
    }
    setAdding(true);
    try {
      await addPlayer(playerName.trim(), position);
      setPlayerName('');
      setPosition('');
    } catch {
      message.error('Oyuncu eklenemedi!');
    }
    setAdding(false);
  };

  const handleStartRolling = async () => {
    try {
      await startRolling();
    } catch {
      message.error('Bir hata oluştu!');
    }
  };

  const handleApprove = async () => {
    try {
      await approveJoinRequest();
      message.success('Oyuncu onaylandı!');
    } catch {
      message.error('Hata!');
    }
  };

  const handleDeny = async () => {
    try {
      await denyJoinRequest();
    } catch {
      message.error('Hata!');
    }
  };

  const canProceed = gameState.guest && gameState.players.length >= 2;

  return (
    <div className="lobby-view">
      {/* Room Code */}
      <Card className="glass-card room-code-card">
        <div className="room-code-banner">
          <Text type="secondary">Oda Kodu</Text>
          <div className="room-code-display">
            <Title level={2} style={{ margin: 0, letterSpacing: '0.3em' }}>
              {gameState.roomId}
            </Title>
            <Tooltip title="Kodu Kopyala">
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyCode}
                type="text"
                size="large"
              />
            </Tooltip>
          </div>
          <Text type="secondary">Bu kodu rakibinle paylaş!</Text>
        </div>
      </Card>

      {/* Players */}
      <div className="players-status">
        <Card className="glass-card player-slot">
          <Space>
            <Badge status="success" />
            <UserOutlined />
            <Text strong>{gameState.host.name}</Text>
            <Tag color="green">Ev Sahibi</Tag>
          </Space>
        </Card>
        <div className="vs-badge">VS</div>
        <Card className="glass-card player-slot">
          <Space>
            <Badge status={gameState.guest ? 'success' : 'processing'} />
            <UserOutlined />
            {gameState.guest ? (
              <>
                <Text strong>{gameState.guest.name}</Text>
                <Tag color="blue">Rakip</Tag>
              </>
            ) : (
              <Text type="secondary">Bekleniyor...</Text>
            )}
          </Space>
        </Card>
      </div>

      {/* Join Request Banner */}
      {gameState.joinRequest?.status === 'pending' && (
        <Card className="glass-card join-request-card">
          <div className="join-request-card__inner">
            <div>
              <Text strong>{gameState.joinRequest.name}</Text>
              <Text type="secondary"> katılmak istiyor!</Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
                size="small"
              >
                Onayla
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleDeny}
                size="small"
              >
                Reddet
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Waiting */}
      {isWaiting && !gameState.joinRequest && (
        <Card className="glass-card" style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Rakibinin katılmasını bekliyorsun... Kodu paylaş!
          </Text>
        </Card>
      )}

      {/* Add players */}
      {!isWaiting && (
        <>
          <Card className="glass-card add-player-card">
            <Title level={4} style={{ marginTop: 0 }}>
              Oyuncuları Ekle
            </Title>
            <div className="add-player-form">
              <Input
                placeholder="Oyuncu adı"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onPressEnter={handleAddPlayer}
                className="add-player-input"
                disabled={adding}
              />
              <Select
                placeholder="Mevki"
                value={position || undefined}
                onChange={(val) => setPosition(val)}
                allowClear
                style={{ width: 140 }}
                options={[
                  { value: 'GK', label: POSITION_LABELS['GK'] },
                  { value: 'DEF', label: POSITION_LABELS['DEF'] },
                  { value: 'MID', label: POSITION_LABELS['MID'] },
                  { value: 'FWD', label: POSITION_LABELS['FWD'] },
                ]}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddPlayer}
                loading={adding}
              >
                Ekle
              </Button>
            </div>
          </Card>

          <div className="player-pool">
            {gameState.players.length === 0 ? (
              <Empty
                description="Henüz oyuncu eklenmedi"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <div className="player-grid">
                {gameState.players.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    showRemove
                    onRemove={() => removePlayer(p.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lobby-actions">
            <Button
              type="primary"
              size="large"
              disabled={!canProceed}
              onClick={handleStartRolling}
              className="glow-btn"
            >
              🎲 Zar Atışına Geç ({gameState.players.length} oyuncu)
            </Button>
            {!canProceed && (
              <Text
                type="secondary"
                style={{
                  textAlign: 'center',
                  display: 'block',
                  marginTop: 8,
                }}
              >
                {!gameState.guest
                  ? 'Rakibin katılmasını bekle'
                  : 'En az 2 oyuncu ekle'}
              </Text>
            )}
          </div>
        </>
      )}
    </div>
  );
}
