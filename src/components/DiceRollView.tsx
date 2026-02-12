import { useState, useCallback } from 'react';
import { Button, Typography } from 'antd';
import { useGame } from '../context/GameContext';
import Dice from './Dice';

const { Title, Text } = Typography;

export default function DiceRollView() {
  const { gameState, setDice, resetDice, startDraft } = useGame();
  const [hostRolling, setHostRolling] = useState(false);
  const [guestRolling, setGuestRolling] = useState(false);

  if (!gameState) return null;

  const handleRoll = useCallback(
    (who: 'host' | 'guest') => {
      const value = Math.floor(Math.random() * 6) + 1;

      if (who === 'host') {
        setHostRolling(true);
        setTimeout(() => {
          setHostRolling(false);
          setDice('host', value);
        }, 2000);
      } else {
        setGuestRolling(true);
        setTimeout(() => {
          setGuestRolling(false);
          setDice('guest', value);
        }, 2000);
      }
    },
    [setDice],
  );

  const handleReRoll = () => {
    resetDice();
  };

  const bothRolled =
    gameState.hostDice !== null && gameState.guestDice !== null;
  const isTie =
    bothRolled && gameState.hostDice === gameState.guestDice;
  const winner = gameState.firstPicker;

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
            <Dice value={gameState.hostDice} rolling={hostRolling} size={130} />
          </div>
          {gameState.hostDice === null && !hostRolling && (
            <Button
              type="primary"
              size="large"
              onClick={() => handleRoll('host')}
              className="roll-btn"
            >
              Zar At!
            </Button>
          )}
          {gameState.hostDice !== null && !hostRolling && (
            <div className="dice-value">{gameState.hostDice}</div>
          )}
        </div>

        {/* VS */}
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
              rolling={guestRolling}
              size={130}
            />
          </div>
          {gameState.guestDice === null && !guestRolling && (
            <Button
              type="primary"
              size="large"
              onClick={() => handleRoll('guest')}
              className="roll-btn"
            >
              Zar At!
            </Button>
          )}
          {gameState.guestDice !== null && !guestRolling && (
            <div className="dice-value">{gameState.guestDice}</div>
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
            onClick={startDraft}
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
