import { Typography, Badge, Empty, message, Progress } from 'antd';
import { useGame } from '../context/GameContext';
import PlayerCard from './PlayerCard';

const { Title, Text } = Typography;

export default function DraftView() {
  const { gameState, role, pickPlayer } = useGame();

  if (!gameState) return null;

  const isMyTurn = gameState.currentTurn === role;

  const currentName =
    gameState.currentTurn === 'host'
      ? gameState.host.name
      : gameState.guest?.name;

  const totalPicked = gameState.hostTeam.length + gameState.guestTeam.length;
  const totalPlayers = totalPicked + gameState.players.length;
  const progress = totalPlayers > 0 ? (totalPicked / totalPlayers) * 100 : 0;

  const handlePick = async (playerId: string) => {
    if (!isMyTurn) {
      message.warning('Sıra sende değil!');
      return;
    }
    try {
      await pickPlayer(playerId);
    } catch {
      message.error('Seçim yapılamadı!');
    }
  };

  return (
    <div className="draft-view">
      {/* Progress */}
      <Progress
        percent={progress}
        showInfo={false}
        strokeColor={{ from: '#52c41a', to: '#1890ff' }}
        trailColor="rgba(255,255,255,0.06)"
        style={{ marginBottom: 4 }}
      />

      {/* Turn banner */}
      <div
        className={`turn-banner turn-banner--${gameState.currentTurn} ${isMyTurn ? 'turn-banner--mine' : ''}`}
      >
        <div className="turn-banner__content">
          <span className="turn-banner__icon">
            {gameState.currentTurn === 'host' ? '🟢' : '🔵'}
          </span>
          <Title level={3} style={{ margin: 0, color: '#fff' }}>
            {isMyTurn
              ? 'Senin sıran! Bir oyuncu seç.'
              : `${currentName} seçiyor...`}
          </Title>
        </div>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          Seçim {totalPicked + 1} / {totalPlayers}
        </Text>
      </div>

      <div className="draft-layout">
        {/* Host team */}
        <div
          className={`team-panel ${gameState.currentTurn === 'host' ? 'team-panel--active team-panel--host' : ''}`}
        >
          <div className="team-panel__header">
            <div className="team-panel__title">
              <span className="team-panel__dot" style={{ background: '#52c41a' }} />
              <Title level={4} style={{ margin: 0 }}>
                {gameState.host.name}
              </Title>
            </div>
            <Badge
              count={gameState.hostTeam.length}
              showZero
              style={{ backgroundColor: '#52c41a' }}
            />
          </div>
          <div className="team-panel__list">
            {gameState.hostTeam.length === 0 ? (
              <Text type="secondary" className="team-panel__empty">
                Henüz oyuncu yok
              </Text>
            ) : (
              gameState.hostTeam.map((p, idx) => (
                <PlayerCard key={p.id} player={p} index={idx} compact />
              ))
            )}
          </div>
        </div>

        {/* Pool */}
        <div className="draft-pool">
          <Title
            level={4}
            style={{ textAlign: 'center', marginTop: 0, marginBottom: 16 }}
          >
            Oyuncu Havuzu
          </Title>
          {gameState.players.length === 0 ? (
            <Empty
              description="Tüm oyuncular seçildi!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="draft-pool__grid">
              {gameState.players.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  selectable={isMyTurn}
                  onClick={() => handlePick(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Guest team */}
        <div
          className={`team-panel ${gameState.currentTurn === 'guest' ? 'team-panel--active team-panel--guest' : ''}`}
        >
          <div className="team-panel__header">
            <div className="team-panel__title">
              <span className="team-panel__dot" style={{ background: '#1890ff' }} />
              <Title level={4} style={{ margin: 0 }}>
                {gameState.guest?.name}
              </Title>
            </div>
            <Badge
              count={gameState.guestTeam.length}
              showZero
              style={{ backgroundColor: '#1890ff' }}
            />
          </div>
          <div className="team-panel__list">
            {gameState.guestTeam.length === 0 ? (
              <Text type="secondary" className="team-panel__empty">
                Henüz oyuncu yok
              </Text>
            ) : (
              gameState.guestTeam.map((p, idx) => (
                <PlayerCard key={p.id} player={p} index={idx} compact />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
