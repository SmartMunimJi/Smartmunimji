// src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx"; // Make sure this path is correct, should be .jsx now

/**
 * Custom React Hook for accessing the authentication context.
 * This hook simplifies the process of consuming AuthContext and adds a crucial check
 * to ensure it's used within the AuthProvider's scope, preventing runtime errors.
 *
 * @returns {object} The authentication context value, including:
 *   - isAuthenticated (boolean)
 *   - userRole (string | null)
 *   - userId (number | null)
 *   - jwtToken (string | null)
 *   - loading (boolean)
 *   - login (function)
 *   - logout (function)
 *
 * @throws {Error} If useAuth is called outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Crucial check: If the context is undefined, it means this hook was called
  // outside the scope of an AuthProvider. This helps catch common errors early.
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
