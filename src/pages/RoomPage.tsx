import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Steps,
  Typography,
  Spin,
  Result,
  Input,
  Button,
  Card,
  Space,
  message,
} from 'antd';
import {
  TeamOutlined,
  ThunderboltOutlined,
  SolutionOutlined,
  TrophyOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { useGame } from '../context/GameContext';
import LobbyView from '../components/LobbyView';
import DiceRollView from '../components/DiceRollView';
import DraftView from '../components/DraftView';
import ResultView from '../components/ResultView';

const { Title, Text } = Typography;

const STATUS_STEP: Record<string, number> = {
  waiting: 0,
  adding_players: 0,
  rolling: 1,
  drafting: 2,
  completed: 3,
};

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { gameState, loading, subscribeToRoom, role, joinRoom } = useGame();
  const [guestName, setGuestName] = useState('');
  const [busy, setBusy] = useState(false);

  /* Subscribe to Firestore document */
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoom(roomId);
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="center-screen">
        <Spin size="large" />
        <Text type="secondary" style={{ marginTop: 16 }}>
          Oda yükleniyor...
        </Text>
      </div>
    );
  }

  /* ---- Room not found ---- */
  if (!gameState) {
    return (
      <div className="center-screen">
        <Result
          status="404"
          title="Oda bulunamadı"
          subTitle={`"${roomId}" kodlu bir oda bulunamadı.`}
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Ana Sayfaya Dön
            </Button>
          }
        />
      </div>
    );
  }

  /* ---- Not in room — show join form ---- */
  if (!role && !gameState.guest) {
    const handleJoin = async () => {
      if (!guestName.trim() || !roomId) {
        message.warning('Adını gir!');
        return;
      }
      setBusy(true);
      try {
        const ok = await joinRoom(roomId, guestName.trim());
        if (!ok) message.error('Odaya katılınamadı!');
      } catch {
        message.error('Bağlantı hatası!');
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="home-page">
        <div className="home-content">
          <div className="home-hero">
            <div className="home-hero__ball">⚽</div>
            <Title level={2} className="home-hero__title">
              KADRONU KUR
            </Title>
            <Text type="secondary">{gameState.host.name} seni bekliyor!</Text>
          </div>

          <Card className="glass-card home-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  İsmin
                </Text>
                <Input
                  size="large"
                  placeholder="Adını gir..."
                  prefix={<TeamOutlined />}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={20}
                  onPressEnter={handleJoin}
                  disabled={busy}
                />
              </div>
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                block
                loading={busy}
                onClick={handleJoin}
                className="glow-btn"
              >
                Odaya Katıl
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  /* ---- Room full, user not part of it ---- */
  if (!role && gameState.guest) {
    return (
      <div className="center-screen">
        <Result
          status="warning"
          title="Oda dolu"
          subTitle="Bu odada zaten iki oyuncu var."
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Ana Sayfaya Dön
            </Button>
          }
        />
      </div>
    );
  }

  /* ---- Game view ---- */
  const step = STATUS_STEP[gameState.status] ?? 0;

  const renderView = () => {
    switch (gameState.status) {
      case 'waiting':
      case 'adding_players':
        return <LobbyView />;
      case 'rolling':
        return <DiceRollView />;
      case 'drafting':
        return <DraftView />;
      case 'completed':
        return <ResultView />;
      default:
        return <LobbyView />;
    }
  };

  return (
    <div className="room-page">
      <header className="room-header">
        <Title level={4} style={{ margin: 0 }}>
          ⚽ Kadronu Kur
        </Title>
      </header>

      <div className="game-steps">
        <Steps
          current={step}
          size="small"
          items={[
            { title: 'Lobi', icon: <TeamOutlined /> },
            { title: 'Zar Atışı', icon: <ThunderboltOutlined /> },
            { title: 'Kadro Seçimi', icon: <SolutionOutlined /> },
            { title: 'Tamamlandı', icon: <TrophyOutlined /> },
          ]}
        />
      </div>

      <div className="room-content">{renderView()}</div>
    </div>
  );
}
