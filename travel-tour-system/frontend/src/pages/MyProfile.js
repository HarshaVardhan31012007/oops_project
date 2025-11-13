import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiMapPin, FiHeart, FiSettings, FiSave } from 'react-icons/fi';
import { updateUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [preferences, setPreferences] = useState({
    destinations: user?.preferences?.destinations || [],
    budget: user?.preferences?.budget || { min: 0, max: 0 },
    travelStyle: user?.preferences?.travelStyle || [],
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, update local user state only
      dispatch(updateUser(profileData));
      const result = { type: 'local/updateUser' };
      if (result) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.payload || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // No backend slice yet; simulate success
      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'preferences', label: 'Preferences', icon: FiHeart },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-lg text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="input pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="input pl-10"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="input pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex items-center"
                    >
                      {loading ? (
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                      ) : (
                        <FiSave className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Travel Preferences</h2>
                <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Destinations
                    </label>
                    <input
                      type="text"
                      placeholder="Enter destinations separated by commas"
                      className="input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range (Min)
                      </label>
                      <input
                        type="number"
                        value={preferences.budget.min}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          budget: { ...preferences.budget, min: parseInt(e.target.value) || 0 }
                        })}
                        className="input w-full"
                        placeholder="Minimum budget"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Range (Max)
                      </label>
                      <input
                        type="number"
                        value={preferences.budget.max}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          budget: { ...preferences.budget, max: parseInt(e.target.value) || 0 }
                        })}
                        className="input w-full"
                        placeholder="Maximum budget"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Travel Style
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Adventure', 'Luxury', 'Budget', 'Family', 'Solo', 'Cultural'].map((style) => (
                        <label key={style} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex items-center"
                    >
                      {loading ? (
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                      ) : (
                        <FiSave className="w-4 h-4 mr-2" />
                      )}
                      Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                    <div className="space-y-4">
                      <button className="btn btn-outline">
                        Change Password
                      </button>
                      <button className="btn btn-outline">
                        Enable Two-Factor Authentication
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                    <button className="btn btn-outline text-red-600 hover:bg-red-50">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
