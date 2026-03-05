import { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Empty, Spin, Modal } from 'antd';
import { subscribeToMatches } from '../firebase/matchService';
import type { WatchMatch } from '../types/watchMatch';

const { Text, Title } = Typography;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sn`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec ? `${min} dk ${sec} sn` : `${min} dk`;
}

export default function WatchMatches() {
  const [matches, setMatches] = useState<{ id: string; data: WatchMatch }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ id: string; data: WatchMatch } | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setLoading(false);
    };

    const unsub = subscribeToMatches(
      (list) => {
        setMatches(list);
        finish();
        setError(null);
      },
      (err) => {
        finish();
        setError(err?.message ?? 'Veriler alınamadı. Realtime DB kurallarını kontrol et.');
      },
    );

    const timeout = window.setTimeout(() => {
      if (done) return;
      done = true;
      setLoading(false);
      setError('Bağlantı gecikiyor. Realtime Database açık ve kurallar okumaya izin veriyor mu kontrol et.');
    }, 12000);

    return () => {
      window.clearTimeout(timeout);
      unsub();
    };
  }, []);

  const sortedMatches = useMemo(
    () => [...matches],
    [matches],
  );

  if (loading) {
    return (
      <div className="watch-matches watch-matches--loading">
        <Spin size="large" tip="Maçlar yükleniyor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-matches">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={error} />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="watch-matches">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Henüz Watch’tan maç verisi yok. Apple Watch uygulamasından oynanan maçlar burada görünecek."
        />
      </div>
    );
  }

  return (
    <div className="watch-matches">
      <div className="watch-matches__list">
        {sortedMatches.map((match) => {
          const { id, data } = match;
          const totalGoals = data.goals?.length ?? 0;
          const homeGoals = data.goals?.filter((g) => g.team === data.homeTeam).length ?? 0;
          const awayGoals = totalGoals - homeGoals;

          return (
            <Card
              key={id}
              className="watch-match-card glass-card"
              hoverable
              onClick={() => {
                setSelected(match);
                setModalOpen(true);
              }}
            >
            <div className="watch-match-card__header">
              <Text strong className="watch-match-card__team">
                {data.homeTeam}
              </Text>
              <Text className="watch-match-card__score">
                {data.homeScore} – {data.awayScore}
              </Text>
              <Text strong className="watch-match-card__team">
                {data.awayTeam}
              </Text>
            </div>
            <div className="watch-match-card__meta">
              <Text type="secondary">{formatDate(data.date)}</Text>
              <Text type="secondary"> • {formatDuration(data.duration)}</Text>
            </div>
            {data.goals && data.goals.length > 0 && (
              <div className="watch-match-card__goals">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {`Toplam ${totalGoals} gol • ${data.homeTeam} ${homeGoals}, ${data.awayTeam} ${awayGoals}`}
                </Text>
              </div>
            )}
          </Card>
          );
        })}
      </div>

      {selected && (
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          centered
          className="watch-match-modal"
        >
          <div className="watch-match-modal__header">
            <Title level={4} style={{ marginBottom: 4 }}>
              {selected.data.homeTeam}{' '}
              <span className="watch-match-modal__score">
                {selected.data.homeScore} – {selected.data.awayScore}
              </span>{' '}
              {selected.data.awayTeam}
            </Title>
            <Text type="secondary">
              {formatDate(selected.data.date)} • {formatDuration(selected.data.duration)}
            </Text>
          </div>

          {selected.data.goals && selected.data.goals.length > 0 ? (
            <div className="watch-match-modal__goals">
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Goller
              </Text>
              <ul className="watch-match-modal__goals-list">
                {[...selected.data.goals]
                  .sort((a, b) => a.minute - b.minute)
                  .map((g, idx) => (
                    <li key={`${g.team}-${g.minute}-${idx}`}>
                      <span className="watch-match-modal__goal-minute">
                        {g.minute}'
                      </span>
                      <span className="watch-match-modal__goal-team">
                        {g.team}
                        {g.scorer ? ` - ${g.scorer}` : ''}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <Text type="secondary">Gol bilgisi bulunmuyor.</Text>
          )}
        </Modal>
      )}
    </div>
  );
}
