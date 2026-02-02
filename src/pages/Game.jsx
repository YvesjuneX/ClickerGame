import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import './Game.css'; // We'll create this for specific game styling

const formatNumber = (num) => {
  if (num < 1000) return num.toLocaleString('es-ES');
  if (num < 1000000) {
    const thousands = num / 1000;
    return thousands.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + 'K';
  }
  if (num < 1000000000) {
    const millions = num / 1000000;
    return millions.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + 'M';
  }
  const billions = num / 1000000000;
  return billions.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + 'B';
};

const Game = () => {
  console.log('Game Component Rendered');
  const { user, logout } = useUser();
  const { t, language, switchLanguage } = useLanguage(); // Use Context
  const [gameState, setGameState] = useState('menu'); // menu, play, config, language

// Settings State
  const [volume, setVolume] = useState(50);
  const [backgroundPlay, setBackgroundPlay] = useState(true); // Default: enabled
  // Removed local language state

  // UI State
  const [showTrophies, setShowTrophies] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  // State for Money
  const [money, setMoney] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isClicked, setIsClicked] = useState(false); // Changed from isSpinFast

  // State for Items
  const [autoClickers, setAutoClickers] = useState(0);
  const [autoClickerCost, setAutoClickerCost] = useState(25); // Initial cost
  const [autoClickersProduced, setAutoClickersProduced] = useState(0); // Lifetime produced

  const [miamiCount, setMiamiCount] = useState(0);
  const [miamiCost, setMiamiCost] = useState(250);
  const [miamiProduced, setMiamiProduced] = useState(0); // Lifetime produced

  const [chillGuyCount, setChillGuyCount] = useState(0);
  const [chillGuyCost, setChillGuyCost] = useState(2500);
  const [chillGuyProduced, setChillGuyProduced] = useState(0); // Lifetime produced

  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [achievementNotification, setAchievementNotification] = useState(null);

  const achievements = [
    { id: 'first_click', name: t('firstClickName'), description: t('firstClickDesc'), target: 1, current: totalClicks, type: 'clicks' },
    { id: '100_clicks', name: t('clicks100Name'), description: t('clicks100Desc'), target: 100, current: totalClicks, type: 'clicks' },
    { id: '1000_clicks', name: t('clicks1000Name'), description: t('clicks1000Desc'), target: 1000, current: totalClicks, type: 'clicks' },
    { id: '10000_clicks', name: t('clicks10000Name'), description: t('clicks10000Desc'), target: 10000, current: totalClicks, type: 'clicks' },
    { id: 'first_purchase', name: t('firstPurchaseName'), description: t('firstPurchaseDesc'), target: 1, current: autoClickers, type: 'count' },
    { id: '5_auto_clickers', name: t('nyanArmyName'), description: t('nyanArmyDesc'), target: 5, current: autoClickers, type: 'count' },
    { id: 'first_miami', name: t('miamiVibesName'), description: t('miamiVibesDesc'), target: 1, current: miamiCount, type: 'count' },
    { id: 'first_chill_guy', name: t('chillLifeName'), description: t('chillLifeDesc'), target: 1, current: chillGuyCount, type: 'count' },
    { id: 'millionaire', name: t('richName'), description: t('richDesc'), target: 1000000, current: money, type: 'money' },
    { id: 'billionaire', name: t('billionaireName'), description: t('billionaireDesc'), target: 1000000000, current: money, type: 'money' },
  ];

  const getProgressText = (achievement) => {
    const remaining = Math.max(0, achievement.target - achievement.current);
    const progress = Math.min(100, (achievement.current / achievement.target) * 100);
    return { remaining, progress };
  };

  useEffect(() => {
    if (!gameStarted) return;

    achievements.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.current >= achievement.target) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setAchievementNotification({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description
        });
        setTimeout(() => setAchievementNotification(null), 4000);
      }
    });
  }, [money, totalClicks, autoClickers, miamiCount, chillGuyCount, gameStarted]);

  // AutoClicker Effect
  // Calculate Total CPS
  const totalCPS = autoClickers + (miamiCount * 5) + (chillGuyCount * 25); // AutoClicker = 1 CPS, Miami = 5 CPS, Chill Guy = 25 CPS

