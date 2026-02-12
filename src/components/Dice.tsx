import { useEffect, useState } from 'react';

interface DiceProps {
  value: number | null;
  rolling: boolean;
  size?: number;
}

const DOT_MAP: Record<number, number[]> = {
  1: [5],
  2: [3, 7],
  3: [3, 5, 7],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 4, 3, 6, 7, 9],
};

export default function Dice({ value, rolling, size = 120 }: DiceProps) {
  const [display, setDisplay] = useState(1);
  const [settled, setSettled] = useState(false);

  // Rapid random cycling while rolling
  useEffect(() => {
    if (rolling) {
      setSettled(false);
      const interval = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 6) + 1);
      }, 75);
      return () => clearInterval(interval);
    }
  }, [rolling]);

  // Show final value when rolling stops
  useEffect(() => {
    if (!rolling && value !== null) {
      setDisplay(value);
      setSettled(true);
      const timer = setTimeout(() => setSettled(false), 400);
      return () => clearTimeout(timer);
    }
  }, [rolling, value]);

  const dots = DOT_MAP[display] || [];
  const dotSize = size * 0.16;
  const pad = size * 0.17;

  return (
    <div
      className={`dice-face ${rolling ? 'dice-rolling' : ''} ${settled ? 'dice-settled' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.15,
        padding: pad,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        background: value !== null || rolling
          ? 'linear-gradient(145deg, #ffffff, #e8e8e8)'
          : 'linear-gradient(145deg, #3a3a3a, #2a2a2a)',
        boxShadow: rolling
          ? '0 0 40px rgba(250, 173, 20, 0.6), 0 8px 32px rgba(0,0,0,0.4)'
          : settled
            ? '0 0 30px rgba(82, 196, 26, 0.4), 0 8px 32px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.3s ease, background 0.3s ease',
      }}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
        <div
          key={pos}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {dots.includes(pos) && (
            <div
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                background:
                  value !== null || rolling
                    ? 'radial-gradient(circle at 35% 35%, #555, #1a1a1a)'
                    : 'radial-gradient(circle at 35% 35%, #666, #444)',
                transition: 'transform 0.08s ease',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
