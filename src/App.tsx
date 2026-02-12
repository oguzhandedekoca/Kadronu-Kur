import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#52c41a',
          borderRadius: 12,
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Card: {
            colorBgContainer: 'rgba(255, 255, 255, 0.04)',
            colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
          },
          Steps: {
            colorPrimary: '#52c41a',
          },
        },
      }}
    >
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </ConfigProvider>
  );
}

export default App;
