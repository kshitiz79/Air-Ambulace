import React from 'react';
import { FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';

const AccountDetails = ({ user, getRoleBadgeColor, formatDate }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaShieldAlt className="mr-2 text-purple-600" />
          Account Details
        </h2>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
            {user.role?.toUpperCase() || 'USER'}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <p className="text-gray-900">{user.district_name || 'Not assigned'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.status?.toUpperCase() || 'ACTIVE'}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaCalendarAlt className="inline mr-1" />
            Member Since
          </label>
          <p className="text-gray-900 text-sm">{formatDate(user.created_at)}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
          <p className="text-gray-900 text-sm">{formatDate(user.updated_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;