import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tourReducer from './slices/tourSlice';
import bookingReducer from './slices/bookingSlice';
import reviewReducer from './slices/reviewSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tours: tourReducer,
    bookings: bookingReducer,
    reviews: reviewReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
