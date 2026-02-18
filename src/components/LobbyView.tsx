import { useState, useEffect, useRef } from "react";
import {
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
} from "antd";
import {
  PlusOutlined,
  CopyOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useGame } from "../context/GameContext";
import type { Position } from "../types";
import { POSITION_LABELS } from "../types";
import { PLAYER_NAMES } from "../constants/playerNames";
import PlayerCard from "./PlayerCard";

const { Title, Text } = Typography;

export default function LobbyView() {
  const {
    gameState,
    role,
    addPlayer,
    removePlayer,
    updatePlayerPosition,
    startRolling,
    approveJoinRequest,
    denyJoinRequest,
  } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [position, setPosition] = useState<Position>("");
  const [adding, setAdding] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<"add" | "remove" | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  /* Sadece waiting → adding_players geçişinde (misafir katıldığında) tüm oyuncuları ekle.
   * Hook'lar early return'den önce çağrılmalı. */
  useEffect(() => {
    if (!gameState) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = gameState.status;

    const justEnteredLobby =
      role === "host" &&
      prev === "waiting" &&
      gameState.status === "adding_players" &&
      gameState.players.length === 0;

    if (!justEnteredLobby) return;

    (async () => {
      for (const name of PLAYER_NAMES) {
        await addPlayer(name, "");
      }
    })();
  }, [role, gameState, addPlayer]);

  if (!gameState) return null;

  const isWaiting = gameState.status === "waiting";

  /* Copy room CODE only */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.roomId);
    message.success("Oda kodu kopyalandı!");
  };

  const handleAddPlayer = async () => {
    const nameToAdd = selectedPlayer?.trim();
    if (!nameToAdd) {
      message.warning("Oyuncu seç veya isim yazıp listeden ekle!");
      return;
    }
    if (gameState.players.some((p) => p.name === nameToAdd)) {
      message.warning("Bu isim zaten listede.");
      return;
    }
    setAdding(true);
    try {
      await addPlayer(nameToAdd, position);
      setSelectedPlayer(null);
      setSearchValue("");
      setPosition("");
    } catch {
      message.error("Oyuncu eklenemedi!");
    }
    setAdding(false);
  };

  const handleStartRolling = async () => {
    try {
      await startRolling();
    } catch {
      message.error("Bir hata oluştu!");
    }
  };

  const handleApprove = async () => {
    try {
      await approveJoinRequest();
      message.success("Oyuncu onaylandı!");
    } catch {
      message.error("Hata!");
    }
  };

  const handleDeny = async () => {
    try {
      await denyJoinRequest();
    } catch {
      message.error("Hata!");
    }
  };

  const handleAddAll = async () => {
    const toAdd = PLAYER_NAMES.filter(
      (name) => !gameState.players.some((p) => p.name === name),
    );
    if (toAdd.length === 0) {
      message.info("Zaten hepsi listede.");
      return;
    }
    setBulkLoading("add");
    try {
      for (const name of toAdd) {
        await addPlayer(name, "");
      }
      message.success(`${toAdd.length} oyuncu eklendi.`);
    } catch {
      message.error("Eklenemedi!");
    }
    setBulkLoading(null);
  };

  const handleRemoveAll = async () => {
    if (gameState.players.length === 0) {
      message.info("Liste zaten boş.");
      return;
    }
    setBulkLoading("remove");
    try {
      for (const p of [...gameState.players]) {
        await removePlayer(p.id);
      }
      message.success("Tüm oyuncular silindi.");
    } catch {
      message.error("Silinemedi!");
    }
    setBulkLoading(null);
  };

  const canProceed = gameState.guest && gameState.players.length >= 2;

  const addedNames = new Set(gameState.players.map((p) => p.name));
  const basePlayerOptions = PLAYER_NAMES.filter(
    (name) => !addedNames.has(name),
  ).map((name) => ({ value: name, label: name }));
  const search = searchValue.trim().toLowerCase();
  const playerOptions = search
    ? basePlayerOptions.filter((opt) =>
        (opt.label as string).toLowerCase().includes(search),
      )
    : basePlayerOptions;
  const customOption =
    search &&
    !addedNames.has(searchValue.trim()) &&
    !basePlayerOptions.some((o) => o.value === searchValue.trim())
      ? [{ value: searchValue.trim(), label: `"${searchValue.trim()}" ekle` }]
      : [];
  const allPlayerOptions = [...playerOptions, ...customOption];

  return (
    <div className="lobby-view">
      {/* Room Code (only if waiting for guest) / Match Info (if guest joined) */}
      {isWaiting ? (
        <Card className="glass-card room-code-card">
          <div className="room-code-banner">
            <Text type="secondary">Oda Kodu</Text>
            <div className="room-code-display">
              <Title level={2} style={{ margin: 0, letterSpacing: "0.3em" }}>
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
      ) : (
        <Card className="glass-card match-banner-card">
          <div className="match-banner">
            <Text type="secondary" style={{ fontSize: 12 }}>
              ⚡ Eşleşme sağlandı!
            </Text>
            <div className="match-banner__names">
              <Text strong style={{ color: "#52c41a", fontSize: 18 }}>
                {gameState.host.name}
              </Text>
              <span className="match-banner__vs">VS</span>
              <Text strong style={{ color: "#1890ff", fontSize: 18 }}>
                {gameState.guest?.name}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Oyuncuları ekleyin ve zar atışına geçin!
            </Text>
          </div>
        </Card>
      )}

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
            <Badge status={gameState.guest ? "success" : "processing"} />
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
      {gameState.joinRequest?.status === "pending" && (
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
        <Card className="glass-card" style={{ textAlign: "center" }}>
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
              <Select
                placeholder="Oyuncu seç veya isim yaz (örn. Ahmet)"
                value={selectedPlayer}
                onChange={(v) => {
                  setSelectedPlayer(v);
                  setSearchValue("");
                }}
                searchValue={searchValue}
                onSearch={setSearchValue}
                allowClear
                showSearch
                filterOption={false}
                className="add-player-select"
                disabled={adding}
                options={allPlayerOptions}
                style={{ minWidth: 200 }}
                notFoundContent={
                  searchValue
                    ? `"${searchValue.trim()}" eklemek için yukarıdaki seçeneği tıkla`
                    : "Oyuncu bulunamadı"
                }
              />
              <Select
                placeholder="Mevki"
                value={position || undefined}
                onChange={(val) => setPosition(val)}
                allowClear
                style={{ width: 140 }}
                options={[
                  { value: "GK", label: POSITION_LABELS["GK"] },
                  { value: "DEF", label: POSITION_LABELS["DEF"] },
                  { value: "MID", label: POSITION_LABELS["MID"] },
                  { value: "FWD", label: POSITION_LABELS["FWD"] },
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
            <div className="add-player-bulk">
              <Button
                icon={<TeamOutlined />}
                onClick={handleAddAll}
                loading={bulkLoading === "add"}
                disabled={
                  bulkLoading !== null || basePlayerOptions.length === 0
                }
              >
                Tümünü ekle
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveAll}
                loading={bulkLoading === "remove"}
                disabled={
                  bulkLoading !== null || gameState.players.length === 0
                }
              >
                Tümünü sil
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
                    showPositionSelect
                    onPositionChange={updatePlayerPosition}
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
                  textAlign: "center",
                  display: "block",
                  marginTop: 8,
                }}
              >
                {!gameState.guest
                  ? "Rakibin katılmasını bekle"
                  : "En az 2 oyuncu ekle"}
              </Text>
            )}
          </div>
        </>
      )}
    </div>
  );
}
