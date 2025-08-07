// src/hooks/useAuth.jsx

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Import the context from our .jsx file

/**
 * A custom hook to provide easy and safe access to the authentication context.
 * It ensures that the hook is only used within a component that is a descendant
 * of AuthProvider, preventing common "context is undefined" errors.
 *
 * @returns {object} The authentication context value, containing:
 * - isAuthenticated (boolean)
 * - userRole (string | null)
 * - userId (string | number | null)
 * - jwtToken (string | null)
 * - loading (boolean)
 * - login (function)
 * - logout (function)
 */
export const useAuth = () => {
  // 1. Get the context value.
  const context = useContext(AuthContext);

  // 2. Add a safety check. If the context is undefined, it means this hook
  //    was used outside of the AuthProvider tree, which is a developer error.
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. Make sure your component is wrapped in AuthProvider in App.jsx."
    );
  }

  // 3. Return the context value so components can use it.
  //    Example Usage in a component:
  //    const { isAuthenticated, userRole, login, logout } = useAuth();
  return context;
};
