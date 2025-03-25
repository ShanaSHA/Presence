import axios from 'axios';

import {BASE_URL} from "../config"// Update with your Django server URL

// Configure axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}` // For JWT auth
  }
});

// Helper function to handle errors
const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error:', error.response.data);
    throw error.response.data;
  } else {
    console.error('API Error:', error.message);
    throw new Error('An error occurred while making the API request');
  }
};

const shiftApiService = {
  // Working Hours API
  fetchWorkingHours: async () => {
    try {
      const response = await api.get('/working-hours/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createWorkingHours: async (data) => {
    try {
      const response = await api.post('/working-hours/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Shift Rosters API
  fetchShiftRosters: async () => {
    try {
      const response = await api.get('/shift-rosters/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createShiftRoster: async (data) => {
    try {
      const response = await api.post('/shift-rosters/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Employee Shift Assignments
  fetchEmployeeAssignments: async (params = {}) => {
    try {
      const response = await api.get('/employee-shift-assignments/', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  assignShift: async (data) => {
    try {
      const response = await api.post('/assign-shift/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Employees API
  fetchEmployees: async () => {
    try {
      const response = await api.get('/employees/');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update shift assignments
 
};

export default shiftApiService;