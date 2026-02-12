import { useEffect, useState } from 'react';

interface Piece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  w: number;
  h: number;
  rot: number;
}

const COLORS = ['#52c41a', '#faad14', '#1890ff', '#f5222d', '#722ed1', '#13c2c2', '#ffffff'];

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2.5,
    duration: 2.2 + Math.random() * 2.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: 6 + Math.random() * 8,
    h: 4 + Math.random() * 5,
    rot: Math.random() * 360,
  }));
}

export default function Confetti({ duration = 4000 }: { duration?: number }) {
  const [pieces] = useState(() => makePieces(60));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="confetti-container" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
