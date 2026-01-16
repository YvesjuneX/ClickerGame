import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import './Game.css'; // We'll create this for specific game styling

const Game = () => {
  console.log('Game Component Rendered');
  const { user, logout } = useUser();
  const { t, language, switchLanguage } = useLanguage(); // Use Context
  const [gameState, setGameState] = useState('menu'); // menu, play, config, language

  // Settings State
  const [volume, setVolume] = useState(50);
  // Removed local language state

  // UI State
  const [showTrophies, setShowTrophies] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  // State for Money
  const [money, setMoney] = useState(0);

  // State for Items
  const [autoClickers, setAutoClickers] = useState(0);
  const [autoClickerCost, setAutoClickerCost] = useState(25); // Initial cost

  // Mock trophies data
  const trophies = [
    { id: 1, name: t('trophy1Name'), description: t('trophy1Desc'), unlocked: true },
    { id: 2, name: t('trophy2Name'), description: t('trophy2Desc'), unlocked: false },
    { id: 3, name: t('trophy3Name'), description: t('trophy3Desc'), unlocked: false },
  ];

  // AutoClicker Effect
  useEffect(() => {
    let interval;
    if (gameStarted && autoClickers > 0) {
      interval = setInterval(() => {
        setMoney(prev => prev + autoClickers);
      }, 1000); // 1 click per second per autoclicker
    }
    return () => clearInterval(interval);
  }, [gameStarted, autoClickers]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleAreaClick = () => {
    if (!gameStarted) {
      setGameStarted(true);
    } else {
      setMoney(prev => prev + 1);
    }
  };

  const buyAutoClicker = () => {
    if (money >= autoClickerCost) {
      setMoney(prev => prev - autoClickerCost);
      setAutoClickers(prev => prev + 1);
      // Increase cost by 20% each time (rounded)
      setAutoClickerCost(prev => Math.floor(prev * 1.5));
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case 'menu':
        return (
          <div className="menu-options">
            <h1 className="menu-title">{t('appTitle')}</h1>
            <button className="menu-btn" onClick={() => { setGameState('play'); setGameStarted(false); }}>{t('clickMe')}</button>
            <button className="menu-btn" onClick={() => setGameState('config')}>{t('configuration')}</button>
            <button className="menu-btn" onClick={() => setGameState('language')}>{t('language')}</button>
          </div>
        );
      case 'play':
        return (
          <div className="game-play-layout">
            <aside className={`shop-sidebar glass-card ${!gameStarted ? 'dimmed' : ''}`}>
              <button className="back-to-menu-btn sidebar-back-btn" onClick={() => setGameState('menu')} disabled={!gameStarted}>
                ← {t('backToMenu')}
              </button>
              <h2>{t('shopTitle')} (${money})</h2>
              <div className="shop-items">
                {/* AutoClicker Item */}
                <div className="shop-item">
                  <span>{t('autoClicker')}</span>
                  <button
                    className="buy-btn"
                    disabled={!gameStarted || money < autoClickerCost}
                    onClick={buyAutoClicker}
                  >
                    {t('buyUpgrade')} (${autoClickerCost})
                  </button>
                </div>
                {/* Placeholder Item 2 */}
                <div className="shop-item">
                  <span>Item 2</span>
                  <button className="buy-btn" disabled={!gameStarted}>{t('buyUpgrade')} ({t('itemCost').replace('{cost}', '50')})</button>
                </div>
              </div>
            </aside>
            <div
              className={`game-main-area glass-card ${gameStarted ? 'active-click-area' : 'start-overlay'}`}
              onClick={handleAreaClick}
            >
              <div className={`game-header-stats ${!gameStarted ? 'dimmed' : ''}`}>
                <span className="clicks-counter">Clicks: {money}</span>
              </div>

              {!gameStarted ? (
                <div className="start-message-container">
                  <h1 className="pulsing-text">{t('startGame')}</h1>
                </div>
              ) : (
                <>
                  <div className="game-area-header-left">
                    <h1 className="game-area-title">{t('clickerArea')}</h1>
                    <div className="inventory-display">
                      <span>{t('inventory')}:</span>
                      <div className="inventory-item">
                        {t('autoClicker')}: {autoClickers}
                      </div>
                    </div>
                  </div>

                  {/* Removed welcome message and instruction text */}
                  <div className="clicker-container">
                    {/* Button removed, entire area is clickable */}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 'config':
        return (
          <div className="settings-area">
            <button className="nav-arrow-btn" onClick={() => setGameState('menu')}>←</button>
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
            <button className="nav-arrow-btn" onClick={() => setGameState('menu')}>←</button>
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
      {/* Universal Back/Logout Button - Hidden in Play Mode */}
      {gameState !== 'play' && (
        <button className="back-button" onClick={handleLogoutClick}>
          ← {t('logout')}
        </button>
      )}

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
      {gameState === 'play' ? (
        renderContent()
      ) : (
        <div className={`glass-card game-main-card ${showTrophies ? 'hidden' : ''}`}>
          {renderContent()}
        </div>
      )}

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

      {/* Bottom Right Trophy Button - Hidden when Trophies Open OR in Play Mode */}
      {!showTrophies && gameState !== 'play' && (
        <button className="trophy-button" onClick={() => setShowTrophies(true)}>
          🏆
        </button>
      )}
    </div>
  );
};

export default Game;
