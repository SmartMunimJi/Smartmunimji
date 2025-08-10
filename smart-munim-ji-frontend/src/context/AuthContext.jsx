// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";
// No direct import of apiService here. AuthContext manages state, not direct API calls.
// API calls for login/logout are handled by components, which then call login/logout methods on this context.

/**
 * 1. AuthContext Definition:
 *    Creates a Context object. Components can subscribe to this context to read the current
 *    authentication status, user role, and user ID.
 */
export const AuthContext = createContext(null);

/**
 * 2. AuthProvider Component:
 *    This component wraps the entire application (or a part of it) and provides the
 *    authentication state and functions to its children.
 *    It also handles initial loading and persistent session checks.
 */
export const AuthProvider = ({ children }) => {
  // --- State Management ---
  // isAuthenticated: Boolean flag indicating if a user is logged in.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // userRole: The role of the authenticated user (e.g., 'CUSTOMER', 'SELLER', 'ADMIN').
  const [userRole, setUserRole] = useState(null);
  // userId: The ID of the authenticated user.
  const [userId, setUserId] = useState(null);
  // jwtToken: The actual JWT string. Stored in state for consistency and immediate access.
  const [jwtToken, setJwtToken] = useState(null);
  // loading: Indicates if the initial authentication check (from localStorage) is in progress.
  // CRITICAL: Initialized to 'true' to prevent rendering protected content before auth status is known.
  const [loading, setLoading] = useState(true);

  // --- Initial Authentication Check (on component mount) ---
  /**
   * 3. useEffect for Session Persistence:
   *    This hook runs once when the AuthProvider component mounts.
   *    It checks localStorage for a previously saved JWT token, user role, and user ID.
   *    If found, it restores the session state in the application.
   */
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");

    // If all necessary items are found in localStorage, assume a valid session (for now)
    if (token && role && id) {
      setJwtToken(token);
      setUserRole(role);
      setUserId(id);
      setIsAuthenticated(true);
      // NOTE: For highly robust applications, you might add an API call here
      // to /sm/auth/validate-token or /sm/me to verify the token is still valid
      // on the server-side and the user is active, especially after a long period.
      // For this project, a successful login is the primary validation point.
    }
    // Set loading to false once the initial check is complete, regardless of outcome.
    setLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount.

  // --- Authentication Functions ---
  /**
   * 4. login Function:
   *    Called by the LoginPage component upon successful authentication from the backend.
   * @param {string} token - The JWT received from the backend.
   * @param {number} id - The userId received from the backend.
   * @param {string} role - The user's role (CUSTOMER, SELLER, ADMIN) from the backend.
   */
  const login = (token, id, role) => {
    // Store data in localStorage for session persistence across browser restarts.
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userId", id);
    localStorage.setItem("userRole", role);

    // Update the React state to reflect the logged-in user immediately.
    setJwtToken(token);
    setUserRole(role);
    setUserId(id);
    setIsAuthenticated(true);
  };

  /**
   * 5. logout Function:
   *    Called by components (e.g., Navbar, or any page catching a 401/403 API error).
   *    It clears all session-related data from localStorage and resets the context state.
   */
  const logout = () => {
    // Clear data from localStorage. This is the client-side invalidation.
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    // Reset React state to reflect a logged-out user.
    setJwtToken(null);
    setUserRole(null);
    setUserId(null);
    setIsAuthenticated(false);

    // CRITICAL CHECK: No direct navigation here.
    // The component that *calls* `logout()` is responsible for redirecting (e.g., to /login)
    // using `useNavigate()` to ensure it's within the Router's context.
  };

  // --- Context Value ---
  /**
   * 6. authContextValue:
   *    The object that will be provided to any component that consumes AuthContext.
   */
  const authContextValue = {
    isAuthenticated, // Is user authenticated? (boolean)
    userRole, // What is the user's role? (string | null)
    userId, // What is the user's ID? (number | null)
    jwtToken, // The raw JWT token (string | null) - used by axios interceptor
    loading, // Is the initial auth check still running? (boolean)
    login, // Function to log a user in
    logout, // Function to log a user out
  };

  // --- Provider Render ---
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
