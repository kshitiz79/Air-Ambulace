import React from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaCamera, FaUserCircle } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const ProfileHeader = ({ 
  user, 
  isEditing, 
  saving, 
  onEdit, 
  onSave, 
  onCancel,
  getRoleBadgeColor 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {user.profile_picture ? (
                <img
                  src={`${baseUrl}${user.profile_picture}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-white text-3xl" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition">
                <FaCamera className="text-xs" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                {user.full_name || user.username || 'User Profile'}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role?.toUpperCase() || 'USER'}
                </span>
                <span className="text-sm text-gray-600">
                  ID: {user.user_id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={onEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={onCancel}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;