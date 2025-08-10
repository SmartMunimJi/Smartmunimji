// src/api/apiService.js

import axios from "axios";

// The base URL for all your backend API endpoints
const API_BASE_URL = "http://localhost:3000/sm";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Optional: Set a timeout for requests (e.g., 10 seconds)
});

// --- Request Interceptor ---
// This runs before any request is sent from your app.
// It ensures that the JWT token is attached to the Authorization header
// for all authenticated requests.
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("jwtToken");

    // If a token exists, add it to the Authorization header using the Bearer scheme
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Always return the config
  },
  (error) => {
    // Handle any errors that occur during the request setup (e.g., network issues)
    console.error("Request Error:", error.message);
    return Promise.reject(error); // Propagate the error
  }
);

// --- Response Interceptor ---
// This runs after a response is received, allowing for global error handling,
// especially for authentication failures (401/403).
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful (2xx status code), just return it.
    // The specific success status ("success" | "fail" | "error") in the body
    // will be checked by the calling component.
    return response;
  },
  (error) => {
    // Log the error for debugging purposes
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data?.message || error.message
    );

    // --- GLOBAL AUTHENTICATION ERROR HANDLING (401 Unauthorized / 403 Forbidden) ---
    // If a 401 or 403 status is received, it typically means the JWT token is invalid,
    // expired, or the user's role is not permitted. In this case, we forcefully
    // log the user out by clearing local storage and redirecting them to the login page.
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn(
        "Authentication error (401/403) detected. Clearing session and redirecting to login."
      );

      // Clear all authentication-related data from localStorage
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");

      // Perform a hard redirect to the login page.
      // This ensures a clean state and forces re-authentication.
      window.location.href = "/login"; // Use window.location.href for a full page reload and redirect

      // Important: Prevent further processing of this error by returning a new, rejected promise
      // that won't be caught by the component, as the page is already redirecting.
      return new Promise(() => {}); // A promise that never resolves/rejects, effectively halting flow
    }

    // --- OTHER ERROR HANDLING ---
    // For all other errors (e.g., 400 Bad Request, 404 Not Found, 409 Conflict, 424 Failed Dependency, 500 Internal Server Error),
    // propagate the error so the calling component can handle it specifically.
    return Promise.reject(error);
  }
);

export default axiosInstance;
