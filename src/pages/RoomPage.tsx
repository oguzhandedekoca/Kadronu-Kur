import { Navigate } from 'react-router-dom';
import { Steps, Typography } from 'antd';
import {
  TeamOutlined,
  ThunderboltOutlined,
  SolutionOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useGame } from '../context/GameContext';
import LobbyView from '../components/LobbyView';
import DiceRollView from '../components/DiceRollView';
import DraftView from '../components/DraftView';
import ResultView from '../components/ResultView';

const { Title } = Typography;

const STATUS_STEP: Record<string, number> = {
  waiting: 0,
  adding_players: 0,
  rolling: 1,
  drafting: 2,
  completed: 3,
};

export default function RoomPage() {
  const { gameState } = useGame();

  if (!gameState) return <Navigate to="/" replace />;

  const step = STATUS_STEP[gameState.status] ?? 0;

  const renderView = () => {
    switch (gameState.status) {
      case 'waiting':
      case 'adding_players':
        return <LobbyView />;
      case 'rolling':
        return <DiceRollView />;
      case 'drafting':
        return <DraftView />;
      case 'completed':
        return <ResultView />;
      default:
        return <LobbyView />;
    }
  };

  return (
    <div className="room-page">
      <header className="room-header">
        <Title level={4} style={{ margin: 0 }}>
          ⚽ Kadronu Kur
        </Title>
      </header>

      <div className="game-steps">
        <Steps
          current={step}
          size="small"
          items={[
            {
              title: 'Lobi',
              icon: <TeamOutlined />,
            },
            {
              title: 'Zar Atışı',
              icon: <ThunderboltOutlined />,
            },
            {
              title: 'Kadro Seçimi',
              icon: <SolutionOutlined />,
            },
            {
              title: 'Tamamlandı',
              icon: <TrophyOutlined />,
            },
          ]}
        />
      </div>

      <div className="room-content">{renderView()}</div>
    </div>
  );
}
