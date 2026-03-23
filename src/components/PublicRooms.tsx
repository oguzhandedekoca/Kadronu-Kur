import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Empty, Space, message, Tag, Popconfirm } from 'antd';
import { UserOutlined, LoginOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  subscribeToPublicRooms,
  subscribeToAllRooms,
  sendJoinRequest,
  deleteRoom,
} from '../firebase/roomService';
import type { GameState } from '../types';

const { Text } = Typography;

const ADMIN_NAME = 'OguzhanDedekoca';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  waiting:        { label: 'Bekliyor',     color: 'green'  },
  adding_players: { label: 'Oyuncu Ekleme', color: 'blue'  },
  rolling:        { label: 'Zar Atışı',    color: 'orange' },
  drafting:       { label: 'Seçim',        color: 'purple' },
  completed:      { label: 'Tamamlandı',   color: 'default' },
};

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
    // Admin tüm odaları görür; normal kullanıcı yalnızca katılabileceklerini
    const unsub = isAdmin
      ? subscribeToAllRooms(setRooms)
      : subscribeToPublicRooms(setRooms);
    return () => unsub();
  }, [isAdmin]);

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
        description={isAdmin ? 'Hiç oda yok' : 'Şu an açık oda yok'}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="public-rooms">
      {rooms.map((room) => {
        const statusInfo = STATUS_LABELS[room.status] ?? { label: room.status, color: 'default' };
        const canJoin = room.status === 'waiting' && !room.guest;

        return (
          <Card key={room.roomId} className="glass-card public-room-card">
            <div className="public-room-card__inner">
              <div className="public-room-card__info">
                <Space>
                  <UserOutlined />
                  <Text strong>{room.host.name}</Text>
                  <Tag color="green">Ev Sahibi</Tag>
                  {isAdmin && (
                    <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  )}
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Kod: {room.roomId}
                  {isAdmin && room.guest && (
                    <> &nbsp;·&nbsp; Misafir: <strong>{room.guest.name}</strong></>
                  )}
                </Text>
              </div>
              <Space>
                {canJoin && (
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={() => handleJoin(room)}
                    loading={busy === room.roomId}
                    size="small"
                  >
                    Katıl
                  </Button>
                )}
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
        );
      })}
    </div>
  );
}
