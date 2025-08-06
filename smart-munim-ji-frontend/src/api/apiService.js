// src/api/apiService.js

import axios from "axios";

// The base URL for all your backend API endpoints
const API_BASE_URL = "http://localhost:3000/sm";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
// This runs before any request is sent from your app.
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem("jwtToken");

    // If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors (e.g., network issues)
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This runs after a response is received.
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful (2xx status code), just return it
    return response;
  },
  (error) => {
    // If there's an error, we will let the component that made the call handle it.
    // This allows for specific error handling (e.g., displaying form errors)
    // and global error handling (e.g., logging out on 401).
    // The component can check for `error.response.status === 401` and call the logout function.

    console.error("API Error:", error.response?.data?.message || error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;
