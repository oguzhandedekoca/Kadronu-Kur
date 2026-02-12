import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, Typography, Space, Divider, message } from 'antd';
import {
  PlusOutlined,
  LoginOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useGame } from '../context/GameContext';

const { Title, Text } = Typography;

export default function HomePage() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const { createRoom } = useGame();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!name.trim()) {
      message.warning('Lütfen adını gir!');
      return;
    }
    const roomId = createRoom(name.trim());
    navigate(`/room/${roomId}`);
  };

  const handleJoin = () => {
    if (!name.trim()) {
      message.warning('Lütfen adını gir!');
      return;
    }
    if (!roomCode.trim()) {
      message.warning('Oda kodunu gir!');
      return;
    }
    // In Firebase version, this will actually join the room
    // For now, navigate to room (host simulates the guest)
    navigate(`/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Logo */}
        <div className="home-hero">
          <div className="home-hero__ball">⚽</div>
          <Title level={1} className="home-hero__title">
            KADRONU KUR
          </Title>
          <Text className="home-hero__subtitle">
            Kadroyu sen kur, sahaya sen çık!
          </Text>
        </div>

        {/* Form */}
        <Card className="glass-card home-card">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text
                strong
                style={{ display: 'block', marginBottom: 8, fontSize: 14 }}
              >
                İsmin
              </Text>
              <Input
                size="large"
                placeholder="Adını gir..."
                prefix={<TeamOutlined />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                onPressEnter={handleCreate}
              />
            </div>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              block
              onClick={handleCreate}
              className="glow-btn"
            >
              Oda Oluştur
            </Button>

            <Divider style={{ margin: 0, borderColor: 'rgba(255,255,255,0.1)' }}>
              veya
            </Divider>

            {!joining ? (
              <Button
                size="large"
                icon={<LoginOutlined />}
                block
                onClick={() => setJoining(true)}
              >
                Odaya Katıl
              </Button>
            ) : (
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="Oda Kodu"
                  value={roomCode}
                  onChange={(e) =>
                    setRoomCode(e.target.value.toUpperCase())
                  }
                  maxLength={6}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
                  onPressEnter={handleJoin}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={handleJoin}
                  icon={<LoginOutlined />}
                >
                  Katıl
                </Button>
              </Space.Compact>
            )}
          </Space>
        </Card>

        <Text className="home-footer">
          Halısaha & spor karşılaşmaları için kadro seçim uygulaması
        </Text>
      </div>
    </div>
  );
}