// AutoClicker Effect
  // AutoClicker Effect (Delta Time Logic)
  useEffect(() => {
    let interval;
    if (gameStarted && totalCPS > 0) {
      // Run frequently (e.g., 10 TPS) for smooth UI in foreground.
      // In background, browser throttles to ~1 TPS, but logic handles it via Delta Time.
      interval = setInterval(() => {
        // Check if page is visible and background play is disabled
        const isPageVisible = !document.hidden;
        const shouldPlay = backgroundPlay || isPageVisible;
        
        if (!shouldPlay) {
          // Don't update time when paused to prevent large jumps when resuming
          return;
        }
        
        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000; // time elapsed in seconds
        lastTimeRef.current = now;

        if (dt > 0) {
          const amountToProduce = totalCPS * dt;
          accumulatorRef.current += amountToProduce;

          const wholeAmount = Math.floor(accumulatorRef.current);

          if (wholeAmount > 0) {
            accumulatorRef.current -= wholeAmount;

            setMoney(prev => prev + wholeAmount);
            setTotalClicks(prev => prev + wholeAmount);

            // Distribute credit for lifetime stats based on proportional contribution
            if (autoClickers > 0) {
              setAutoClickersProduced(prev => prev + (wholeAmount * (autoClickers / totalCPS)));
            }
            if (miamiCount > 0) {
              setMiamiProduced(prev => prev + (wholeAmount * ((miamiCount * 5) / totalCPS)));
            }
            if (chillGuyCount > 0) {
              setChillGuyProduced(prev => prev + (wholeAmount * ((chillGuyCount * 25) / totalCPS)));
            }
          }
        }
      }, 16);
    } else {
      // If game not started or 0 CPS, keep time updated so we don't jump when CPS starts
      lastTimeRef.current = Date.now();
    }
    return () => clearInterval(interval);
  }, [gameStarted, totalCPS, autoClickers, miamiCount, chillGuyCount, backgroundPlay]);

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
      // Reset time anchor immediately when game starts to prevent jump
      lastTimeRef.current = Date.now();
    } else {
      setMoney(prev => prev + 1);
      setTotalClicks(prev => prev + 1);
    }
  };

  const boostTimeoutRef = useRef(null);

  // Refs for Delta Time Logic
  const lastTimeRef = useRef(Date.now());
  const accumulatorRef = useRef(0);

