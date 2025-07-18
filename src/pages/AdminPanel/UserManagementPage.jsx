import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'BENEFICIARY',
    district_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle different response formats
      const userData = response.data.data || response.data.users || response.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
      setUsers([]); // Ensure users is always an array
    }
  };

  // Fetch all districts
  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/districts`);
      // Handle different response formats
      const districtData = response.data.data || response.data || [];
      setDistricts(Array.isArray(districtData) ? districtData : []);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      setError('Failed to fetch districts: ' + (err.response?.data?.error || err.message));
      setDistricts([]); // Ensure districts is always an array
    }
  };

  // Fetch users and districts on component mount
  useEffect(() => {
    fetchUsers();
    fetchDistricts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${baseUrl}/api/auth/create-user`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(response.data.message);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role: 'BENEFICIARY',
        district_id: '',
      });
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user.user_id);
    setEditFormData({
      username: user.username,
      full_name: user.full_name,
      email: user.email || '',
      role: user.role,
      district_id: user.district_id || '',
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Handle update user
  const handleUpdateUser = async (userId) => {
    setError('');
    setSuccess('');
    setUpdateLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${baseUrl}/api/users/${userId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User updated successfully');
      setEditingUser(null);
      setEditFormData({});
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  // Get district name by ID
  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.district_id === districtId);
    return district ? district.district_name : 'N/A';
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Create User Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border rounded-md"
              >
                {['BENEFICIARY', 'CMO', 'SDM', 'DM', 'ADMIN', 'SERVICE_PROVIDER', 'HOSPITAL', 'SUPPORT'].map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">District</label>
              <select
                name="district_id"
                value={formData.district_id}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full border rounded-md"
              >
                <option value="">Select a district</option>
                {districts && districts.length > 0 ? districts.map((district) => (
                  <option key={district.district_id} value={district.district_id}>
                    {district.district_name}
                  </option>
                )) : (
                  <option disabled>No districts available</option>
                )}
              </select>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users && users.length > 0 ? users.map((user) => (
                <tr key={user.user_id}>
                  {editingUser === user.user_id ? (
                    // Edit mode
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="username"
                          value={editFormData.username}
                          onChange={handleEditInputChange}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="full_name"
                          value={editFormData.full_name}
                          onChange={handleEditInputChange}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditInputChange}
                          className="w-full p-2 border rounded-md text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="role"
                          value={editFormData.role}
                          onChange={handleEditInputChange}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          {['BENEFICIARY', 'CMO', 'SDM', 'DM', 'ADMIN', 'SERVICE_PROVIDER', 'HOSPITAL', 'SUPPORT'].map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="district_id"
                          value={editFormData.district_id}
                          onChange={handleEditInputChange}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">Select District</option>
                          {districts.map((district) => (
                            <option key={district.district_id} value={district.district_id}>
                              {district.district_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateUser(user.user_id)}
                            disabled={updateLoading}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {updateLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'CMO' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'SDM' ? 'bg-green-100 text-green-800' :
                          user.role === 'DM' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getDistrictName(user.district_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;