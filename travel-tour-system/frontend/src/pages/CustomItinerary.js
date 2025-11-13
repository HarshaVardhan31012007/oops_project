import React, { useState } from 'react';
import { FiPlus, FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiSave, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tourAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CustomItinerary = () => {
  const [itinerary, setItinerary] = useState({
    title: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    travelers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    days: [],
  });

  const [currentDay, setCurrentDay] = useState(1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const addDay = () => {
    const newDay = {
      dayNumber: currentDay,
      date: new Date(Date.now() + (currentDay - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: `Day ${currentDay}`,
      description: '',
      activities: [],
      meals: [],
      accommodation: null,
      transportation: [],
      estimatedCost: 0,
    };
    
    setItinerary({
      ...itinerary,
      days: [...itinerary.days, newDay],
    });
    setCurrentDay(currentDay + 1);
  };

  const updateDay = (dayIndex, field, value) => {
    const updatedDays = [...itinerary.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setItinerary({ ...itinerary, days: updatedDays });
  };

  const addActivity = (dayIndex) => {
    const updatedDays = [...itinerary.days];
    updatedDays[dayIndex].activities.push({
      name: '',
      description: '',
      time: '',
      duration: '',
      cost: 0,
      location: '',
    });
    setItinerary({ ...itinerary, days: updatedDays });
  };

  const updateActivity = (dayIndex, activityIndex, field, value) => {
    const updatedDays = [...itinerary.days];
    updatedDays[dayIndex].activities[activityIndex] = {
      ...updatedDays[dayIndex].activities[activityIndex],
      [field]: value,
    };
    setItinerary({ ...itinerary, days: updatedDays });
  };

  const calculateTotalCost = () => {
    return itinerary.days.reduce((total, day) => {
      const dayCost = day.estimatedCost || 0;
      const activitiesCost = day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
      return total + dayCost + activitiesCost;
    }, 0);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!itinerary.title.trim()) {
        toast.error('Please enter a trip title');
        return;
      }
      if (!itinerary.destination.trim()) {
        toast.error('Please enter a destination');
        return;
      }
      if (!itinerary.startDate || !itinerary.endDate) {
        toast.error('Please select both start and end dates');
        return;
      }
      if (itinerary.days.length === 0) {
        toast.error('Please add at least one day to your itinerary');
        return;
      }

      setLoading(true);
      
      await tourAPI.createCustomItinerary(itinerary);
      
      toast.success('Itinerary saved successfully!');
      setTimeout(() => {
        navigate('/my-itineraries');
      }, 1500);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      toast.error(error.response?.data?.message || 'Failed to save itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // In a real app, you would implement sharing functionality
    console.log('Sharing itinerary:', itinerary);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Custom Itinerary</h1>
          <p className="text-lg text-gray-600">
            Plan your perfect trip with our custom itinerary builder
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Basic Info */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={itinerary.title}
                    onChange={(e) => setItinerary({ ...itinerary, title: e.target.value })}
                    className="input w-full"
                    placeholder="Enter trip title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={itinerary.destination}
                    onChange={(e) => setItinerary({ ...itinerary, destination: e.target.value })}
                    className="input w-full"
                    placeholder="Enter destination"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={itinerary.country}
                    onChange={(e) => setItinerary({ ...itinerary, country: e.target.value })}
                    className="input w-full"
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={itinerary.startDate}
                    onChange={(e) => setItinerary({ ...itinerary, startDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={itinerary.endDate}
                    onChange={(e) => setItinerary({ ...itinerary, endDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-6">
              {itinerary.days.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {day.dayNumber}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day Title
                      </label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                        className="input w-full"
                        placeholder="Enter day title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={day.description}
                        onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                        className="input w-full"
                        rows={3}
                        placeholder="Describe your day"
                      />
                    </div>

                    {/* Activities */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Activities
                        </label>
                        <button
                          onClick={() => addActivity(dayIndex)}
                          className="btn btn-outline btn-sm flex items-center"
                        >
                          <FiPlus className="w-4 h-4 mr-1" />
                          Add Activity
                        </button>
                      </div>
                      
                      {day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="border rounded-lg p-4 mb-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <input
                                type="text"
                                value={activity.name}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'name', e.target.value)}
                                className="input w-full"
                                placeholder="Activity name"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={activity.location}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'location', e.target.value)}
                                className="input w-full"
                                placeholder="Location"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={activity.time}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                                className="input w-full"
                                placeholder="Time (e.g., 9:00 AM)"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                value={activity.cost}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'cost', parseFloat(e.target.value) || 0)}
                                className="input w-full"
                                placeholder="Cost"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add Day Button */}
              <button
                onClick={addDay}
                className="btn btn-outline btn-lg w-full flex items-center justify-center"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Add Day
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Trip Summary */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    <span>{itinerary.destination || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>{itinerary.days.length} days</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiUsers className="w-4 h-4 mr-2" />
                    <span>{itinerary.travelers.adults + itinerary.travelers.children} travelers</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiDollarSign className="w-4 h-4 mr-2" />
                    <span>${calculateTotalCost().toFixed(2)} estimated</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Itinerary'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="btn btn-outline w-full flex items-center justify-center"
                  >
                    <FiShare2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomItinerary;
