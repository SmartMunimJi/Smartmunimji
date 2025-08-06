// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");
    if (token && role && id) {
      setJwtToken(token);
      setUserRole(role);
      setUserId(id);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (token, id, role) => {
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userId", id);
    setJwtToken(token);
    setUserRole(role);
    setUserId(id);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setJwtToken(null);
    setUserRole(null);
    setUserId(null);
    setIsAuthenticated(false);
  };

  const authContextValue = {
    isAuthenticated,
    userRole,
    userId,
    jwtToken,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
