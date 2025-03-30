import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../api/config';
// Base URL for API endpoints
// Adjust as needed

// Function to get the authentication token (if required)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token'); // Adjust based on your auth flow
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Async thunks for API operations
export const fetchLeavePolicies = createAsyncThunk(
  'leavePolicies/fetchLeavePolicies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/leave-policies`, {
        headers: getAuthHeaders(),
      });

      console.log('Fetch response status:', response.status);
      console.log('Fetch response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        return rejectWithValue(`Server error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        return rejectWithValue('Received non-JSON response from server');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createLeavePolicy = createAsyncThunk(
  'leavePolicies/createLeavePolicy',
  async (policyData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/leave-policy/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        return rejectWithValue(`Server error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating leave policy:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateLeavePolicy = createAsyncThunk(
  'leavePolicies/updateLeavePolicy',
  async ({ id, policyData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/leave-requests/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        return rejectWithValue(`Server error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating leave policy:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLeavePolicy = createAsyncThunk(
  'leavePolicies/deleteLeavePolicy',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/leave-policy/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        return rejectWithValue(`Server error: ${response.status} ${response.statusText}`);
      }

      return id;
    } catch (error) {
      console.error('Error deleting leave policy:', error);
      return rejectWithValue(error.message);
    }
  }
);

const leavePoliciesSlice = createSlice({
  name: 'leavePolicies',
  initialState: {
    policies: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentPolicy: {
      id: '',
      leave_type: '',
      frequency: '',
      amount: '',
      carry_forward: 'no',
      status: 'active',
    },
    showCreateModal: false,
    showUpdateModal: false,
  },
  reducers: {
    setCurrentPolicy: (state, action) => {
      state.currentPolicy = action.payload;
    },
    resetCurrentPolicy: (state) => {
      state.currentPolicy = {
        id: '',
        leave_type: '',
        frequency: '',
        amount: '',
        carry_forward: 'no',
        status: 'active',
      };
    },
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowUpdateModal: (state, action) => {
      state.showUpdateModal = action.payload;
    },
    updateCurrentPolicyField: (state, action) => {
      const { field, value } = action.payload;
      state.currentPolicy[field] = value;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leave Policies
      .addCase(fetchLeavePolicies.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeavePolicies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.policies = action.payload;
      })
      .addCase(fetchLeavePolicies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      })
      // Create Leave Policy
      .addCase(createLeavePolicy.pending, (state) => {
        state.error = null;
      })
      .addCase(createLeavePolicy.fulfilled, (state, action) => {
        state.policies.push(action.payload);
        state.showCreateModal = false;
      })
      .addCase(createLeavePolicy.rejected, (state, action) => {
        state.error = action.payload || 'Failed to create leave policy';
      })
      // Update Leave Policy
      .addCase(updateLeavePolicy.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLeavePolicy.fulfilled, (state, action) => {
        state.policies = state.policies.map((policy) =>
          policy.id === action.payload.id ? action.payload : policy
        );
        state.showUpdateModal = false;
      })
      .addCase(updateLeavePolicy.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update leave policy';
      })
      // Delete Leave Policy
      .addCase(deleteLeavePolicy.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteLeavePolicy.fulfilled, (state, action) => {
        state.policies = state.policies.filter((policy) => policy.id !== action.payload);
      })
      .addCase(deleteLeavePolicy.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete leave policy';
      });
  },
});

export const {
  setCurrentPolicy,
  resetCurrentPolicy,
  setShowCreateModal,
  setShowUpdateModal,
  updateCurrentPolicyField,
} = leavePoliciesSlice.actions;

export default leavePoliciesSlice.reducer;
