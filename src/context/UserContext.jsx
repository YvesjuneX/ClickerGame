import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('clicker_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const newUser = { ...data.user, isGuest: false };
        setUser(newUser);
        localStorage.setItem('clicker_user', JSON.stringify(newUser));
        return true;
      } else {
        alert(data.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error connecting to server');
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3002/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login after register
        return login(username, password);
      } else {
        alert(data.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Error connecting to server');
      return false;
    }
  };

  const playAsGuest = () => {
    const guestUser = { name: 'Guest', isGuest: true };
    setUser(guestUser);
    localStorage.setItem('clicker_user', JSON.stringify(guestUser));
  };

  const saveUserData = async (gameData) => {
    if (!user || user.isGuest) return; // Don't save for guests or if not logged in

    // 1. Update Local State immediately (Optimistic UI)
    const updatedUser = { ...user, gameData };
    setUser(updatedUser);
    localStorage.setItem('clicker_user', JSON.stringify(updatedUser));

    try {
      await fetch('http://localhost:3002/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, gameData }),
      });
      console.log('Progress saved remotely');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clicker_user');
  };

  return (
    <UserContext.Provider value={{ user, login, register, playAsGuest, logout, saveUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
