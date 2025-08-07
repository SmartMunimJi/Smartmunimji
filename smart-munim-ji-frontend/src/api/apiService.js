// src/api/apiService.js

import axios from "axios";

/**
 * This file configures a central axios instance for all API requests.
 * It uses interceptors to automatically handle JWT authentication and
 * to provide a consistent error handling mechanism.
 */

// The base URL for all backend API endpoints.
// This should be moved to a .env file in a production environment.
const API_BASE_URL = "http://localhost:3000/sm";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
// This function will be called before any request is sent.
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve the JWT token from localStorage on each request.
    const token = localStorage.getItem("jwtToken");

    // If a token exists, add it to the Authorization header.
    // The backend will use this to identify and authorize the user.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle any errors that occur during the request setup.
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This function will be called after a response is received.
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful (status code 2xx),
    // it passes through without any modification.
    return response;
  },
  (error) => {
    // This is the global error handler for all API calls.

    // IMPORTANT: We do NOT call logout() from here.
    // This file is a plain JS module and cannot use React hooks like useAuth.
    // Its responsibility is to prepare the request and process the response/error,
    // not to manage application state or navigation.

    // The component that initiated the API call is responsible for catching
    // this rejected promise and deciding what to do (e.g., call logout, show a message).

    // For debugging purposes, we can log the error.
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx.
      console.error("API Error Response:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error).
      console.error("API No Response:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error.
      console.error("API Error:", error.message);
    }

    // This is the most crucial part. We return a rejected promise with the error,
    // which allows the .catch() block in our components to be executed.
    return Promise.reject(error);
  }
);

export default axiosInstance;
