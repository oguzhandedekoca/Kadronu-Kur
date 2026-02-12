import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  LoginOutlined,
  TeamOutlined,
  GlobalOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useGame } from "../context/GameContext";
import PublicRooms from "../components/PublicRooms";
import SavedSquads from "../components/SavedSquads";

const { Title, Text } = Typography;

export default function HomePage() {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [busy, setBusy] = useState(false);
  const { createRoom, joinRoom } = useGame();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      message.warning("Lütfen adını gir!");
      return;
    }
    setBusy(true);
    try {
      const roomId = await createRoom(name.trim());
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error("Room create error:", err);
      message.error("Oda oluşturulamadı! Firebase bağlantısını kontrol et.");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      message.warning("Lütfen adını gir!");
      return;
    }
    if (!roomCode.trim()) {
      message.warning("Oda kodunu gir!");
      return;
    }
    const code = roomCode.trim().toUpperCase();
    setBusy(true);
    try {
      const ok = await joinRoom(code, name.trim());
      if (ok) {
        navigate(`/room/${code}`);
      } else {
        message.error("Oda bulunamadı veya dolu!");
      }
    } catch {
      message.error("Bağlantı hatası!");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-content" style={{ maxWidth: 520 }}>
        {/* Hero */}
        <div className="home-hero">
          <div className="home-hero__ball">⚽</div>
          <Title level={1} className="home-hero__title">
            KADRONU KUR
          </Title>
          <Text className="home-hero__subtitle">
            Adam Alış ve En İyi Kadroyu Sen Kur!
          </Text>
        </div>

        {/* Create / Join */}
        <Card className="glass-card home-card">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text
                strong
                style={{ display: "block", marginBottom: 8, fontSize: 14 }}
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
                disabled={busy}
              />
            </div>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              block
              onClick={handleCreate}
              loading={busy && !joining}
              className="glow-btn"
            >
              Oda Oluştur
            </Button>

            <Divider
              style={{ margin: 0, borderColor: "rgba(255,255,255,0.1)" }}
            >
              veya
            </Divider>

            {!joining ? (
              <Button
                size="large"
                icon={<LoginOutlined />}
                block
                onClick={() => setJoining(true)}
              >
                Kod ile Katıl
              </Button>
            ) : (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  size="large"
                  placeholder="Oda Kodu"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                  onPressEnter={handleJoin}
                  disabled={busy}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={handleJoin}
                  loading={busy}
                  icon={<LoginOutlined />}
                >
                  Katıl
                </Button>
              </Space.Compact>
            )}
          </Space>
        </Card>

        {/* Tabs: Public Rooms + Community Squads */}
        <div className="home-tabs">
          <Tabs
            defaultActiveKey="rooms"
            centered
            items={[
              {
                key: "rooms",
                label: (
                  <span>
                    <GlobalOutlined /> Açık Odalar
                  </span>
                ),
                children: <PublicRooms playerName={name} />,
              },
              {
                key: "squads",
                label: (
                  <span>
                    <TrophyOutlined /> Topluluk Kadroları
                  </span>
                ),
                children: <SavedSquads />,
              },
            ]}
          />
        </div>

        <Text className="home-footer">
          Halısaha & Spor Karşılaşmaları İçin Kadro Seçim Uygulaması
        </Text>
      </div>
    </div>
  );
}
