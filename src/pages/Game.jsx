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
  const { user, logout, saveUserData } = useUser();
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
  const [autoClickerCost, setAutoClickerCost] = useState(25);
  const [autoClickersProduced, setAutoClickersProduced] = useState(0);

  const [miamiCount, setMiamiCount] = useState(0);
  const [miamiCost, setMiamiCost] = useState(250);
  const [miamiProduced, setMiamiProduced] = useState(0);

  const [chillGuyCount, setChillGuyCount] = useState(0);
  const [chillGuyCost, setChillGuyCost] = useState(2500);
  const [chillGuyProduced, setChillGuyProduced] = useState(0);

  // Upgrade Items (Cookie Clicker style)
  const [clickPowerLevel, setClickPowerLevel] = useState(0);
  const [clickPowerCost, setClickPowerCost] = useState(100);

  const [autoClickerLevel, setAutoClickerLevel] = useState(0);
  const [autoClickerLevelCost, setAutoClickerLevelCost] = useState(500);

  const [miamiLevel, setMiamiLevel] = useState(0);
  const [miamiLevelCost, setMiamiLevelCost] = useState(2500);

  const [chillGuyLevel, setChillGuyLevel] = useState(0);
  const [chillGuyLevelCost, setChillGuyLevelCost] = useState(10000);

  const [clickTurboCost, setClickTurboCost] = useState(500);
  const [nyanBoostCost, setNyanBoostCost] = useState(10000);
  const [miamiOverdriveCost, setMiamiOverdriveCost] = useState(25000);
  const [chillAmplifierCost, setChillAmplifierCost] = useState(50000);

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

  // Calculate Total CPS with upgrades
  // AutoClicker = 1 CPS, Miami = 5 CPS, Chill Guy = 25 CPS
  // Each upgrade level doubles the base CPS of that unit type
  const autoClickerMultiplier = Math.pow(2, autoClickerLevel);
  const miamiMultiplier = Math.pow(2, miamiLevel);
  const chillGuyMultiplier = Math.pow(2, chillGuyLevel);

  const totalCPS = (autoClickers * autoClickerMultiplier) +
    (miamiCount * 5 * miamiMultiplier) +
    (chillGuyCount * 25 * chillGuyMultiplier);

  // Click power: each level adds +1 click, doubled by upgrade level
  const clickPower = (1 + clickPowerLevel) * Math.pow(2, clickPowerLevel);

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

  // Load Game Data on Mount/Login
  useEffect(() => {
    if (user && user.gameData && Object.keys(user.gameData).length > 0) {
      console.log('Loading save data...', user.gameData);
      const data = user.gameData;

      // Economy
      if (data.money !== undefined) setMoney(data.money);
      if (data.totalClicks !== undefined) setTotalClicks(data.totalClicks);

      // Items
      if (data.autoClickers !== undefined) setAutoClickers(data.autoClickers);
      if (data.autoClickerCost !== undefined) setAutoClickerCost(data.autoClickerCost);
      if (data.autoClickersProduced !== undefined) setAutoClickersProduced(data.autoClickersProduced);

      if (data.miamiCount !== undefined) setMiamiCount(data.miamiCount);
      if (data.miamiCost !== undefined) setMiamiCost(data.miamiCost);
      if (data.miamiProduced !== undefined) setMiamiProduced(data.miamiProduced);

      if (data.chillGuyCount !== undefined) setChillGuyCount(data.chillGuyCount);
      if (data.chillGuyCost !== undefined) setChillGuyCost(data.chillGuyCost);
      if (data.chillGuyProduced !== undefined) setChillGuyProduced(data.chillGuyProduced);

      // Upgrades
      if (data.clickPowerLevel !== undefined) setClickPowerLevel(data.clickPowerLevel);
      if (data.clickPowerCost !== undefined) setClickPowerCost(data.clickPowerCost);

      if (data.autoClickerLevel !== undefined) setAutoClickerLevel(data.autoClickerLevel);
      if (data.autoClickerLevelCost !== undefined) setAutoClickerLevelCost(data.autoClickerLevelCost);

      if (data.miamiLevel !== undefined) setMiamiLevel(data.miamiLevel);
      if (data.miamiLevelCost !== undefined) setMiamiLevelCost(data.miamiLevelCost);

      if (data.chillGuyLevel !== undefined) setChillGuyLevel(data.chillGuyLevel);
      if (data.chillGuyLevelCost !== undefined) setChillGuyLevelCost(data.chillGuyLevelCost);

      if (data.clickTurboCost !== undefined) setClickTurboCost(data.clickTurboCost);
      if (data.nyanBoostCost !== undefined) setNyanBoostCost(data.nyanBoostCost);
      if (data.miamiOverdriveCost !== undefined) setMiamiOverdriveCost(data.miamiOverdriveCost);
      if (data.chillAmplifierCost !== undefined) setChillAmplifierCost(data.chillAmplifierCost);

      // Achievements
      if (data.unlockedAchievements !== undefined) setUnlockedAchievements(data.unlockedAchievements);

      // Settings
      if (data.volume !== undefined) setVolume(data.volume);
      if (data.backgroundPlay !== undefined) setBackgroundPlay(data.backgroundPlay);
      if (data.language) switchLanguage(data.language);

    }
  }, [user]); // Runs when user updates (login)

  // Ref to hold latest game data for auto-save without stale closures
  const gameDataRef = useRef({});

  useEffect(() => {
    gameDataRef.current = {
      money,
      totalClicks,
      autoClickers,
      autoClickerCost,
      autoClickersProduced,
      miamiCount,
      miamiCost,
      miamiProduced,
      chillGuyCount,
      chillGuyCost,
      chillGuyProduced,
      clickPowerLevel,
      clickPowerCost,
      autoClickerLevel,
      autoClickerLevelCost,
      miamiLevel,
      miamiLevelCost,
      chillGuyLevel,
      chillGuyLevelCost,
      clickTurboCost,
      nyanBoostCost,
      miamiOverdriveCost,
      chillAmplifierCost,
      unlockedAchievements,
      volume,
      backgroundPlay,
      language
    };
  }, [
    money, totalClicks, autoClickers, miamiCount, chillGuyCount,
    clickPowerLevel, autoClickerLevel, miamiLevel, chillGuyLevel,
    unlockedAchievements, volume, backgroundPlay, language
  ]);

  // Auto-Save Interval (30 seconds)
  useEffect(() => {
    if (!gameStarted || !user || user.isGuest) return;

    const saveInterval = setInterval(async () => {
      console.log('Auto-saving progress...');
      await saveUserData(gameDataRef.current);
    }, 30000); // 30 seconds

    return () => clearInterval(saveInterval);
  }, [gameStarted, user, saveUserData]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };



  const confirmLogout = async () => {
    // Look at the latest ref data to ensure we don't save stale state
    console.log('Saving before logout...');
    await saveUserData(gameDataRef.current);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleAreaClick = () => {
    if (!gameStarted) {
      setGameStarted(true);
      lastTimeRef.current = Date.now();
    } else {
      setMoney(prev => prev + clickPower);
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
      if (gameStarted && !document.hidden) {
        // Reset time reference when page becomes visible to prevent large jumps
        lastTimeRef.current = Date.now();
        accumulatorRef.current = 0;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStarted]);

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

  const buyClickTurbo = () => {
    if (money >= clickTurboCost) {
      setMoney(prev => prev - clickTurboCost);
      setClickPowerLevel(prev => prev + 1);
      setClickTurboCost(prev => Math.floor(prev * 2.5));
    }
  };

  const buyNyanBoost = () => {
    if (money >= nyanBoostCost && autoClickers >= 10) {
      setMoney(prev => prev - nyanBoostCost);
      setAutoClickerLevel(prev => prev + 1);
      setNyanBoostCost(prev => Math.floor(prev * 2.5));
    }
  };

  const buyMiamiOverdrive = () => {
    if (money >= miamiOverdriveCost && miamiCount >= 5) {
      setMoney(prev => prev - miamiOverdriveCost);
      setMiamiLevel(prev => prev + 1);
      setMiamiOverdriveCost(prev => Math.floor(prev * 2.5));
    }
  };

  const buyChillAmplifier = () => {
    if (money >= chillAmplifierCost && chillGuyCount >= 3) {
      setMoney(prev => prev - chillAmplifierCost);
      setChillGuyLevel(prev => prev + 1);
      setChillAmplifierCost(prev => Math.floor(prev * 2.5));
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
    if (type === 'clickTurboShop') return `${t('clickTurboDesc')}\n${t('level')}: ${clickPowerLevel}`;
    if (type === 'nyanBoostShop') return `${t('nyanBoostDesc')}\n${t('level')}: ${autoClickerLevel}`;
    if (type === 'miamiOverdriveShop') return `${t('miamiOverdriveDesc')}\n${t('level')}: ${miamiLevel}`;
    if (type === 'chillAmplifierShop') return `${t('chillAmplifierDesc')}\n${t('level')}: ${chillGuyLevel}`;

    if (type === 'cps') {
      const parts = [];
      if (autoClickers > 0) parts.push(`AutoClicker: ${formatNumber(autoClickers * (1 * autoClickerMultiplier))}/s`);
      if (miamiCount > 0) parts.push(`Miami: ${formatNumber(miamiCount * 5 * miamiMultiplier)}/s`);
      if (chillGuyCount > 0) parts.push(`Chill Guy: ${formatNumber(chillGuyCount * 25 * chillGuyMultiplier)}/s`);
      return parts.length > 0 ? parts.join('\n') : "0 CP/S";
    }

    if (type === 'autoClickerInv') {
      const baseIndividual = 1;
      const individual = baseIndividual * autoClickerMultiplier;
      const baseTotal = autoClickers * baseIndividual;
      const total = autoClickers * individual;
      const contribution = totalCPS > 0 ? ((total / totalCPS) * 100).toFixed(1) + '%' : '0%';
      return `${t('autoClicker')}\n${t('each')} (${t('base')}): ${formatNumber(baseIndividual)} CP/S\n${t('each')} (${t('improved')}): ${formatNumber(individual)} CP/S\n${t('total')} (${t('base')}): ${formatNumber(baseTotal)} CP/S\n${t('total')} (${t('improved')}): ${formatNumber(total)} CP/S\n${t('produced')}: ${formatNumber(Math.floor(autoClickersProduced))}\n${t('contribution')}: ${contribution}`;
    }

    if (type === 'miamiInv') {
      const baseIndividual = 5;
      const individual = baseIndividual * miamiMultiplier;
      const baseTotal = miamiCount * baseIndividual;
      const total = miamiCount * individual;
      const contribution = totalCPS > 0 ? ((total / totalCPS) * 100).toFixed(1) + '%' : '0%';
      return `${t('miamiItem')}\n${t('each')} (${t('base')}): ${formatNumber(baseIndividual)} CP/S\n${t('each')} (${t('improved')}): ${formatNumber(individual)} CP/S\n${t('total')} (${t('base')}): ${formatNumber(baseTotal)} CP/S\n${t('total')} (${t('improved')}): ${formatNumber(total)} CP/S\n${t('produced')}: ${formatNumber(Math.floor(miamiProduced))}\n${t('contribution')}: ${contribution}`;
    }

    if (type === 'chillGuyInv') {
      const baseIndividual = 25;
      const individual = baseIndividual * chillGuyMultiplier;
      const baseTotal = chillGuyCount * baseIndividual;
      const total = chillGuyCount * individual;
      const contribution = totalCPS > 0 ? ((total / totalCPS) * 100).toFixed(1) + '%' : '0%';
      return `${t('chillGuyItem')}\n${t('each')} (${t('base')}): ${formatNumber(baseIndividual)} CP/S\n${t('each')} (${t('improved')}): ${formatNumber(individual)} CP/S\n${t('total')} (${t('base')}): ${formatNumber(baseTotal)} CP/S\n${t('total')} (${t('improved')}): ${formatNumber(total)} CP/S\n${t('produced')}: ${formatNumber(Math.floor(chillGuyProduced))}\n${t('contribution')}: ${contribution}`;
    }

    return '';
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const confirmReset = async () => {
    // Create a reset state that keeps achievements and settings
    const resetData = {
      // Reset Economy
      money: 0,
      totalClicks: 0,

      // Reset Items
      autoClickers: 0,
      autoClickerCost: 25,
      autoClickersProduced: 0,

      miamiCount: 0,
      miamiCost: 250,
      miamiProduced: 0,

      chillGuyCount: 0,
      chillGuyCost: 2500,
      chillGuyProduced: 0,

      // Reset Upgrades
      clickPowerLevel: 0,
      clickPowerCost: 100,

      autoClickerLevel: 0,
      autoClickerLevelCost: 500,

      miamiLevel: 0,
      miamiLevelCost: 2500,

      chillGuyLevel: 0,
      chillGuyLevelCost: 10000,

      // Reset One-Time Upgrades Costs
      clickTurboCost: 500,
      nyanBoostCost: 10000,
      miamiOverdriveCost: 25000,
      chillAmplifierCost: 50000,

      // KEEP Achievements and Settings
      unlockedAchievements: unlockedAchievements,
      volume: volume,
      backgroundPlay: backgroundPlay,
      language: language
    };

    console.log('Resetting progress, keeping achievements/settings:', resetData);
    await saveUserData(resetData);
    window.location.reload();
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
                {/* Upgrades Section */}
                <div className="shop-section">
                  <div className="shop-section-title">MEJORAS</div>

                  {/* Click Turbo */}
                  <div
                    className={`shop-item upgrade-item ${money < clickTurboCost ? 'unaffordable' : ''}`}
                    onMouseEnter={(e) => handleMouseEnter(e, 'clickTurboShop', 'right')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="item-info">
                      <span className="item-name">{t('clickTurbo')} <span className="level-badge">Lv.{clickPowerLevel}</span></span>
                      <button
                        className="buy-btn"
                        disabled={!gameStarted || money < clickTurboCost}
                        onClick={buyClickTurbo}
                      >
                        {t('upgrade')} (${formatNumber(clickTurboCost)})
                      </button>
                    </div>
                  </div>

                  {/* Nyan Boost */}
                  <div
                    className={`shop-item upgrade-item ${money < nyanBoostCost || autoClickers < 10 ? 'unaffordable locked-item' : ''}`}
                    onMouseEnter={(e) => handleMouseEnter(e, 'nyanBoostShop', 'right')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="item-info">
                      <span className="item-name">{t('nyanBoost')} <span className="level-badge">Lv.{autoClickerLevel}</span></span>
                      {autoClickers >= 10 ? (
                        <button
                          className="buy-btn"
                          disabled={!gameStarted || money < nyanBoostCost}
                          onClick={buyNyanBoost}
                        >
                          {t('upgrade')} (${formatNumber(nyanBoostCost)})
                        </button>
                      ) : (
                        <button className="buy-btn locked" disabled>
                          🔒 {t('nyanBoostReq')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Miami Overdrive */}
                  <div
                    className={`shop-item upgrade-item ${money < miamiOverdriveCost || miamiCount < 5 ? 'unaffordable locked-item' : ''}`}
                    onMouseEnter={(e) => handleMouseEnter(e, 'miamiOverdriveShop', 'right')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="item-info">
                      <span className="item-name">{t('miamiOverdrive')} <span className="level-badge">Lv.{miamiLevel}</span></span>
                      {miamiCount >= 5 ? (
                        <button
                          className="buy-btn"
                          disabled={!gameStarted || money < miamiOverdriveCost}
                          onClick={buyMiamiOverdrive}
                        >
                          {t('upgrade')} (${formatNumber(miamiOverdriveCost)})
                        </button>
                      ) : (
                        <button className="buy-btn locked" disabled>
                          🔒 {t('miamiOverdriveReq')}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chill Amplifier */}
                  <div
                    className={`shop-item upgrade-item ${money < chillAmplifierCost || chillGuyCount < 3 ? 'unaffordable locked-item' : ''}`}
                    onMouseEnter={(e) => handleMouseEnter(e, 'chillAmplifierShop', 'right')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="item-info">
                      <span className="item-name">{t('chillAmplifier')} <span className="level-badge">Lv.{chillGuyLevel}</span></span>
                      {chillGuyCount >= 3 ? (
                        <button
                          className="buy-btn"
                          disabled={!gameStarted || money < chillAmplifierCost}
                          onClick={buyChillAmplifier}
                        >
                          {t('upgrade')} (${formatNumber(chillAmplifierCost)})
                        </button>
                      ) : (
                        <button className="buy-btn locked" disabled>
                          🔒 {t('chillAmplifierReq')}
                        </button>
                      )}
                    </div>
                  </div>


                </div>

                <div className="shop-divider"></div>

                <div className="shop-section">
                  <div className="shop-section-title">OBJETOS</div>
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
                      src="/trollface.png"
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

            <div className="setting-item dangerous-zone">
              <button className="reset-btn" onClick={handleResetClick}>
                ⚠️ {t('resetProgress')}
              </button>
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

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="glass-card modal-content danger-modal">
            <h2 className="danger-text">{t('resetConfirmTitle')}</h2>
            <p>{t('resetConfirmMsg')}</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cancelReset}>{t('cancel')}</button>
              <button className="btn-danger" onClick={confirmReset}>{t('confirmReset')}</button>
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
