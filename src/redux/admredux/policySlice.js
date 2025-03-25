import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/adminapi/leavepolicy';

// Async thunks for API calls
export const fetchLeavePolicies = createAsyncThunk(
  'policy/fetchLeavePolicies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/leave-policy/');
      console.log('API Response:', response.data);  // Debugging log
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkSchedules = createAsyncThunk(
  'policy/fetchWorkSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/work-time-view/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchHolidays = createAsyncThunk(
  'policy/fetchHolidays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/public-holidays/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const policySlice = createSlice({
  name: 'policy',
  initialState: {
    leavePolicies: [],
    workSchedules: [],
    holidays: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    // Leave Policies
    builder
      .addCase(fetchLeavePolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeavePolicies.fulfilled, (state, action) => {
        state.leavePolicies = action.payload;
        state.loading = false;
      })
      .addCase(fetchLeavePolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Work Schedules
    builder
      .addCase(fetchWorkSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkSchedules.fulfilled, (state, action) => {
        state.workSchedules = action.payload;
        state.loading = false;
      })
      .addCase(fetchWorkSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Holidays
    builder
      .addCase(fetchHolidays.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.holidays = action.payload;
        state.loading = false;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default policySlice.reducer;