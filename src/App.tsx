import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import './App.css';

function BackgroundEffects() {
  return (
    <div className="bg-effects" aria-hidden>
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />
      <div className="bg-grid" />
    </div>
  );
}

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
        <BackgroundEffects />
        <BrowserRouter>
          <a href="#main-content" className="skip-link">
            İçeriğe atla
          </a>
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
