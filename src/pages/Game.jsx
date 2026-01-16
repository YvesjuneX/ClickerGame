import { useState, useEffect, useRef } from 'react';
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
  const [totalClicks, setTotalClicks] = useState(0);
  const [isSpinFast, setIsSpinFast] = useState(false);

  // State for Items
  const [autoClickers, setAutoClickers] = useState(0);
  const [autoClickerCost, setAutoClickerCost] = useState(25); // Initial cost
  const [miamiCount, setMiamiCount] = useState(0);
  const [miamiCost, setMiamiCost] = useState(250);
  const [chillGuyCount, setChillGuyCount] = useState(0);
  const [chillGuyCost, setChillGuyCost] = useState(2500);

  // Mock trophies data
  const trophies = [
    { id: 1, name: t('trophy1Name'), description: t('trophy1Desc'), unlocked: true },
    { id: 2, name: t('trophy2Name'), description: t('trophy2Desc'), unlocked: false },
    { id: 3, name: t('trophy3Name'), description: t('trophy3Desc'), unlocked: false },
  ];

  // AutoClicker Effect
  // AutoClicker Effect
  // Calculate Total CPS
  const totalCPS = autoClickers + (miamiCount * 5) + (chillGuyCount * 25); // AutoClicker = 1 CPS, Miami = 5 CPS, Chill Guy = 25 CPS

  // AutoClicker Effect
  useEffect(() => {
    let interval;
    if (gameStarted && totalCPS > 0) {
      // Calculate delay to distribute clicks evenly over 1 second
      // e.g., 4 CPS -> 1000/4 = 250ms delay -> +1 money every 250ms
      const delay = Math.max(1, Math.floor(1000 / totalCPS));

      interval = setInterval(() => {
        setMoney(prev => prev + 1);
        setTotalClicks(prev => prev + 1);
      }, delay);
    }
    return () => clearInterval(interval);
  }, [gameStarted, totalCPS]);

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
      setTotalClicks(prev => prev + 1);
    }
  };

  const boostTimeoutRef = useRef(null);

  const handleTrollClick = (e) => {
    e.stopPropagation(); // Prevent triggering area click
    if (gameStarted) {
      // Double click effect
      setMoney(prev => prev + 2);
      setTotalClicks(prev => prev + 2);
      // Clear existing timeout if any
      if (boostTimeoutRef.current) {
        clearTimeout(boostTimeoutRef.current);
      }
      // Speed up spin
      setIsSpinFast(true);
      // Set new timeout and store reference
      boostTimeoutRef.current = setTimeout(() => setIsSpinFast(false), 500);
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

  const buyMiamiItem = () => {
    if (money >= miamiCost) {
      setMoney(prev => prev - miamiCost);
      setMiamiCount(prev => prev + 1);
      setMiamiCost(prev => Math.floor(prev * 1.5));
    }
  };

  const buyChillGuy = () => {
    if (money >= chillGuyCost) {
      setMoney(prev => prev - chillGuyCost);
      setChillGuyCount(prev => prev + 1);
      setChillGuyCost(prev => Math.floor(prev * 1.5));
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
                <div className="shop-item" title="Generates 1 click per second">
                  <span>{t('autoClicker')}</span>
                  <button
                    className="buy-btn"
                    disabled={!gameStarted || money < autoClickerCost}
                    onClick={buyAutoClicker}
                  >
                    {t('buyUpgrade')} (${autoClickerCost})
                  </button>
                </div>
                {/* Miami Item */}
                <div className="shop-item" title={t('miamiDesc')}>
                  <span>{t('miamiItem')}</span>
                  {autoClickers >= 5 ? (
                    <button
                      className="buy-btn"
                      disabled={!gameStarted || money < miamiCost}
                      onClick={buyMiamiItem}
                    >
                      {t('buyUpgrade')} (${miamiCost})
                    </button>
                  ) : (
                    <button className="buy-btn" disabled>
                      🔒 (Rev: 5 AutoClickers)
                    </button>
                  )}
                </div>
                {/* Chill Guy Item */}
                <div className="shop-item" title={t('chillGuyDesc')}>
                  <span>{t('chillGuyItem')}</span>
                  {miamiCount >= 5 ? (
                    <button
                      className="buy-btn"
                      disabled={!gameStarted || money < chillGuyCost}
                      onClick={buyChillGuy}
                    >
                      {t('buyUpgrade')} (${chillGuyCost})
                    </button>
                  ) : (
                    <button className="buy-btn" disabled>
                      🔒 (Rev: 5 Miami)
                    </button>
                  )}
                </div>
              </div>
            </aside>
            <div
              className={`game-main-area glass-card ${gameStarted ? 'active-click-area' : 'start-overlay'}`}
              onClick={handleAreaClick}
            >
              <div className={`game-header-stats ${!gameStarted ? 'dimmed' : ''}`}>
                <div className="stats-container">
                  <span className="money-counter">${money}</span>
                  <span className="total-clicks-counter">Total Clicks: {totalClicks}</span>
                  <button
                    className="debug-btn"
                    onClick={(e) => { e.stopPropagation(); setMoney(prev => prev + 50000); }}
                    title="Debug: Add $50,000"
                  >
                    🐛 +$50K
                  </button>
                </div>
                <div
                  className="cps-display"
                  title={`AutoClicker: ${autoClickers}/s\nMiami: ${miamiCount * 5}/s\nChill Guy: ${chillGuyCount * 25}/s`}
                >
                  {totalCPS} CP/S
                </div>
              </div>

              {!gameStarted ? (
                <div className="start-message-container">
                  <h1 className="pulsing-text">{t('startGame')}</h1>
                </div>
              ) : (
                <>
                  <div className="game-area-header-left">
                    <h1 className="game-area-title">{t('clickerArea')}</h1>
                  </div>

                  {/* Removed welcome message and instruction text */}
                  <div className="clicker-container">
                    <img
                      src="/trollface.png"
                      alt="Troll Face"
                      className={`trollface-spin ${isSpinFast ? 'fast' : ''}`}
                      onClick={handleTrollClick}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Inventory Sidebar (Right) */}
            <aside className={`inventory-sidebar glass-card ${!gameStarted ? 'dimmed' : ''}`}>
              <h2>{t('inventory')}</h2>
              <div className="inventory-display">
                {/* AutoClicker Inventory Item */}
                <div className="inventory-item">
                  <div className="inventory-icon-container">
                    <img src="/nyancat.jpg" alt="Nyan Cat" className="inventory-icon" />
                  </div>
                  <div className="inventory-info">
                    <span className="inventory-name">{t('autoClicker')}</span>
                    <span className="inventory-count">{autoClickers}</span>
                  </div>
                </div>

                {/* Miami Inventory Item */}
                {miamiCount > 0 && (
                  <div className="inventory-item">
                    <div className="inventory-icon-container">
                      <img src="/miami.jpg" alt="Miami" className="inventory-icon" />
                    </div>
                    <div className="inventory-info">
                      <span className="inventory-name">{t('miamiItem')}</span>
                      <span className="inventory-count">{miamiCount}</span>
                    </div>
                  </div>
                )}

                {/* Chill Guy Inventory Item */}
                {chillGuyCount > 0 && (
                  <div className="inventory-item">
                    <div className="inventory-icon-container">
                      <img src="/chillguy.jpg" alt="Chill Guy" className="inventory-icon" />
                    </div>
                    <div className="inventory-info">
                      <span className="inventory-name">{t('chillGuyItem')}</span>
                      <span className="inventory-count">{chillGuyCount}</span>
                    </div>
                  </div>
                )}

              </div>
            </aside>
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
