// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";

// 1. Create the context with a default value of null.
export const AuthContext = createContext(null);

// 2. Create the Provider component.
//    This component will wrap your app and provide the auth state.
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true); // To check initial auth status

  // 3. Use useEffect to check for a stored session on initial app load.
  //    The empty dependency array [] means this runs only once.
  useEffect(() => {
    // Attempt to retrieve session data from localStorage.
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");

    if (token && role && id) {
      // If a session exists, update the state to reflect it.
      setJwtToken(token);
      setUserRole(role);
      setUserId(id);
      setIsAuthenticated(true);
      // Optional: You could add a call to a '/me' or '/validate-token'
      // backend endpoint here to verify the token is still valid.
    }
    // Finished checking, allow the rest of the app to render.
    setLoading(false);
  }, []);

  /**
   * Logs a user in by storing session data and updating the state.
   * @param {string} token - The JWT received from the backend.
   * @param {string|number} id - The user's ID.
   * @param {string} role - The user's role ('CUSTOMER', 'SELLER', 'ADMIN').
   */
  const login = (token, id, role) => {
    // Store session data in localStorage for persistence across browser tabs/reloads.
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userId", id);

    // Update the React state to trigger re-renders in components.
    setJwtToken(token);
    setUserRole(role);
    setUserId(id);
    setIsAuthenticated(true);
  };

  /**
   * Logs a user out by clearing session data and resetting the state.
   */
  const logout = () => {
    // Clear session data from localStorage.
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");

    // Reset the React state to its initial values.
    setJwtToken(null);
    setUserRole(null);
    setUserId(null);
    setIsAuthenticated(false);
    // Note: The actual navigation to '/login' will be handled by the component
    // that calls logout (e.g., Navbar or a useEffect error handler) to ensure
    // it happens within the Router's context.
  };

  // 4. Define the value that will be provided to all consuming components.
  const authContextValue = {
    isAuthenticated,
    userRole,
    userId,
    jwtToken,
    loading,
    login,
    logout,
  };

  // 5. Return the Provider component, passing the value.
  //    The `children` prop represents whatever components are nested inside AuthProvider.
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
