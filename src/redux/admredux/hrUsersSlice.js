// First, let's create the HR users slice file
// src/store/slices/hrUsersSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHrUsers, addHrUser } from '../../api/adminapi/HrUser';

// Async thunks for API calls
export const fetchAllHrUsers = createAsyncThunk(
  'hrUsers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchHrUsers();
      if (response && Array.isArray(response.hr_users)) {
        return response.hr_users;
      } else {
        return rejectWithValue('Invalid data structure received');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch HR users');
    }
  }
);

// export const createHrUser = createAsyncThunk(
//   'hrUsers/create',
//   async (userData, { rejectWithValue }) => {
//     try {
//       const newUser = await addHrUser({ ...userData, role: userData.role.toLowerCase() });
//       if (newUser && newUser.email) {
//         return newUser;
//       } else {
//         return rejectWithValue('Failed to add HR user');
//       }
//     } catch (error) {
//       return rejectWithValue(error.message || 'Failed to add HR user');
//     }
//   }
// );

export const createHrUser = createAsyncThunk(
  'hrUsers/create',
  async (userData, { rejectWithValue }) => {
    try {
      console.log("🔄 Sending request with data:", userData);

      // Ensure role is properly formatted
      const response = await addHrUser({ ...userData, role: userData.role.toLowerCase() });

      console.log("✅ API Response:", response);

      if (response && response.message) {
        return response;
      } else {
        console.error("❌ API response invalid:", response);
        return rejectWithValue('Failed to add HR user. Invalid response from server.');
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);

      // Handle errors properly
      let errorMessage = 'Failed to add HR user';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message; // API-defined error
      } else if (error.message) {
        errorMessage = error.message; // Generic fetch error
      }

      return rejectWithValue(errorMessage);
    }
  }
);


// HR Users slice
const hrUsersSlice = createSlice({
  name: 'hrUsers',
  initialState: {
    users: [],
    loading: false,
    error: null,
    isPopupOpen: false,
    searchTerm: '',
    formData: {
      name: '',
      email: '',
      role: '',
      department: '',
      community: '', // Add this field
      password: '',
    }
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    togglePopup: (state) => {
      state.isPopupOpen = !state.isPopupOpen;
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = {
        name: '',
        email: '',
        role: '',
        department: '',
        community: '', // Add this field
        password: '',
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllHrUsers
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
      // Handle createHrUser
      .addCase(createHrUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHrUser.fulfilled, (state, action) => {
        state.loading = false;
        // Transform the data to match what your component expects
        const newUser = {
          ...action.payload,
          employee__name: action.payload.name, // Map the name to employee__name
          id: action.payload.id || Date.now(), // Ensure there's an ID
        };
        
        // Check for duplicates before adding
        if (!state.users.some(user => user.email === newUser.email)) {
          state.users.push(newUser);
        }
        state.isPopupOpen = false;
        state.formData = {
          name: '',
          email: '',
          role: '',
          department: '',
          community: '', // Add this field
          password: '',
        };
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