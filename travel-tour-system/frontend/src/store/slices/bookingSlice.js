import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI, userAPI } from '../../services/api';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const getUserBookings = createAsyncThunk(
  'bookings/getUserBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const getBooking = createAsyncThunk(
  'bookings/getBooking',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBooking(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancelBooking(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
);

// Initial state
const initialState = {
  bookings: [],
  currentBooking: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  loading: false,
  error: null,
};

// Booking slice
const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearAllBookings: (state) => {
      state.bookings = [];
      state.currentBooking = null;
      state.pagination = {
        current: 1,
        pages: 1,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload.data.booking);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data.bookings;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get single booking
      .addCase(getBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.data.booking;
      })
      .addCase(getBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(booking => booking._id === action.payload.data.booking._id);
        if (index !== -1) {
          state.bookings[index] = action.payload.data.booking;
        }
        if (state.currentBooking && state.currentBooking._id === action.payload.data.booking._id) {
          state.currentBooking = action.payload.data.booking;
        }
      });
  },
});

export const { clearError, clearCurrentBooking, clearAllBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
