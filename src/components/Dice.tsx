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
  const [phase, setPhase] = useState<'idle' | 'rolling' | 'settled'>('idle');

  // Rapid cycling while rolling
  useEffect(() => {
    if (rolling) {
      setPhase('rolling');
      const interval = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 6) + 1);
      }, 70);
      return () => clearInterval(interval);
    }
  }, [rolling]);

  // Settle when rolling stops and value arrives
  useEffect(() => {
    if (!rolling && value !== null) {
      setDisplay(value);
      setPhase('settled');
      const t = setTimeout(() => setPhase('idle'), 600);
      return () => clearTimeout(t);
    }
    if (!rolling && value === null) {
      setPhase('idle');
    }
  }, [rolling, value]);

  const dots = DOT_MAP[display] || [];
  const dotSize = size * 0.15;
  const pad = size * 0.17;

  const hasValue = value !== null || rolling;

  return (
    <div className="dice-3d" style={{ perspective: 800 }}>
      <div
        className={`dice-face dice-face--${phase}`}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.18,
          padding: pad,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          background: hasValue
            ? 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)'
            : 'linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)',
          boxShadow:
            phase === 'rolling'
              ? `0 0 50px rgba(250, 173, 20, 0.5),
                 0 0 100px rgba(250, 173, 20, 0.2),
                 inset 0 2px 4px rgba(255,255,255,0.1)`
              : phase === 'settled'
                ? `0 0 40px rgba(82, 196, 26, 0.5),
                   0 8px 32px rgba(0,0,0,0.4),
                   inset 0 2px 4px rgba(255,255,255,0.2)`
                : hasValue
                  ? `0 8px 32px rgba(0,0,0,0.3),
                     inset 0 2px 4px rgba(255,255,255,0.15)`
                  : '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.3s ease, background 0.4s ease, transform 0.3s ease',
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
                className="dice-dot"
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  background: hasValue
                    ? 'radial-gradient(circle at 30% 30%, #666, #1a1a1a)'
                    : 'radial-gradient(circle at 30% 30%, #555, #333)',
                  boxShadow: hasValue
                    ? 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.1)'
                    : 'none',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
