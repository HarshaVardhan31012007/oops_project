import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Clear authorization header if no token
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Bad request');
          break;
        case 401:
          toast.error('Unauthorized access');
          break;
        case 403:
          toast.error('Access forbidden');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          if (data.errors) {
            data.errors.forEach(error => {
              toast.error(error.msg);
            });
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUserBookings: (params) => api.get('/users/bookings', { params }),
  getUserItineraries: (params) => api.get('/users/itineraries', { params }),
  getDashboard: () => api.get('/users/dashboard'),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
};

export const tourAPI = {
  getTours: (params) => api.get('/tours', { params }),
  getTour: (id) => api.get(`/tours/${id}`),
  getFeaturedTours: () => api.get('/tours/featured'),
  getDestinations: () => api.get('/tours/destinations'),
  searchTours: (params) => api.get('/tours/search', { params }),
  createTour: (tourData) => api.post('/tours', tourData),
  updateTour: (id, tourData) => api.put(`/tours/${id}`, tourData),
  deleteTour: (id) => api.delete(`/tours/${id}`),
  createCustomItinerary: (itineraryData) => api.post('/tours/custom-itinerary', itineraryData),
  getCustomItineraries: (params) => api.get('/tours/custom-itinerary', { params }),
  getCustomItinerary: (id) => api.get(`/tours/custom-itinerary/${id}`),
  updateCustomItinerary: (id, itineraryData) => api.put(`/tours/custom-itinerary/${id}`, itineraryData),
  deleteCustomItinerary: (id) => api.delete(`/tours/custom-itinerary/${id}`),
};

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.delete(`/bookings/${id}`, { data: { cancellationReason: reason } }),
  getAllBookings: (params) => api.get('/bookings', { params }),
  updateBookingStatus: (id, status, notes) => api.put(`/bookings/${id}/status`, { status, notes }),
};

export const reviewAPI = {
  submitReview: (reviewData) => api.post('/reviews', reviewData),
  getTourReviews: (tourId, params) => api.get(`/reviews/tour/${tourId}`, { params }),
  getUserReviews: (params) => api.get('/reviews/user', { params }),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  canReviewTour: (tourId) => api.get(`/reviews/can-review/${tourId}`),
  getAllReviews: (params) => api.get('/reviews', { params }),
  moderateReview: (id, status, notes) => api.put(`/reviews/${id}/moderate`, { status, moderationNotes: notes }),
};

export const adminAPI = {
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, status),
  getTours: (params) => api.get('/admin/tours', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  generateReports: (params) => api.get('/admin/reports', { params }),
};

export default api;
