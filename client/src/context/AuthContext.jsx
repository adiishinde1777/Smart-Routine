import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_USERS = {
  general: {
    id: 'usr_mayur_1',
    name: 'Mayur',
    email: 'mayur@smartroutine.com',
    role: 'user',
    profileType: 'general',
    profileLabel: '🏃 Daily Routine',
    goal: 'Daily Schedules, Medicines, Meals & Habits',
    deviceId: 'ESP8266-SR-01',
    age: 24,
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    return DEMO_USERS.general;
  });

  const [role, setRole] = useState(currentUser?.role || 'user');

  useEffect(() => {
    localStorage.setItem('smart_routine_user', JSON.stringify(currentUser));
    setRole(currentUser?.role || 'user');
  }, [currentUser]);

  const switchProfile = () => {
    setCurrentUser(DEMO_USERS.general);
    setRole('user');
  };

  const login = () => {
    setCurrentUser(DEMO_USERS.general);
    setRole('user');
    return true;
  };

  const logout = () => {
    setCurrentUser(DEMO_USERS.general);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      role,
      switchRole: switchProfile,
      switchProfile,
      login,
      logout,
      DEMO_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
