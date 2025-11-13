import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Tours from './pages/Tours';
import TourDetails from './pages/TourDetails';
import AddTour from './pages/AddTour';
import CustomItinerary from './pages/CustomItinerary';
import MyItineraries from './pages/MyItineraries';
import MyBookings from './pages/MyBookings';
import MyProfile from './pages/MyProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Error boundary
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Helmet>
          <title>Travel Tour System</title>
          <meta name="description" content="Discover amazing destinations and book your perfect tour" />
        </Helmet>
        
        <Navbar />
        
        <main className="min-h-screen">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:id" element={<TourDetails />} />
            
            {/* Protected user routes */}
            <Route path="/add-tour" element={
              <ProtectedRoute adminOnly>
                <AddTour />
              </ProtectedRoute>
            } />
            <Route path="/itinerary" element={
              <ProtectedRoute>
                <CustomItinerary />
              </ProtectedRoute>
            } />
            <Route path="/my-itineraries" element={
              <ProtectedRoute>
                <MyItineraries />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/tours" element={
              <ProtectedRoute adminOnly>
                <AdminTours />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute adminOnly>
                <AdminReviews />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
