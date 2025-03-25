// src/api/adminapi/leavepolicy.js

import axios from 'axios';

// Base URL for API requests
import {BASE_URL} from "../config"
// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Holiday API calls
const fetchHolidays = async () => {
  try {
    const response = await apiClient.get('/public-holidays/');
    return response.data;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

const createHoliday = async (holidayData) => {
  // Transform frontend data to match backend expectations
  const transformedData = {
    name: holidayData.name,
    date: holidayData.date,
    description: holidayData.description || '',
    status: holidayData.status.toLowerCase(),
    leave_type: holidayData.type, // Backend expects leave_type
    community: holidayData.community || 'Other'
  };

  try {
    const response = await apiClient.post('/public-holidays/', transformedData);
    return response.data;
  } catch (error) {
    console.error('Error creating holiday:', error);
    throw error;
  }
};

const updateHoliday = async (holidayData) => {
  // Transform frontend data to match backend expectations
  const transformedData = {
    name: holidayData.name,
    date: holidayData.date,
    description: holidayData.description || '',
    status: holidayData.status.toLowerCase(),
    leave_type: holidayData.type, // Backend expects leave_type
    community: holidayData.community || 'Other'
  };

  try {
    const response = await apiClient.put(`/public-holidays/${holidayData.id}/`, transformedData);
    return response.data;
  } catch (error) {
    console.error('Error updating holiday:', error);
    throw error;
  }
};

const deleteHoliday = async (id) => {
  try {
    await apiClient.delete(`/public-holidays/${id}/`);
    return id;
  } catch (error) {
    console.error('Error deleting holiday:', error);
    throw error;
  }
};

// Leave Types API calls
const fetchLeaveTypes = async () => {
  try {
    const response = await apiClient.get('/leave-types/');
    return response.data;
  } catch (error) {
    console.error('Error fetching leave types:', error);
    throw error;
  }
};

const createLeaveType = async (leaveTypeData) => {
  try {
    const response = await apiClient.post('/policyleavetype/', {
      leave: leaveTypeData.name, // Match backend field name
      color: leaveTypeData.color
    });
    return response.data;
  } catch (error) {
    console.error('Error creating leave type:', error);
    throw error;
  }
};

export {
  fetchHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  fetchLeaveTypes,
  createLeaveType
};