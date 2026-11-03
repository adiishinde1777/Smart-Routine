import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_USERS = {
  gym: {
    id: 'usr_gym_1',
    name: 'Rohan Deshmukh',
    email: 'rohan.gym@smartroutine.com',
    role: 'user',
    profileType: 'fitness',
    profileLabel: '🏋️ Gym & Fitness',
    goal: 'Muscle Building & High Protein Diet',
    deviceId: 'ESP8266-SR-01',
    age: 24,
    phone: '+91 98765 11111',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  patient: {
    id: 'usr_patient_1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@smartroutine.com',
    role: 'user',
    profileType: 'patient',
    profileLabel: '💊 Patient Care',
    goal: 'Diabetes & BP Medicine Routine',
    deviceId: 'ESP8266-SR-01',
    age: 52,
    bloodGroup: 'B+',
    phone: '+91 98765 22222',
    emergencyContact: '+91 98765 22223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  general: {
    id: 'usr_general_1',
    name: 'Aditya Patil',
    email: 'aditya.patil@smartroutine.com',
    role: 'user',
    profileType: 'general',
    profileLabel: '🏃 Daily Lifestyle',
    goal: 'Healthy Meals, Hydration & Habits',
    deviceId: 'ESP8266-SR-01',
    age: 28,
    phone: '+91 98765 33333',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smart_routine_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.patient;
  });

  const [role, setRole] = useState(currentUser?.role || 'user');

  useEffect(() => {
    localStorage.setItem('smart_routine_user', JSON.stringify(currentUser));
    setRole(currentUser?.role || 'user');
  }, [currentUser]);

  const switchProfile = (profileKey) => {
    const user = DEMO_USERS[profileKey] || DEMO_USERS.patient;
    setCurrentUser(user);
    setRole('user');
  };

  const login = (email, password, desiredProfile) => {
    const user = DEMO_USERS[desiredProfile] || DEMO_USERS.patient;
    setCurrentUser(user);
    setRole('user');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
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
