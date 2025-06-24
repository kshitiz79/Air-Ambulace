import React, { useState, useEffect } from 'react';

// Dummy data
const dummyDistricts = [
  { district_id: '1', name: 'District 1' },
  { district_id: '2', name: 'District 2' },
  { district_id: '3', name: 'District 3' },
];

const dummyUsers = [
  {
    user_id: 1,
    username: 'admin1',
    full_name: 'Admin User',
    email: 'admin1@example.com',
    phone: '1234567890',
    role: 'ADMIN',
    district_id: '1',
    district: { district_id: '1', name: 'District 1' },
  },
  {
    user_id: 2,
    username: 'cmo1',
    full_name: 'CMO User',
    email: 'cmo1@example.com',
    phone: '0987654321',
    role: 'CMOUSER',
    district_id: '2',
    district: { district_id: '2', name: 'District 2' },
  },
  {
    user_id: 3,
    username: 'beneficiary1',
    full_name: 'Beneficiary User',
    email: 'beneficiary1@example.com',
    phone: '1122334455',
    role: 'BENEFICIARY',
    district_id: null,
    district: null,
  },
];

const PermissionsManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'BENEFICIARY',
    full_name: '',
    email: '',
    phone: '',
    district_id: '',
  });
  const [editFormData, setEditFormData] = useState({ user_id: null, role: '', district_id: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Initialize with dummy data
  useEffect(() => {
    setLoading(true);
    setDistricts(dummyDistricts);
    setUsers(dummyUsers);
    setLoading(false);
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.username || !formData.password || !formData.role || !formData.full_name) {
      return 'Username, password, role, and full name are required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Invalid email';
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      return 'Phone must be 10 digits';
    }
    return null;
  };

  // Create user
  const handleCreateUser = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    const newUser = {
      user_id: users.length + 1,
      username: formData.username,
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      role: formData.role,
      district_id: formData.district_id || null,
      district: formData.district_id
        ? districts.find((d) => d.district_id === formData.district_id)
        : null,
    };
    setUsers([...users, newUser]);
    setSuccess('User created successfully');
    setFormData({
      username: '',
      password: '',
      role: 'BENEFICIARY',
      full_name: '',
      email: '',
      phone: '',
      district_id: '',
    });
  };

  // Open edit modal
  const openEditModal = (user) => {
    setEditFormData({
      user_id: user.user_id,
      role: user.role,
      district_id: user.district_id || '',
    });
    setShowEditModal(true);
  };

  // Update user
  const handleUpdateUser = (e) => {
    e.preventDefault();
    setError('');
    setUsers(
      users.map((user) =>
        user.user_id === editFormData.user_id
          ? {
              ...user,
              role: editFormData.role,
              district_id: editFormData.district_id || null,
              district: editFormData.district_id
                ? districts.find((d) => d.district_id === editFormData.district_id)
                : null,
            }
          : user
      )
    );
    setSuccess('User updated successfully');
    setShowEditModal(false);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Delete user
  const handleDeleteUser = () => {
    setError('');
    setUsers(users.filter((user) => user.user_id !== userToDelete.user_id));
    setSuccess('User deleted successfully');
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      {/* Add User Form */}
    

      {/* Users Table */}
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Manage Users</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 text-sm">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Full Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">District</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.user_id}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.full_name}</td>
                    <td className="p-3">{user.email || '-'}</td>
                    <td className="p-3">{user.phone || '-'}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.district?.name || '-'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label htmlFor="edit_role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  id="edit_role"
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {['BENEFICIARY', 'CMOUSER', 'SDM', 'DM', 'SERVICE_PROVIDER', 'ADMIN', 'HOSPITAL', 'SUPPORT'].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="edit_district_id" className="block text-sm font-medium text-gray-700">District</label>
                <select
                  id="edit_district_id"
                  name="district_id"
                  value={editFormData.district_id}
                  onChange={handleEditChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">No District</option>
                  {districts.map((district) => (
                    <option key={district.district_id} value={district.district_id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete user <strong>{userToDelete?.username}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsManagementPage;