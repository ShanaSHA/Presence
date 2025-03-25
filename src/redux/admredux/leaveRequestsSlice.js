// src/store/slices/leaveRequestsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchLeaveRequests, manageLeaveRequest, manageCancellationRequest } from '../../api/adminapi/leaveApi';

// Async thunks for API actions
export const fetchAllLeaveRequests = createAsyncThunk(
  'leaveRequests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchLeaveRequests();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch leave requests');
    }
  }
);

export const updateLeaveRequestStatus = createAsyncThunk(
  'leaveRequests/updateStatus',
  async ({ leaveId, action }, { rejectWithValue }) => {
    try {
      await manageLeaveRequest(leaveId, action);
      return { leaveId, status: action };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update leave request');
    }
  }
);

export const approveCancellationRequest = createAsyncThunk(
  'leaveRequests/approveCancellation',
  async (leaveId, { rejectWithValue }) => {
    try {
      await manageCancellationRequest(leaveId, 'approve');
      return leaveId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to approve cancellation');
    }
  }
);

const leaveRequestsSlice = createSlice({
  name: 'leaveRequests',
  initialState: {
    requests: [],
    loading: false,
    error: null,
    activeTab: 'leave',
    selectedRequest: null,
    showCancellationReason: false,
    isSidebarOpen: true,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    selectRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    closeRequestDetail: (state) => {
      state.selectedRequest = null;
    },
    toggleCancellationReason: (state, action) => {
      state.showCancellationReason = action.payload !== undefined ? action.payload : !state.showCancellationReason;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllLeaveRequests
      .addCase(fetchAllLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAllLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle updateLeaveRequestStatus
      .addCase(updateLeaveRequestStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLeaveRequestStatus.fulfilled, (state, action) => {
        const { leaveId, status } = action.payload;
        state.requests = state.requests.map((request) =>
          request.id === leaveId ? { ...request, status } : request
        );
      })
      .addCase(updateLeaveRequestStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle approveCancellationRequest
      .addCase(approveCancellationRequest.fulfilled, (state) => {
        state.showCancellationReason = false;
      });
  },
});

export const {
  setActiveTab,
  selectRequest,
  closeRequestDetail,
  toggleCancellationReason,
  toggleSidebar,
} = leaveRequestsSlice.actions;

export default leaveRequestsSlice.reducer;