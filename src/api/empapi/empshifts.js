import axios from "axios";
import { BASE_URL } from '../config';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const shiftAPI = {
  /**
   * Fetch today's shifts for the logged-in employee
   * @returns {Promise<Array>} Shift data
   */
  async getTodayShifts() {
    try {
      const response = await api.get('/employee-shifts/');
      if (!Array.isArray(response.data)) throw new Error('Unexpected response format for today\'s shifts.');
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching today's shifts:", error);
      throw new Error(`Failed to fetch today's shifts: ${error.message}`);
    }
  },

  /**
   * Fetch colleagues in the same shift
   * @returns {Promise<Array>} Colleague list
   */
  async getShiftColleagues() {
    try {
      const response = await api.get('/shift/colleagues/');
      if (!Array.isArray(response.data)) throw new Error('Unexpected response format for shift colleagues.');
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching shift colleagues:", error);
      throw new Error(`Failed to fetch shift colleagues: ${error.message}`);
    }
  },

  /**
   * Fetch shifts for a given date
   * @param {Date} date - The target date
   * @returns {Promise<Object>} Shift data
   */
  async getEmployeeShifts(date) {
    if (!(date instanceof Date) || isNaN(date)) {
      throw new Error('Invalid date parameter: Must be a valid Date object.');
    }

    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/shifts-colleagues/?date=${formattedDate}`);
      
      if (!response.data?.shifts) throw new Error(`No shift data found for ${formattedDate}`);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching shifts for ${date.toDateString()}:`, error);
      throw new Error(`Failed to fetch shifts: ${error.message}`);
    }
  },

  /**
   * Fetch and categorize shift data for a specific day
   * @param {number} day - Day of the month (1-31)
   * @param {number} month - Month (0 for January, 11 for December)
   * @param {number} year - Year (e.g., 2025)
   * @returns {Promise<Object>} Categorized shifts
   */
  async getMonthlyShiftData(date) {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date parameter: Must be a valid Date object.');
      }
  
      // Extract and validate day, month, year
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
  
      if (day < 1 || day > 31) throw new Error('Invalid day: Must be between 1 and 31.');
      if (month < 0 || month > 11) throw new Error('Invalid month: Must be between 0 and 11.');
      if (year < 2000 || year > 2100) throw new Error('Invalid year: Must be between 2000 and 2100.');
  
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
  
      // Debugging Log
      console.log(`Fetching shifts for date: ${formattedDate}`);
  
      // Fetch Data
      const response = await api.get(`/shift-colleagues/${formattedDate}/`);
  
      // Debugging Log: Check response structure
      console.log('API Response:', response.data);
  
      if (!response.data?.shifts) {
        throw new Error(`No shift data received for ${formattedDate}`);
      }
  
      // Categorize Shifts
      return response.data.shifts.reduce(
        (result, shift) => {
          const shiftType = shift.shift?.shift_type?.toLowerCase() || "";
          if (shiftType.includes('morning')) result.morning = shift;
          else if (shiftType.includes('intermediate')) result.intermediate = shift;
          else if (shiftType.includes('night')) result.night = shift;
          return result;
        },
        { morning: null, intermediate: null, night: null }
      );
  
    } catch (error) {
      console.error(`❌ Error fetching shifts for ${date.toDateString()}:`, error);
      throw new Error(`Failed to fetch shifts: ${error.message}`);
    }
  }
  
  
};

export default shiftAPI;
