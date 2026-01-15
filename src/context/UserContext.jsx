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

  const login = (username, password) => {
    // Mock login - in a real app this would call an API
    // For now, valid if username is not empty
    if (!username) return false;
    
    const newUser = { name: username, isGuest: false };
    setUser(newUser);
    localStorage.setItem('clicker_user', JSON.stringify(newUser));
    return true;
  };

  const register = (username, password) => {
    // Mock register
    return login(username, password);
  };

  const playAsGuest = () => {
    const guestUser = { name: 'Guest', isGuest: true };
    setUser(guestUser);
    localStorage.setItem('clicker_user', JSON.stringify(guestUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clicker_user');
  };

  return (
    <UserContext.Provider value={{ user, login, register, playAsGuest, logout }}>
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
