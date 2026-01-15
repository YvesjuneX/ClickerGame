import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import './Game.css'; // We'll create this for specific game styling

const Game = () => {
  const { user, logout } = useUser();
  const { t, language, switchLanguage } = useLanguage(); // Use Context
  const [gameState, setGameState] = useState('menu'); // menu, play, config, language

  // Settings State
  const [volume, setVolume] = useState(50);
  // Removed local language state

  // UI State
  const [showTrophies, setShowTrophies] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Mock trophies data (These should ideally be translated too, but for now let's keep them static or wrap key strings)
  const trophies = [
    { id: 1, name: t('trophy1Name'), description: t('trophy1Desc'), unlocked: true },
    { id: 2, name: t('trophy2Name'), description: t('trophy2Desc'), unlocked: false },
    { id: 3, name: t('trophy3Name'), description: t('trophy3Desc'), unlocked: false },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'menu':
        return (
          <div className="menu-options">
            <h1 className="menu-title">{t('appTitle')}</h1>
            <button className="menu-btn" onClick={() => setGameState('play')}>{t('clickMe')}</button>
            <button className="menu-btn" onClick={() => setGameState('config')}>{t('configuration')}</button>
            <button className="menu-btn" onClick={() => setGameState('language')}>{t('language')}</button>
          </div>
        );
      case 'play':
        return (
          <div className="game-play-area">
            <button className="back-to-menu-btn" onClick={() => setGameState('menu')}>{t('backToMenu')}</button>
            <h1>{t('clickerArea')}</h1>
            <p>{t('welcome').replace('{name}', user?.name || 'User')}</p>
            <div className="clicker-container">
              <button className="click-btn">{t('clickBtn')}</button>
            </div>
          </div>
        );
      case 'config':
        return (
          <div className="settings-area">
            <button className="back-to-menu-btn" onClick={() => setGameState('menu')}>{t('backToMenu')}</button>
            <h2>{t('configuration')}</h2>
            <div className="setting-item">
              <label>{t('volume')}: {volume}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="settings-area">
            <button className="back-to-menu-btn" onClick={() => setGameState('menu')}>{t('backToMenu')}</button>
            <h2>{t('language')}</h2>
            <div className="language-options">
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => switchLanguage('en')}
              >
                {t('english')}
              </button>
              <button
                className={`lang-btn ${language === 'es' ? 'active' : ''}`}
                onClick={() => switchLanguage('es')}
              >
                {t('spanish')}
              </button>
            </div>
          </div>
        );
      default:
        return <div>Unknown State</div>;
    }
  };

  return (
    <div className="game-container">
      {/* Universal Back/Logout Button (Always visible logic, maybe hide in Play mode if Back to Menu exists? 
          User asked for logout button same position. Let's keep it consistent.) */}
      <button className="back-button" onClick={handleLogoutClick}>
        ← {t('logout')}
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h2>{t('logoutConfirmTitle')}</h2>
            <p>{t('logoutConfirmMsg')}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cancelLogout}>{t('cancel')}</button>
              <button className="btn-primary" onClick={confirmLogout}>{t('confirmLogout')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`glass-card game-main-card ${showTrophies ? 'hidden' : ''}`}>
        {renderContent()}
      </div>

      {/* Trophies View */}
      {showTrophies && (
        <div className="glass-card trophies-view">
          <button className="close-trophies" onClick={() => setShowTrophies(false)}>X</button>
          <h2>{t('yourTrophies')}</h2>
          <div className="trophies-grid">
            {trophies.map(trophy => (
              <div key={trophy.id} className={`trophy-card ${trophy.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="trophy-icon">🏆</div>
                <h3>{trophy.name}</h3>
                <p>{trophy.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Right Trophy Button - Only show if playing? Or always? 
          User said "in the game area". Assuming 'play' mode or generally available. 
          Let's show it always for now, except when Trophies are open. */}
      {!showTrophies && (
        <button className="trophy-button" onClick={() => setShowTrophies(true)}>
          🏆
        </button>
      )}
    </div>
  );
};

export default Game;
