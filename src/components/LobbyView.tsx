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
} from '@ant-design/icons';
import { useGame } from '../context/GameContext';
import type { Position } from '../types';
import { POSITION_LABELS } from '../types';
import PlayerCard from './PlayerCard';

const { Title, Text } = Typography;

export default function LobbyView() {
  const { gameState, addPlayer, removePlayer, startRolling, joinRoom } =
    useGame();
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState<Position>('');
  const [guestName, setGuestName] = useState('');

  if (!gameState) return null;

  const isWaiting = gameState.status === 'waiting';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.roomId);
    message.success('Oda kodu kopyalandı!');
  };

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      message.warning('Oyuncu adı gir!');
      return;
    }
    addPlayer(playerName.trim(), position);
    setPlayerName('');
    setPosition('');
  };

  const handleSimulateJoin = () => {
    if (!guestName.trim()) {
      message.warning('Rakip adını gir!');
      return;
    }
    joinRoom(gameState.roomId, guestName.trim());
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
            <Tooltip title="Kopyala">
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

      {/* Simulate Join (testing only) */}
      {isWaiting && (
        <Card className="glass-card simulate-card">
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            Rakip katılımını simüle et
          </Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Rakip adı"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onPressEnter={handleSimulateJoin}
            />
            <Button type="primary" onClick={handleSimulateJoin}>
              Katıl
            </Button>
          </Space.Compact>
        </Card>
      )}

      {/* Add Players */}
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
              >
                Ekle
              </Button>
            </div>
          </Card>

          {/* Pool */}
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

          {/* Start */}
          <div className="lobby-actions">
            <Button
              type="primary"
              size="large"
              disabled={!canProceed}
              onClick={startRolling}
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
