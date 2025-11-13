import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiTrash2, FiEdit2, FiArrowRight } from 'react-icons/fi';
import { tourAPI } from '../services/api';
import toast from 'react-hot-toast';

const MyItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchItineraries();
  }, [isAuthenticated, navigate]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await tourAPI.getCustomItineraries();
      setItineraries(response.data.data.itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      setDeleting(id);
      await tourAPI.deleteCustomItinerary(id);
      setItineraries(itineraries.filter(it => it._id !== id));
      toast.success('Itinerary deleted successfully');
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast.error('Failed to delete itinerary');
    } finally {
      setDeleting(null);
    }
  };

  const calculateTotalCost = (itinerary) => {
    if (!itinerary.days) return 0;
    return itinerary.days.reduce((total, day) => {
      const dayCost = day.estimatedCost || 0;
      const activitiesCost = (day.activities || []).reduce((sum, activity) => sum + (activity.cost || 0), 0);
      return total + dayCost + activitiesCost;
    }, 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading itineraries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Itineraries</h1>
          <p className="text-gray-600">Manage your custom travel plans</p>
          <Link
            to="/itinerary"
            className="mt-4 inline-block btn btn-primary"
          >
            Create New Itinerary
          </Link>
        </div>

        {/* Itineraries List */}
        {itineraries.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No itineraries yet</h3>
            <p className="text-gray-600 mb-6">You haven't created any custom itineraries. Start planning your next trip!</p>
            <Link
              to="/itinerary"
              className="btn btn-primary inline-block"
            >
              Create Your First Itinerary
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {itineraries.map((itinerary) => (
              <div key={itinerary._id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{itinerary.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        <span>{itinerary.destination}, {itinerary.country}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        <span>
                          {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FiUsers className="w-4 h-4 mr-2" />
                        <span>
                          {itinerary.travelers.adults} adult{itinerary.travelers.adults !== 1 ? 's' : ''}
                          {itinerary.travelers.children > 0 && `, ${itinerary.travelers.children} child${itinerary.travelers.children !== 1 ? 'ren' : ''}`}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <FiDollarSign className="w-4 h-4 mr-2" />
                        <span>${calculateTotalCost(itinerary).toFixed(2)} estimated</span>
                      </div>
                    </div>

                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {itinerary.days.length} days
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:ml-4">
                    <button
                      onClick={() => navigate(`/itinerary/${itinerary._id}`)}
                      className="btn btn-outline btn-sm flex items-center justify-center"
                    >
                      <FiEdit2 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(itinerary._id)}
                      disabled={deleting === itinerary._id}
                      className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 flex items-center justify-center disabled:opacity-50"
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      {deleting === itinerary._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItineraries;
