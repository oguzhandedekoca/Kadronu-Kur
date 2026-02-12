import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Empty, Space, message, Tag, Popconfirm } from 'antd';
import { UserOutlined, LoginOutlined, DeleteOutlined } from '@ant-design/icons';
import { subscribeToPublicRooms, sendJoinRequest, deleteRoom } from '../firebase/roomService';
import type { GameState } from '../types';

const { Text } = Typography;

const ADMIN_NAME = 'OguzhanDedekoca';

interface Props {
  playerName: string;
}

export default function PublicRooms({ playerName }: Props) {
  const [rooms, setRooms] = useState<GameState[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAdmin = playerName.trim() === ADMIN_NAME;

  useEffect(() => {
    const unsub = subscribeToPublicRooms(setRooms);
    return () => unsub();
  }, []);

  const handleJoin = async (room: GameState) => {
    if (!playerName.trim()) {
      message.warning('Önce yukarıdan adını gir!');
      return;
    }
    setBusy(room.roomId);
    const pid = Math.random().toString(36).substring(2, 11);
    try {
      const ok = await sendJoinRequest(room.roomId, {
        name: playerName.trim(),
        id: pid,
      });
      if (ok) {
        sessionStorage.setItem(`kk-${room.roomId}-pid`, pid);
        sessionStorage.setItem(`kk-${room.roomId}-name`, playerName.trim());
        sessionStorage.setItem(`kk-${room.roomId}-pending`, 'true');
        navigate(`/room/${room.roomId}`);
      } else {
        message.error('Oda dolu veya başka biri bekliyor.');
      }
    } catch {
      message.error('Bağlantı hatası!');
    }
    setBusy(null);
  };

  const handleDelete = async (roomId: string) => {
    if (!isAdmin) return;
    setDeleting(roomId);
    try {
      await deleteRoom(roomId);
      message.success('Oda silindi.');
    } catch {
      message.error('Silinemedi!');
    }
    setDeleting(null);
  };

  if (rooms.length === 0) {
    return (
      <Empty
        description="Şu an açık oda yok"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="public-rooms">
      {rooms.map((room) => (
        <Card key={room.roomId} className="glass-card public-room-card">
          <div className="public-room-card__inner">
            <div className="public-room-card__info">
              <Space>
                <UserOutlined />
                <Text strong>{room.host.name}</Text>
                <Tag color="green">Ev Sahibi</Tag>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Kod: {room.roomId}
              </Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => handleJoin(room)}
                loading={busy === room.roomId}
                size="small"
              >
                Katıl
              </Button>
              {isAdmin && (
                <Popconfirm
                  title="Odayı sil"
                  description="Bu oda kalıcı olarak silinecek. Emin misin?"
                  onConfirm={() => handleDelete(room.roomId)}
                  okText="Sil"
                  cancelText="İptal"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleting === room.roomId}
                    size="small"
                  >
                    Sil
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        </Card>
      ))}
    </div>
  );
}
