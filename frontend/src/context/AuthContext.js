// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('access_token') || null);

  const login = (token) => {
    setAuthToken(token);
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('access_token');
    window.location.reload(); // Перезагружаем страницу
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
