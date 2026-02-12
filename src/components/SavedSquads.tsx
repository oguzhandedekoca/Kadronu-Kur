import { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Empty,
  Rate,
  Space,
  Tag,
  Collapse,
  message,
  Segmented,
} from 'antd';
import { StarFilled } from '@ant-design/icons';
import { subscribeToSquads, rateSquad, getUserVote } from '../firebase/squadService';
import { POSITION_COLORS, POSITION_LABELS } from '../types';
import type { SavedSquad, PlayerInfo, Position } from '../types';

const { Text, Title } = Typography;

function TeamMini({ team, label }: { team: PlayerInfo[]; label: string }) {
  return (
    <div className="squad-team-mini">
      <Text strong style={{ fontSize: 12 }}>
        {label}
      </Text>
      <div className="squad-team-mini__tags">
        {team.map((p) => (
          <Tag
            key={p.id}
            color={p.position ? POSITION_COLORS[p.position] : undefined}
            style={{ fontSize: 11, margin: 2 }}
          >
            {p.name}
            {p.position ? ` (${POSITION_LABELS[p.position]})` : ''}
          </Tag>
        ))}
      </div>
    </div>
  );
}

function SquadCard({ squad }: { squad: SavedSquad }) {
  const [myVote, setMyVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserVote(squad.id).then(setMyVote);
  }, [squad.id]);

  const avg =
    squad.ratingCount > 0
      ? Math.round((squad.totalRating / squad.ratingCount) * 10) / 10
      : 0;

  const handleRate = async (value: number) => {
    setLoading(true);
    try {
      await rateSquad(squad.id, value);
      setMyVote(value);
    } catch {
      message.error('Puanlama başarısız!');
    }
    setLoading(false);
  };

  return (
    <Card className="glass-card squad-card" size="small">
      <div className="squad-card__header">
        <div className="squad-card__vs">
          <Text strong>{squad.hostName}</Text>
          <Text type="secondary" style={{ margin: '0 6px', fontSize: 12 }}>
            vs
          </Text>
          <Text strong>{squad.guestName}</Text>
        </div>
        <Space size={4}>
          <StarFilled style={{ color: '#faad14', fontSize: 14 }} />
          <Text strong style={{ color: '#faad14' }}>
            {avg || '—'}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            ({squad.ratingCount})
          </Text>
        </Space>
      </div>

      <Collapse
        ghost
        size="small"
        items={[
          {
            key: '1',
            label: (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Kadroları Gör
              </Text>
            ),
            children: (
              <div className="squad-card__teams">
                <TeamMini team={squad.hostTeam} label={squad.hostName} />
                <TeamMini team={squad.guestTeam} label={squad.guestName} />
              </div>
            ),
          },
        ]}
      />

      <div className="squad-card__rating">
        <Text type="secondary" style={{ fontSize: 12 }}>
          Puanla:
        </Text>
        <Rate
          value={myVote ?? 0}
          onChange={handleRate}
          disabled={loading}
          style={{ fontSize: 16 }}
        />
      </div>
    </Card>
  );
}

export default function SavedSquads() {
  const [squads, setSquads] = useState<SavedSquad[]>([]);
  const [sort, setSort] = useState<string>('rating');

  useEffect(() => {
    const unsub = subscribeToSquads(setSquads);
    return () => unsub();
  }, []);

  const getTime = (s: SavedSquad) => {
    const t = s.createdAt as { toMillis?: () => number } | null | undefined;
    return t?.toMillis?.() ?? 0;
  };

  const sorted = [...squads].sort((a, b) => {
    if (sort === 'rating') {
      const avgA = a.ratingCount > 0 ? a.totalRating / a.ratingCount : 0;
      const avgB = b.ratingCount > 0 ? b.totalRating / b.ratingCount : 0;
      return avgB - avgA;
    }
    if (sort === 'newest') {
      return getTime(b) - getTime(a);
    }
    return 0;
  });

  return (
    <div className="saved-squads">
      <div className="saved-squads__sort">
        <Segmented
          size="small"
          value={sort}
          onChange={(v) => setSort(v as string)}
          options={[
            { label: 'En Beğenilen', value: 'rating' },
            { label: 'En Yeni', value: 'newest' },
          ]}
        />
      </div>

      {sorted.length === 0 ? (
        <Empty
          description="Henüz kaydedilmiş kadro yok"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="saved-squads__list">
          {sorted.map((s) => (
            <SquadCard key={s.id} squad={s} />
          ))}
        </div>
      )}
    </div>
  );
}
