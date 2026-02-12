import { useState, useCallback } from 'react';
import { Button, Typography, message } from 'antd';
import { useGame } from '../context/GameContext';
import Dice from './Dice';

const { Title, Text } = Typography;

export default function DiceRollView() {
  const { gameState, role, rollDice, resetDice, startDraft } = useGame();
  const [rolling, setRolling] = useState(false);

  if (!gameState) return null;

  const handleRoll = useCallback(async () => {
    if (!role) return;
    const value = Math.floor(Math.random() * 6) + 1;
    setRolling(true);
    // show animation, then commit to Firestore
    setTimeout(async () => {
      setRolling(false);
      try {
        await rollDice(value);
      } catch {
        message.error('Zar atılamadı!');
      }
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

  const bothRolled =
    gameState.hostDice !== null && gameState.guestDice !== null;
  const isTie = bothRolled && gameState.hostDice === gameState.guestDice;
  const winner = gameState.firstPicker;

  // What can the current user do?
  const myDice = role === 'host' ? gameState.hostDice : gameState.guestDice;
  const canRoll = myDice === null && !rolling;
  const isHostRolling = role === 'host' && rolling;
  const isGuestRolling = role === 'guest' && rolling;

  return (
    <div className="dice-roll-view">
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
        {/* Host side */}
        <div className="dice-side">
          <Title level={4} className="dice-side__name">
            {gameState.host.name}
          </Title>
          <div className="dice-wrapper">
            <Dice
              value={gameState.hostDice}
              rolling={isHostRolling}
              size={130}
            />
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
          {gameState.hostDice !== null && !isHostRolling && (
            <div className="dice-value">{gameState.hostDice}</div>
          )}
          {role !== 'host' && gameState.hostDice === null && !isHostRolling && (
            <Text type="secondary">Zar bekleniyor...</Text>
          )}
        </div>

        <div className="dice-vs">
          <span className="dice-vs__text">VS</span>
        </div>

        {/* Guest side */}
        <div className="dice-side">
          <Title level={4} className="dice-side__name">
            {gameState.guest?.name}
          </Title>
          <div className="dice-wrapper">
            <Dice
              value={gameState.guestDice}
              rolling={isGuestRolling}
              size={130}
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
          {gameState.guestDice !== null && !isGuestRolling && (
            <div className="dice-value">{gameState.guestDice}</div>
          )}
          {role !== 'guest' &&
            gameState.guestDice === null &&
            !isGuestRolling && (
              <Text type="secondary">Zar bekleniyor...</Text>
            )}
        </div>
      </div>

      {/* Result */}
      {bothRolled && !isTie && winner && (
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

      {isTie && (
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
