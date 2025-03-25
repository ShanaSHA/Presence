import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/adminapi/leavepolicy';

// Async thunks for leave types
export const addLeaveType = createAsyncThunk(
  'holidays/addLeaveType',
  async (leaveTypeData, { rejectWithValue }) => {
    try {
      const response = await api.createLeaveType(leaveTypeData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for holidays
export const fetchHolidays = createAsyncThunk(
  'holidays/fetchHolidays',
  async (year, { rejectWithValue }) => {
    try {
      const response = await api.fetchHolidays(year);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addHoliday = createAsyncThunk(
  'holidays/addHoliday',
  async (holidayData, { rejectWithValue }) => {
    try {
      const response = await api.createHoliday(holidayData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateHoliday = createAsyncThunk(
  'holidays/updateHoliday',
  async ({ id, holidayData }, { rejectWithValue }) => {
    try {
      const response = await api.updateHoliday({ ...holidayData, id });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteHoliday = createAsyncThunk(
  'holidays/deleteHoliday',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteHoliday(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunks for leave types
export const fetchLeaveTypes = createAsyncThunk(
  'holidays/fetchLeaveTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.fetchLeaveTypes();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: {
    holidays: [],
    leaveTypes: [],
    loading: false,
    leaveTypesLoading: false,
    error: null,
    leaveTypesError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch holidays
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
      })

      // Add holiday
      .addCase(addHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHoliday.fulfilled, (state, action) => {
        state.holidays.push(action.payload);
        state.loading = false;
      })
      .addCase(addHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update holiday
      .addCase(updateHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHoliday.fulfilled, (state, action) => {
        const index = state.holidays.findIndex((holiday) => holiday.id === action.payload.id);
        if (index !== -1) {
          state.holidays[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete holiday
      .addCase(deleteHoliday.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter((holiday) => holiday.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteHoliday.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch leave types
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.leaveTypesLoading = true;
        state.leaveTypesError = null;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload;
        state.leaveTypesLoading = false;
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.leaveTypesLoading = false;
        state.leaveTypesError = action.payload;
      })

      // Add leave type
      .addCase(addLeaveType.pending, (state) => {
        state.leaveTypesLoading = true;
        state.leaveTypesError = null;
      })
      .addCase(addLeaveType.fulfilled, (state, action) => {
        state.leaveTypes.push(action.payload);
        state.leaveTypesLoading = false;
      })
      .addCase(addLeaveType.rejected, (state, action) => {
        state.leaveTypesLoading = false;
        state.leaveTypesError = action.payload;
      });
  },
});

export default holidaySlice.reducer;