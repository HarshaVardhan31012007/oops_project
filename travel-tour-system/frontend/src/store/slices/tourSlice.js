import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tourAPI } from '../../services/api';

// Async thunks
export const fetchTours = createAsyncThunk(
  'tours/fetchTours',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tourAPI.getTours(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tours');
    }
  }
);

export const fetchTour = createAsyncThunk(
  'tours/fetchTour',
  async (id, { rejectWithValue }) => {
    try {
      const response = await tourAPI.getTour(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tour');
    }
  }
);

export const fetchFeaturedTours = createAsyncThunk(
  'tours/fetchFeaturedTours',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tourAPI.getFeaturedTours();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured tours');
    }
  }
);

export const fetchDestinations = createAsyncThunk(
  'tours/fetchDestinations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tourAPI.getDestinations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch destinations');
    }
  }
);

export const searchTours = createAsyncThunk(
  'tours/searchTours',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tourAPI.searchTours(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const createTour = createAsyncThunk(
  'tours/createTour',
  async (tourData, { rejectWithValue }) => {
    try {
      const response = await tourAPI.createTour(tourData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tour');
    }
  }
);

export const updateTour = createAsyncThunk(
  'tours/updateTour',
  async ({ id, tourData }, { rejectWithValue }) => {
    try {
      const response = await tourAPI.updateTour(id, tourData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tour');
    }
  }
);

export const deleteTour = createAsyncThunk(
  'tours/deleteTour',
  async (id, { rejectWithValue }) => {
    try {
      await tourAPI.deleteTour(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tour');
    }
  }
);

// Initial state
const initialState = {
  tours: [],
  featuredTours: [],
  destinations: [],
  currentTour: null,
  currentTourReviews: [],
  searchResults: [],
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  loading: false,
  error: null,
  filters: {
    destination: '',
    country: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    difficulty: '',
    search: '',
    startDate: '',
    travelers: '',
  },
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
};

// Tour slice
const tourSlice = createSlice({
  name: 'tours',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTour: (state) => {
      state.currentTour = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearAllTours: (state) => {
      state.tours = [];
      state.featuredTours = [];
      state.destinations = [];
      state.currentTour = null;
      state.currentTourReviews = [];
      state.searchResults = [];
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        destination: '',
        country: '',
        minPrice: '',
        maxPrice: '',
        duration: '',
        difficulty: '',
        search: '',
        startDate: '',
        travelers: '',
      };
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tours
      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.tours = action.payload.data.tours;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single tour
      .addCase(fetchTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTour.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTour = action.payload.data.tour;
        state.currentTourReviews = action.payload.data.reviews || [];
      })
      .addCase(fetchTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch featured tours
      .addCase(fetchFeaturedTours.fulfilled, (state, action) => {
        state.featuredTours = action.payload.data.tours;
      })
      
      // Fetch destinations
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.destinations = action.payload.data.destinations;
      })
      
      // Search tours
      .addCase(searchTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data.tours;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(searchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create tour
      .addCase(createTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTour.fulfilled, (state, action) => {
        state.loading = false;
        state.tours.unshift(action.payload.data.tour);
      })
      .addCase(createTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update tour
      .addCase(updateTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTour.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tours.findIndex(tour => tour._id === action.payload.data.tour._id);
        if (index !== -1) {
          state.tours[index] = action.payload.data.tour;
        }
        if (state.currentTour && state.currentTour._id === action.payload.data.tour._id) {
          state.currentTour = action.payload.data.tour;
        }
      })
      .addCase(updateTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete tour
      .addCase(deleteTour.fulfilled, (state, action) => {
        state.tours = state.tours.filter(tour => tour._id !== action.payload);
        if (state.currentTour && state.currentTour._id === action.payload) {
          state.currentTour = null;
        }
      });
  },
});

export const {
  clearError,
  clearCurrentTour,
  clearSearchResults,
  clearAllTours,
  setFilters,
  clearFilters,
  setSort,
  setPagination,
} = tourSlice.actions;

export default tourSlice.reducer;
