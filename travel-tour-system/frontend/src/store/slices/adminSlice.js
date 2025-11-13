import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

// Async thunks
export const getAnalytics = createAsyncThunk(
  'admin/getAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'admin/getUserDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUserDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const getTours = createAsyncThunk(
  'admin/getTours',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getTours(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tours');
    }
  }
);

export const getBookings = createAsyncThunk(
  'admin/getBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const getReviews = createAsyncThunk(
  'admin/getReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const generateReports = createAsyncThunk(
  'admin/generateReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.generateReports(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate reports');
    }
  }
);

// Initial state
const initialState = {
  analytics: {
    overview: {
      totalUsers: 0,
      totalTours: 0,
      totalBookings: 0,
      totalRevenue: 0,
      activeUsers: 0,
      newUsers: 0,
      newBookings: 0,
      revenue: 0,
    },
    popularDestinations: [],
    bookingTrends: [],
    userGrowth: [],
    recentActivities: {
      bookings: [],
      reviews: [],
    },
  },
  users: [],
  userDetails: null,
  tours: [],
  bookings: [],
  reviews: [],
  reports: {},
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  loading: false,
  error: null,
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get analytics
      .addCase(getAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload.data;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get users
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data.users;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user details
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload.data;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload.data.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.data.user;
        }
      })
      
      // Get tours
      .addCase(getTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTours.fulfilled, (state, action) => {
        state.loading = false;
        state.tours = action.payload.data.tours;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get bookings
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data.bookings;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get reviews
      .addCase(getReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data.reviews;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Generate reports
      .addCase(generateReports.fulfilled, (state, action) => {
        state.reports = action.payload.data.report;
      });
  },
});

export const { clearError, clearUserDetails, setPagination } = adminSlice.actions;
export default adminSlice.reducer;
