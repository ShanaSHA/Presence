import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHrUsers, addHrUser, getDesignations, getCommunities } from '../../api/adminapi/HrUser';

// Async thunks
export const fetchAllHrUsers = createAsyncThunk(
  'hrUsers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchHrUsers();
     
      
      if (response && response.hr_users && Array.isArray(response.hr_users)) {
        return response.hr_users;
      }
      return rejectWithValue('Invalid data structure received');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch HR users');
    }
  }
);

export const fetchDesignations = createAsyncThunk(
  'hrUsers/fetchDesignations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDesignations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch designations');
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

export const createHrUser = createAsyncThunk(
  'hrUsers/create',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await addHrUser({
        ...userData,
        role: userData.role.toLowerCase()
      });

      if (response && (response.id || response.message)) {
        return response;
      }
      return rejectWithValue('Failed to add HR user. Invalid response from server.');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add HR user';
      return rejectWithValue(errorMessage);
    }
  }
);

const hrUsersSlice = createSlice({
  name: 'hrUsers',
  initialState: {
    users: [],
    designations: [],
    communities: [],
    loading: false,
    error: null,
    isPopupOpen: false,
    searchTerm: '',
    formData: {
      name: '',
      email: '',
      role: '',
      department: '',
      community: '',
      emp_num: '',
      designation: '',
      hire_date: '',
      password: 'defaultPassword123'
    }
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    togglePopup: (state) => {
      state.isPopupOpen = !state.isPopupOpen;
      if (!state.isPopupOpen) {
        state.formData = hrUsersSlice.getInitialState().formData;
      }
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = hrUsersSlice.getInitialState().formData;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All HR Users
      .addCase(fetchAllHrUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllHrUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllHrUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Designations
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        state.designations = action.payload;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Communities
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create HR User
      .addCase(createHrUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHrUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.id) {
          state.users.push({
            ...action.payload,
            employee__name: action.payload.name,
            id: action.payload.id
          });
        }
        state.isPopupOpen = false;
        state.formData = hrUsersSlice.getInitialState().formData;
      })
      .addCase(createHrUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSearchTerm, 
  togglePopup, 
  updateFormData, 
  resetFormData 
} = hrUsersSlice.actions;

export default hrUsersSlice.reducer;