// src/services/attendanceApi.js

import axios from 'axios';
import {BASE_URL} from "../config"
// Create axios instance with default config
const api = axios.create({
  BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service for attendance-related operations
const attendanceApi = {
  // Get all attendance records including regular records and requests
  getAttendanceRecords: async () => {
    try {
      const response = await api.get('/empattendance/');
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  },

  // Get attendance overview and statistics by month
  getAttendanceStats: async (month, year) => {
    try {
      const response = await api.get('/empattendstat/', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      throw error;
    }
  },
  
  // Submit new attendance request
  createAttendanceRequest: async (requestData) => {
    try {
      const formData = new FormData();
      
      // Add all fields to formData for multipart/form-data support (for image upload)
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== null && requestData[key] !== undefined) {
          formData.append(key, requestData[key]);
        }
      });
      
      const response = await api.post('/empattendance//', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting attendance request:', error);
      throw error;
    }
  },
  
  // Get detailed info about a specific request
  getAttendanceRequestDetails: async (requestId) => {
    try {
      const response = await api.get(`//`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request details:', error);
      throw error;
    }
  },
  
  // Update an existing attendance request (if still pending)
  updateAttendanceRequest: async (requestId, updateData) => {
    try {
      const formData = new FormData();
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== null && updateData[key] !== undefined) {
          formData.append(key, updateData[key]);
        }
      });
      
      const response = await api.patch(`/attendance/request/${requestId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating attendance request:', error);
      throw error;
    }
  },
  
  // Delete a pending attendance request
  deleteAttendanceRequest: async (requestId) => {
    try {
      const response = await api.delete(`/attendance/request/${requestId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attendance request:', error);
      throw error;
    }
  },
  
  // Get calendar data with daily statuses for the month
  getMonthlyCalendarData: async (month, year) => {
    try {
      const response = await api.get('/attendance/calendar/', {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      throw error;
    }
  },
  
  // Get absence reasons for specific dates
  getAbsenceReasons: async (date) => {
    try {
      const response = await api.get('/attendance/absence/', {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching absence reasons:', error);
      throw error;
    }
  },
  
  // Get work type options from the server
  getWorkTypes: async () => {
    try {
      const response = await api.get('/attendance/work-types/');
      return response.data;
    } catch (error) {
      console.error('Error fetching work types:', error);
      throw error;
    }
  }
};

export default attendanceApi;