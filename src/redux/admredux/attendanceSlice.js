import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create async thunk for fetching attendance data
export const fetchAttendanceData = createAsyncThunk(
  "attendance/fetchAttendanceData",
  async (filters, { rejectWithValue }) => {
    try {
      console.log("📡 Sending Request with Filters:", filters);
      
      const params = new URLSearchParams();
      if (filters.fromDate) params.append("start_date", filters.fromDate);
      if (filters.toDate) params.append("end_date", filters.toDate);
      params.append("format", "json");

      const response = await axios.get("/attendance-report/", { params });

      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Fetch Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Failed to fetch attendance data");
    }
  }
);


// Create async thunk for generating reports
export const generateAttendanceReport = createAsyncThunk(
  "attendance/generateReport",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append("start_date", filters.fromDate);
      if (filters.toDate) params.append("end_date", filters.toDate);
      
      params.append("format", "excel"); // Ensuring Excel format is requested

      const response = await axios.get("/attendance-report/", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement("a");
link.href = url;
link.download = "attendance_report.xlsx";
document.body.appendChild(link);
link.click();
setTimeout(() => window.URL.revokeObjectURL(url), 100); // Cleanup


      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to generate report");
    }
  }
);
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    data: [
     
    ],
    filters: {
      department: '',
      fromDate: '',
      toDate: ''
    },
    status: 'idle',
    error: null,
    reportStatus: 'idle',
    reportError: null
  },
  reducers: {
    // Reducers for updating filters
    setDepartment: (state, action) => {
      state.filters.department = action.payload;
    },
    setDateRange: (state, action) => {
      const { fromDate, toDate } = action.payload;
      state.filters.fromDate = fromDate;
      state.filters.toDate = toDate;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAttendanceData states
      .addCase(fetchAttendanceData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAttendanceData.fulfilled, (state, action) => {
        console.log("✅ Processed Payload:", action.payload);
      
        state.status = 'succeeded';
      
        // Try extracting 'data' property if API wraps response
        const attendanceArray = Array.isArray(action.payload) 
        ? action.payload 
        : (action.payload && Array.isArray(action.payload.data) ? action.payload.data : []);
      
      
        if (Array.isArray(attendanceArray)) {
          state.data = attendanceArray.map(item => ({
            name: item['Employee Name'] || item.name,
            workDays: item['Total Working Days'] || item.workDays,
            leaves: item['Leave Days'] || item.leaves,
            overtime: (typeof item['Overtime Days'] === 'number' ? item['Overtime Days'] + ' hrs' : item.overtime)
          }));
        } else {
          console.error("⚠️ Expected an array but got:", action.payload);
          state.data = []; // Reset to avoid crashes
        }
      })
      
      .addCase(fetchAttendanceData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Handle generateAttendanceReport states
      .addCase(generateAttendanceReport.pending, (state) => {
        state.reportStatus = 'loading';
      })
      .addCase(generateAttendanceReport.fulfilled, (state) => {
        state.reportStatus = 'succeeded';
      })
      .addCase(generateAttendanceReport.rejected, (state, action) => {
        state.reportStatus = 'failed';
        state.reportError = action.payload;
      });
  }
});

export const {
  setDepartment,
  setDateRange
} = attendanceSlice.actions;

export default attendanceSlice.reducer;