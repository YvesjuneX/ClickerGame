import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import './Auth.css';

const Auth = () => {
  const [option, setOption] = useState('login'); // login, register, guest
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, playAsGuest } = useUser();
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (option === 'login') logicLogin();
    else if (option === 'register') logicRegister();
  };

  const logicLogin = () => {
    login(username, password);
  };

  const logicRegister = () => {
    register(username, password);
  };

  return (
    <div className="auth-container">
      <h1 className="game-title">{t('appTitle')}</h1>

      <div className="glass-card auth-card">
        <div className="auth-options">
          <button className={option === 'login' ? 'active' : ''} onClick={() => setOption('login')}>{t('login')}</button>
          <button className={option === 'register' ? 'active' : ''} onClick={() => setOption('register')}>{t('register')}</button>
          <button className={option === 'guest' ? 'active' : ''} onClick={() => { setOption('guest'); playAsGuest(); }}>{t('guest')}</button>
        </div>

        {option !== 'guest' && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{t('username')}</label>
              <input
                type="text"
                placeholder={t('enterUsername')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t('password')}</label>
              <input
                type="password"
                placeholder={t('enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary action-btn">
              {option === 'login' ? t('login') : t('register')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
