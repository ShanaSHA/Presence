import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../api/config';

// Function to get the authentication token
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks for API operations
export const fetchHolidays = createAsyncThunk(
  'holidays/fetchHolidays',
  async (year, { rejectWithValue }) => {
    try {
      const url = year 
        ? `${BASE_URL}/public-holidays/?year=${year}` 
        : `${BASE_URL}/public-holidays/`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(`Server error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLeaveTypes = createAsyncThunk(
  'holidays/fetchLeaveTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/policyleavetype/`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(`Server error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addHoliday = createAsyncThunk(
  'holidays/addHoliday',
  async (holidayData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/public-holidays/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(holidayData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(`Server error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchCommunities = createAsyncThunk(
  'hrUsers/fetchCommunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCommunities();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch communities');
    }
  }
);

export const updateHoliday = createAsyncThunk(
  'holidays/updateHoliday',
  async ({ id, holidayData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/public-holidays/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(holidayData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(`Server error: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteHoliday = createAsyncThunk(
  'holidays/deleteHoliday',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/public-holidays/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(`Server error: ${response.status} ${errorText}`);
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addLeaveType = createAsyncThunk(
  'holidays/addLeaveType',
  async (leaveTypeData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/policyleavetype/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leaveTypeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return rejectWithValue(`Server error: ${response.status} ${errorText}`);
      }

      return await response.json();
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
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Holidays
      .addCase(fetchHolidays.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.holidays = action.payload;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Leave Types
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.leaveTypes = action.payload;
      })
      // Add Holiday
      .addCase(addHoliday.fulfilled, (state, action) => {
        state.holidays.push(action.payload);
      })
      // Update Holiday
      .addCase(updateHoliday.fulfilled, (state, action) => {
        const index = state.holidays.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.holidays[index] = action.payload;
        }
      })
      // Delete Holiday
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter(h => h.id !== action.payload);
      })
      // Add Leave Type
      .addCase(addLeaveType.fulfilled, (state, action) => {
        state.leaveTypes.push(action.payload);
      });
  },
});

export default holidaySlice.reducer;