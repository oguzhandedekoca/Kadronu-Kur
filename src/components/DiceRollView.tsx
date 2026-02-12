import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Typography, message } from 'antd';
import { useGame } from '../context/GameContext';
import Dice from './Dice';

const { Title, Text } = Typography;

export default function DiceRollView() {
  const { gameState, role, rollDice, resetDice, startDraft } = useGame();

  const [hostAnimating, setHostAnimating] = useState(false);
  const [guestAnimating, setGuestAnimating] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Track previous values to detect remote rolls
  const prevHostDice = useRef<number | null>(null);
  const prevGuestDice = useRef<number | null>(null);
  const initRef = useRef(false);

  // Detect remote dice rolls & trigger animation for opponent
  useEffect(() => {
    if (!gameState || !initRef.current) {
      // Skip the first render to avoid false triggers
      if (gameState) {
        prevHostDice.current = gameState.hostDice;
        prevGuestDice.current = gameState.guestDice;
        initRef.current = true;
      }
      return;
    }

    // Opponent (host) just rolled → I'm guest, animate host dice
    if (
      role === 'guest' &&
      gameState.hostDice !== null &&
      prevHostDice.current === null
    ) {
      setHostAnimating(true);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
      setTimeout(() => setHostAnimating(false), 1500);
    }

    // Opponent (guest) just rolled → I'm host, animate guest dice
    if (
      role === 'host' &&
      gameState.guestDice !== null &&
      prevGuestDice.current === null
    ) {
      setGuestAnimating(true);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
      setTimeout(() => setGuestAnimating(false), 1500);
    }

    prevHostDice.current = gameState.hostDice;
    prevGuestDice.current = gameState.guestDice;
  }, [gameState?.hostDice, gameState?.guestDice, role, gameState]);

  // Reset refs when dice are cleared (re-roll on tie)
  useEffect(() => {
    if (
      gameState &&
      gameState.hostDice === null &&
      gameState.guestDice === null
    ) {
      prevHostDice.current = null;
      prevGuestDice.current = null;
      setHostAnimating(false);
      setGuestAnimating(false);
    }
  }, [gameState?.hostDice, gameState?.guestDice, gameState]);

  const handleRoll = useCallback(async () => {
    if (!role) return;
    const value = Math.floor(Math.random() * 6) + 1;

    // Start local animation
    if (role === 'host') setHostAnimating(true);
    else setGuestAnimating(true);

    // Write to Firestore IMMEDIATELY — no delay
    rollDice(value).catch(() => message.error('Zar atılamadı!'));

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 400);

    // Visual animation runs locally for 2s
    setTimeout(() => {
      if (role === 'host') setHostAnimating(false);
      else setGuestAnimating(false);
    }, 2000);
  }, [role, rollDice]);

  const handleReRoll = async () => {
    try {
      await resetDice();
    } catch {
      message.error('Hata!');
    }
  };

  const handleStartDraft = async () => {
    try {
      await startDraft();
    } catch {
      message.error('Hata!');
    }
  };

  if (!gameState) return null;

  const bothRolled =
    gameState.hostDice !== null && gameState.guestDice !== null;
  const isTie = bothRolled && gameState.hostDice === gameState.guestDice;
  const winner = gameState.firstPicker;

  const myDice = role === 'host' ? gameState.hostDice : gameState.guestDice;
  const canRoll =
    myDice === null &&
    !(role === 'host' ? hostAnimating : guestAnimating);

  return (
    <div className="dice-roll-view">
      {/* Screen flash on roll */}
      {showFlash && <div className="screen-flash" />}

      <div className="dice-header">
        <span className="dice-header__emoji">🎲</span>
        <Title level={2} style={{ margin: 0 }}>
          Zar Atışı
        </Title>
        <Text type="secondary">
          En yüksek zarı atan ilk seçim hakkını kazanır!
        </Text>
      </div>

      <div className="dice-arena">
        {/* Host */}
        <div className={`dice-side ${hostAnimating ? 'dice-side--active' : ''}`}>
          <div className="dice-side__label">
            <span className="dice-side__dot dice-side__dot--green" />
            <Title level={4} className="dice-side__name">
              {gameState.host.name}
            </Title>
          </div>
          <div className="dice-wrapper">
            <Dice value={gameState.hostDice} rolling={hostAnimating} size={140} />
          </div>
          {role === 'host' && canRoll && (
            <Button
              type="primary"
              size="large"
              onClick={handleRoll}
              className="roll-btn"
            >
              Zar At!
            </Button>
          )}
          {gameState.hostDice !== null && !hostAnimating && (
            <div className="dice-value-badge">{gameState.hostDice}</div>
          )}
          {role !== 'host' &&
            gameState.hostDice === null &&
            !hostAnimating && (
              <Text type="secondary" className="waiting-dots">
                Zar bekleniyor
              </Text>
            )}
        </div>

        {/* VS */}
        <div className="dice-vs">
          <div className="dice-vs__circle">
            <span>VS</span>
          </div>
        </div>

        {/* Guest */}
        <div className={`dice-side ${guestAnimating ? 'dice-side--active' : ''}`}>
          <div className="dice-side__label">
            <span className="dice-side__dot dice-side__dot--blue" />
            <Title level={4} className="dice-side__name">
              {gameState.guest?.name}
            </Title>
          </div>
          <div className="dice-wrapper">
            <Dice
              value={gameState.guestDice}
              rolling={guestAnimating}
              size={140}
            />
          </div>
          {role === 'guest' && canRoll && (
            <Button
              type="primary"
              size="large"
              onClick={handleRoll}
              className="roll-btn"
            >
              Zar At!
            </Button>
          )}
          {gameState.guestDice !== null && !guestAnimating && (
            <div className="dice-value-badge">{gameState.guestDice}</div>
          )}
          {role !== 'guest' &&
            gameState.guestDice === null &&
            !guestAnimating && (
              <Text type="secondary" className="waiting-dots">
                Zar bekleniyor
              </Text>
            )}
        </div>
      </div>

      {/* Results */}
      {bothRolled && !hostAnimating && !guestAnimating && !isTie && winner && (
        <div className="dice-result-banner winner-banner">
          <Title level={3} style={{ margin: 0 }}>
            🏆{' '}
            {winner === 'host'
              ? gameState.host.name
              : gameState.guest?.name}{' '}
            ilk seçim hakkını kazandı!
          </Title>
          <Button
            type="primary"
            size="large"
            onClick={handleStartDraft}
            className="glow-btn"
            style={{ marginTop: 16 }}
          >
            Kadro Seçimine Başla
          </Button>
        </div>
      )}

      {bothRolled && !hostAnimating && !guestAnimating && isTie && (
        <div className="dice-result-banner tie-banner">
          <Title level={3} style={{ margin: 0 }}>
            🤝 Berabere! Tekrar atın!
          </Title>
          <Button
            type="default"
            size="large"
            onClick={handleReRoll}
            style={{ marginTop: 16 }}
          >
            Zarları Sıfırla
          </Button>
        </div>
      )}
    </div>
  );
}
