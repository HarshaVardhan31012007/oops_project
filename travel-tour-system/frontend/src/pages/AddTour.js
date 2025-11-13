import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft } from 'react-icons/fi';
import { tourAPI } from '../services/api';
import toast from 'react-hot-toast';

const AddTour = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');
  const [itineraryInput, setItineraryInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    destination: '',
    country: '',
    price: '',
    originalPrice: '',
    duration: '',
    difficulty: 'moderate',
    inclusions: [],
    exclusions: [],
    itinerary: []
  });

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only admins can add tours</p>
          <button
            onClick={() => navigate('/tours')}
            className="btn btn-primary"
          >
            Go to Tours
          </button>
        </div>
      </div>
    );
  }

  const handleAddInclusion = () => {
    if (inclusionInput.trim()) {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, inclusionInput.trim()]
      });
      setInclusionInput('');
    }
  };

  const handleRemoveInclusion = (index) => {
    setFormData({
      ...formData,
      inclusions: formData.inclusions.filter((_, i) => i !== index)
    });
  };

  const handleAddExclusion = () => {
    if (exclusionInput.trim()) {
      setFormData({
        ...formData,
        exclusions: [...formData.exclusions, exclusionInput.trim()]
      });
      setExclusionInput('');
    }
  };

  const handleRemoveExclusion = (index) => {
    setFormData({
      ...formData,
      exclusions: formData.exclusions.filter((_, i) => i !== index)
    });
  };

  const handleAddItinerary = () => {
    if (itineraryInput.trim()) {
      setFormData({
        ...formData,
        itinerary: [...formData.itinerary, itineraryInput.trim()]
      });
      setItineraryInput('');
    }
  };

  const handleRemoveItinerary = (index) => {
    setFormData({
      ...formData,
      itinerary: formData.itinerary.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Transform itinerary from simple strings to proper format
      const transformedItinerary = formData.itinerary.map((item, index) => {
        // Parse "Day 1: Description" format
        const match = item.match(/Day\s(\d+):\s(.+)/);
        return {
          day: match ? parseInt(match[1]) : index + 1,
          title: `Day ${match ? match[1] : index + 1}`,
          description: match ? match[2] : item,
          activities: [],
          meals: [],
          accommodation: ''
        };
      });

      const tourData = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim() || formData.description.trim().substring(0, 100),
        description: formData.description.trim(),
        destination: formData.destination.trim(),
        country: formData.country.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        duration: parseInt(formData.duration),
        difficulty: formData.difficulty,
        inclusions: formData.inclusions,
        exclusions: formData.exclusions,
        itinerary: transformedItinerary,
        groupSize: { min: 1, max: 20 },
        bookings: { total: 0, available: 50 },
        cancellationPolicy: 'Free cancellation up to 7 days before departure',
        bookingDeadline: 7
      };

      console.log('Submitting tour data:', tourData);
      const response = await tourAPI.createTour(tourData);
      console.log('Tour created:', response);
      toast.success('Tour added successfully!');
      navigate('/tours');
    } catch (error) {
      console.error('Error adding tour:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to add tour';
      console.error('Error details:', error.response?.data);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/tours')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Tours
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Tour</h1>
          <p className="text-gray-600 mt-2">Create and publish a new tour package</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input w-full"
                placeholder="Tour title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="input w-full"
                placeholder="e.g., Paris"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input w-full"
                placeholder="e.g., France"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input w-full"
                placeholder="e.g., 5"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input w-full"
                placeholder="e.g., 999"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Price ($)</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="input w-full"
                placeholder="Optional"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="input w-full"
              placeholder="Brief summary of the tour"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
              placeholder="Detailed description of the tour"
              rows="4"
              minLength="50"
              required
            ></textarea>
          </div>

          {/* Inclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions *</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={inclusionInput}
                onChange={(e) => setInclusionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclusion())}
                className="input flex-1"
                placeholder="e.g., Hotel, Breakfast, Tour Guide"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="btn btn-outline btn-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.inclusions.map((inc, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {inc}
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(idx)}
                    className="text-green-600 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exclusions</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={exclusionInput}
                onChange={(e) => setExclusionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExclusion())}
                className="input flex-1"
                placeholder="e.g., Flights, Travel Insurance"
              />
              <button
                type="button"
                onClick={handleAddExclusion}
                className="btn btn-outline btn-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.exclusions.map((exc, idx) => (
                <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {exc}
                  <button
                    type="button"
                    onClick={() => handleRemoveExclusion(idx)}
                    className="text-red-600 hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Itinerary (Days) *</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={itineraryInput}
                onChange={(e) => setItineraryInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItinerary())}
                className="input flex-1"
                placeholder="e.g., Day 1: Arrival and City Tour"
              />
              <button
                type="button"
                onClick={handleAddItinerary}
                className="btn btn-outline btn-sm"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.itinerary.map((day, idx) => (
                <div key={idx} className="bg-gray-100 p-3 rounded flex justify-between items-center">
                  <span className="text-sm text-gray-900">Day {idx + 1}: {day}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItinerary(idx)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Adding Tour...' : 'Add Tour'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tours')}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTour;
