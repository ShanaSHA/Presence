// src/redux/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardStats, fetchAttendanceData } from '../../api/adminapi/Dashboard';

// Async thunk for fetching dashboard stats
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch both stats and attendance in a single thunk
      const [statsData, attendanceData] = await Promise.all([
        fetchDashboardStats(),
        fetchAttendanceData()
      ]);

      return {
        stats: {
          employees: statsData?.total_employees || 0,
          hrUsers: statsData?.total_hr || 0,
          leaveRequests: statsData?.leave_requests || 0,
          leaveCancellations: statsData?.leave_cancellations || 0
        },
        attendance: [
          { name: "Present", value: attendanceData?.present || 0 },
          { name: "Absent", value: attendanceData?.absent || 0 },
          { name: "Late", value: attendanceData?.late || 0 }
        ]
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch dashboard data');
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    employees: 0,
    hrUsers: 0,
    leaveRequests: 0,
    leaveCancellations: 0,
    attendanceData: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Update stats
        const { stats, attendance } = action.payload;
        state.employees = stats.employees;
        state.hrUsers = stats.hrUsers;
        state.leaveRequests = stats.leaveRequests;
        state.leaveCancellations = stats.leaveCancellations;
        
        // Update attendance data
        state.attendanceData = attendance;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'An error occurred';
      });
  }
});

export default dashboardSlice.reducer;