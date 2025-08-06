// src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * A custom hook to provide easy access to the authentication context.
 * It ensures that the hook is used within a component wrapped by AuthProvider.
 * @returns {object} The authentication context value (isAuthenticated, userRole, login, logout, etc.).
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // You can now replace all instances of `useContext(AuthContext)` with `useAuth()`
  // For example, in Navbar.js: const { isAuthenticated, userRole, logout } = useAuth();

  return context;
};
