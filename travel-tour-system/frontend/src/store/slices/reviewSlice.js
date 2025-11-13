import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewAPI } from '../../services/api';

// Async thunks
export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.submitReview(reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const getTourReviews = createAsyncThunk(
  'reviews/getTourReviews',
  async ({ tourId, params }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getTourReviews(tourId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const getUserReviews = createAsyncThunk(
  'reviews/getUserReviews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.getUserReviews(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.updateReview(id, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await reviewAPI.deleteReview(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const markHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async (id, { rejectWithValue }) => {
    try {
      const response = await reviewAPI.markHelpful(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark review as helpful');
    }
  }
);

// Initial state
const initialState = {
  reviews: [],
  userReviews: [],
  tourReviews: [],
  stats: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  loading: false,
  error: null,
};

// Review slice
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.tourReviews = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews.unshift(action.payload.data.review);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get tour reviews
      .addCase(getTourReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTourReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.tourReviews = action.payload.data.reviews;
        state.stats = action.payload.data.stats;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getTourReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user reviews
      .addCase(getUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload.data.reviews;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update review
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.userReviews.findIndex(review => review._id === action.payload.data.review._id);
        if (index !== -1) {
          state.userReviews[index] = action.payload.data.review;
        }
      })
      
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.userReviews = state.userReviews.filter(review => review._id !== action.payload);
      })
      
      // Mark helpful
      .addCase(markHelpful.fulfilled, (state, action) => {
        const review = state.tourReviews.find(r => r._id === action.payload.reviewId);
        if (review) {
          review.helpful.count = action.payload.helpfulCount;
        }
      });
  },
});

export const { clearError, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