// Reset time anchor when game keeps pausing/unpausing if we had pause logic, 
  // but for now main dependency is gameStarted.
  useEffect(() => {
    if (gameStarted) {
      lastTimeRef.current = Date.now();
    }
  }, [gameStarted]);

  // Handle visibility change to reset time reference when resuming
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (gameStarted && !document.hidden && backgroundPlay) {
        // Reset time reference when page becomes visible to prevent large jumps
        lastTimeRef.current = Date.now();
        accumulatorRef.current = 0;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStarted, backgroundPlay]);

  // Nyan Cat Visuals State
  const [floatingCats, setFloatingCats] = useState([]);

  // Nyan Cat Spawning Logic
  useEffect(() => {
    if (!gameStarted || autoClickers === 0) return;

    // Logic: Scale max cats logarithmically with autoClickers
    // log(2) ~= 0.7 -> max 3
    // log(10) ~= 2.3 -> max 6
    // log(50) ~= 3.9 -> max 9
    const maxCats = 2 + Math.floor(Math.log(autoClickers + 1) * 2);

    const spawnInterval = setInterval(() => {
      setFloatingCats(prev => {
        if (prev.length >= maxCats) return prev;

        // Chance to spawn depends on how empty it is compared to max
        if (Math.random() > 0.4) return prev; // 60% skip chance to add randomness

        // Avoid center (30%-70%) to not overlap Troll Face
        const isTop = Math.random() > 0.5;
        const top = isTop ? Math.random() * 30 : (Math.random() * 30 + 70);

        const newCat = {
          id: Date.now() + Math.random(),
          top: top,
          duration: Math.random() * 5 + 7, // 7s to 12s speed (Slower for majesty)
          size: Math.random() * 60 + 90 // Larger: 90px to 150px
        };
        return [...prev, newCat];
      });
    }, 1000); // Check every second

    return () => clearInterval(spawnInterval);
  }, [gameStarted, autoClickers]);

  const removeFloatingCat = (id) => {
    setFloatingCats(prev => prev.filter(cat => cat.id !== id));
  };

  const handleTrollClick = (e) => {
    e.stopPropagation(); // Prevent triggering area click
    if (gameStarted) {
      // Double click effect
      setMoney(prev => prev + 2);
      setTotalClicks(prev => prev + 2);

      // Clear existing timeout to reset animation if clicked fast
      if (boostTimeoutRef.current) {
        clearTimeout(boostTimeoutRef.current);
      }

      // Trigger click animation
      setIsClicked(true);
      boostTimeoutRef.current = setTimeout(() => setIsClicked(false), 100);
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

  // Tooltip State
  const [tooltip, setTooltip] = useState({ show: false, type: null, content: '', x: 0, y: 0, direction: 'right' });

  const handleMouseEnter = (e, type, direction = 'right', staticContent = null) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if (direction === 'right') {
      x = rect.right + 15;
      y = rect.top + (rect.height / 2);
    } else {
      // Left positioning
      x = rect.left - 15;
      y = rect.top + (rect.height / 2);
    }

    setTooltip({
      show: true,
      type,
      content: staticContent, // For simple static tooltips if needed
      direction,
      x,
      y
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, show: false, type: null }));
  };

  // Helper to generate dynamic content based on type
  const getTooltipContent = () => {
    if (!tooltip.show) return '';

    const { type, content } = tooltip;

    if (content) return content; // Fallback for static content

    if (type === 'autoClickerShop') return t('autoClickerDesc');
    if (type === 'miamiShop') return t('miamiDesc');
    if (type === 'chillGuyShop') return t('chillGuyDesc');

    if (type === 'cps') {
      const parts = [];
      if (autoClickers > 0) parts.push(`AutoClicker: ${formatNumber(autoClickers)}/s`);
      if (miamiCount > 0) parts.push(`Miami: ${formatNumber(miamiCount * 5)}/s`);
      if (chillGuyCount > 0) parts.push(`Chill Guy: ${formatNumber(chillGuyCount * 25)}/s`);
      return parts.length > 0 ? parts.join('\n') : "0 CP/S";
    }

    if (type === 'autoClickerInv') {
      const individual = 1;
      const total = autoClickers * individual;
      return `${t('autoClicker')}\n${t('each')}: ${individual} CP/S\n${t('total')}: ${formatNumber(total)} CP/S\n${t('produced')}: ${formatNumber(Math.floor(autoClickersProduced))}`;
    }

    if (type === 'miamiInv') {
      const individual = 5;
      const total = miamiCount * individual;
      return `${t('miamiItem')}\n${t('each')}: ${individual} CP/S\n${t('total')}: ${formatNumber(total)} CP/S\n${t('produced')}: ${formatNumber(Math.floor(miamiProduced))}`;
    }

    if (type === 'chillGuyInv') {
      const individual = 25;
      const total = chillGuyCount * individual;
      return `${t('chillGuyItem')}\n${t('each')}: ${individual} CP/S\n${t('total')}: ${formatNumber(total)} CP/S\n${t('produced')}: ${formatNumber(Math.floor(chillGuyProduced))}`;
    }

    return '';
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
              <h2>{t('shopTitle')}</h2>
              <div className="shop-items">
                {/* AutoClicker Item */}
                <div
                  className={`shop-item ${money < autoClickerCost ? 'unaffordable' : ''}`}
                  onMouseEnter={(e) => handleMouseEnter(e, 'autoClickerShop', 'right')}
                  onMouseLeave={handleMouseLeave}
                >
                  <span>{t('autoClicker')}</span>
                  <button
                    className="buy-btn"
                    disabled={!gameStarted || money < autoClickerCost}
                    onClick={buyAutoClicker}
                  >
                    {t('buyUpgrade')} (${formatNumber(autoClickerCost)})
                  </button>
                </div>
                {/* Miami Item */}
                <div
                  className={`shop-item ${money < miamiCost ? 'unaffordable' : ''}`}
                  onMouseEnter={(e) => handleMouseEnter(e, 'miamiShop', 'right')}
                  onMouseLeave={handleMouseLeave}
                >
                  <span>{t('miamiItem')}</span>
                  {autoClickers >= 5 ? (
                      <button
                        className="buy-btn"
                        disabled={!gameStarted || money < miamiCost}
                        onClick={buyMiamiItem}
                      >
                        {t('buyUpgrade')} (${formatNumber(miamiCost)})
                    </button>
                  ) : (
                    <button className="buy-btn" disabled>
                      🔒 (Rev: 5 AutoClickers)
                    </button>
                  )}
                </div>
                {/* Chill Guy Item */}
                <div
                  className={`shop-item ${money < chillGuyCost ? 'unaffordable' : ''}`}
                  onMouseEnter={(e) => handleMouseEnter(e, 'chillGuyShop', 'right')}
                  onMouseLeave={handleMouseLeave}
                >
                  <span>{t('chillGuyItem')}</span>
                  {miamiCount >= 5 ? (
                      <button
                        className="buy-btn"
                        disabled={!gameStarted || money < chillGuyCost}
                        onClick={buyChillGuy}
                      >
                        {t('buyUpgrade')} (${formatNumber(chillGuyCost)})
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
                  <span className="money-counter">${formatNumber(money)}</span>
                  <span className="total-clicks-counter">Total Clicks: {formatNumber(totalClicks)}</span>
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
                  onMouseEnter={(e) => handleMouseEnter(e, 'cps', 'left')}
                  onMouseLeave={handleMouseLeave}
                >
                  {formatNumber(totalCPS)} CP/S
                </div>
              </div>

              {!gameStarted ? (
                <div className="start-message-container">
                  <h1 className="pulsing-text">{t('startGame')}</h1>
                </div>
              ) : (
                <>
                  {/* Floating Nyan Cats */}
                  {floatingCats.map(cat => (
                    <img
                      key={cat.id}
                      src="/nyancat.gif"
                      className="floating-nyan-cat"
                      style={{
                        top: `${cat.top}%`,
                        width: `${cat.size}px`,
                        animation: `flyRight ${cat.duration}s linear forwards`
                      }}
                      onAnimationEnd={() => removeFloatingCat(cat.id)}
                      alt=""
                    />
                  ))}

                  {/* Removed welcome message and instruction text */}
                  <div className="clicker-container">
                    <img
                      src="/trollFace.png"
                      alt="Troll Face"
                      className={`troll-face ${isClicked ? 'clicked' : ''}`}
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
                {autoClickers > 0 && (
                  <div
                    className="inventory-item"
                    onMouseEnter={(e) => handleMouseEnter(e, 'autoClickerInv', 'left')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="inventory-icon-container">
                      <img src="/nyancat.jpg" alt="Nyan Cat" className="inventory-icon" />
                    </div>
                    <div className="inventory-info">
                      <span className="inventory-name">{t('autoClicker')}</span>
                      <span className="inventory-count">{formatNumber(autoClickers)}</span>
                    </div>
                  </div>
                )}

                {/* Miami Inventory Item */}
                {miamiCount > 0 && (
                  <div
                    className="inventory-item"
                    onMouseEnter={(e) => handleMouseEnter(e, 'miamiInv', 'left')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="inventory-icon-container">
                      <img src="/miami.jpg" alt="Miami" className="inventory-icon" />
                    </div>
                    <div className="inventory-info">
                      <span className="inventory-name">{t('miamiItem')}</span>
                      <span className="inventory-count">{formatNumber(miamiCount)}</span>
                    </div>
                  </div>
                )}

                {/* Chill Guy Inventory Item */}
                {chillGuyCount > 0 && (
                  <div
                    className="inventory-item"
                    onMouseEnter={(e) => handleMouseEnter(e, 'chillGuyInv', 'left')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="inventory-icon-container">
                      <img src="/chillguy.jpg" alt="Chill Guy" className="inventory-icon" />
                    </div>
                    <div className="inventory-info">
                      <span className="inventory-name">{t('chillGuyItem')}</span>
                      <span className="inventory-count">{formatNumber(chillGuyCount)}</span>
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
            <div className="setting-item">
              <label>{t('backgroundPlay')}</label>
              <p className="setting-description">{t('backgroundPlayDesc')}</p>
              <div className="toggle-container">
                <button 
                  className={`toggle-btn ${backgroundPlay ? 'active' : ''}`}
                  onClick={() => setBackgroundPlay(!backgroundPlay)}
                >
                  {backgroundPlay ? 'ON' : 'OFF'}
                </button>
              </div>
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
          <div className="trophies-header">
            <h2>{t('yourTrophies')}</h2>
            <button className="close-trophies" onClick={() => setShowTrophies(false)}>✕</button>
          </div>
          <div className="trophies-progress-summary">
            <span className="progress-text">{unlockedAchievements.length} / {achievements.length} Desbloqueados</span>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}></div>
            </div>
          </div>
          <div className="trophies-grid">
            {achievements.map(achievement => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const { remaining, progress } = getProgressText(achievement);
              return (
                <div key={achievement.id} className={`trophy-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="trophy-icon">{isUnlocked ? '🏆' : '🔒'}</div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  {isUnlocked ? (
                    <span className="trophy-date">Desbloqueado</span>
                  ) : (
                    <div className="trophy-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="progress-remaining">Faltan: {formatNumber(remaining)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Tooltip */}
      {tooltip.show && (
        <div
          className={`global-tooltip ${tooltip.direction}`}
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {getTooltipContent()}
        </div>
      )}

      {/* Achievement Notification - Play Store Style */}
      {achievementNotification && (
        <div className="achievement-notification">
          <div className="achievement-icon">🏆</div>
          <div className="achievement-content">
            <span className="achievement-title">{t('achievementUnlocked')}</span>
            <span className="achievement-name">{achievementNotification.name}</span>
            <span className="achievement-desc">{achievementNotification.description}</span>
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
