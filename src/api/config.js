// src/api/config.js

import axios from 'axios';

// For Vite projects, use import.meta.env (not process.env)
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ;

// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 
    "Content-Type": "application/json",
    // Add other default headers here if needed
  },
});

// Request interceptor (e.g., for auth tokens)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (e.g., for error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Redirect to login");
      // Handle token expiration/redirect here
    }
    return Promise.reject(error);
  }
);

export default api;