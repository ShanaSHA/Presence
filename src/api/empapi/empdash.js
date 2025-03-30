// src/api/empapi/empDashboardAPI.js
import axios from "axios";
import { BASE_URL } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    if (authHeader.Authorization) {
      config.headers = {
        ...config.headers,
        ...authHeader
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const dashboardAPI = {
  /**
   * Get employee dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await api.get('/empview/');
      
      // Validate response structure
      if (!response.data) {
        throw new Error('Invalid response structure from /empview/');
      }
      
      console.log('Dashboard data fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Enhance error information
      const enhancedError = new Error(`Dashboard data fetch failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.isApiError = true;
      
      throw enhancedError;
    }
  },

  /**
   * Get today's shift data
   * @returns {Promise<Array>} Array of shift assignments
   */
  getShiftData: async () => {
    try {
      console.log('Fetching shift data...');
      const response = await api.get('/employeedashboardshifts/');
      
      // Validate response is an array
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array from /employeedashboardshifts/');
      }
      
      console.log('Shift data fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift data:', error);
      
      // Return empty array if 404 (not found) to prevent UI breakage
      if (error.response?.status === 404) {
        console.warn('No shift data found, returning empty array');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Get shift colleagues data
   * @returns {Promise<Array>} Array of colleague objects
   */
  getShiftColleagues: async () => {
    try {
      console.log('Fetching shift colleagues...');
      const response = await api.get('/shift/colleagues/');
      
      // Validate response is an array
      if (!Array.isArray(response.data)) {
        throw new Error('Expected array from /shift/colleagues/');
      }
      
      console.log('Shift colleagues fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching shift colleagues:', error);
      
      // Return empty array if 404 (not found) to prevent UI breakage
      if (error.response?.status === 404) {
        console.warn('No colleagues found, returning empty array');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Utility function to fetch all dashboard data at once
   * @returns {Promise<Object>} Combined dashboard data
   */
  getAllDashboardData: async () => {
    try {
      const [dashboard, shifts, colleagues] = await Promise.all([
        this.getDashboardData(),
        this.getShiftData(),
        this.getShiftColleagues()
      ]);
      
      return {
        dashboard,
        shifts,
        colleagues
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardAPI;