import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUsers,
  FaPlus,
  FaList,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaEye,
  FaUserShield,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFilter,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartBar,
  FaUserTie,
  FaUserCheck,
  FaUserCog,
  FaSearch
} from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const UserManagementPage = () => {
  const styles = useThemeStyles();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'BENEFICIARY',
    district_id: '',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const [filter, setFilter] = useState({
    role: 'ALL',
    district: 'ALL',
    status: 'ALL',
    search: ''
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    roleStats: [],
    districtStats: []
  });

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');

      const [usersRes, districtsRes] = await Promise.all([
        axios.get(`${baseUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      // Handle different response formats
      const userData = usersRes.data.data || usersRes.data.users || usersRes.data || [];
      const districtData = districtsRes.data.data || districtsRes.data || [];

      setUsers(Array.isArray(userData) ? userData : []);
      setDistricts(Array.isArray(districtData) ? districtData : []);

      // Calculate dashboard statistics
      calculateStats(userData);

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      setUsers([]);
      setDistricts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (userData) => {
    const stats = {
      totalUsers: userData.length,
      activeUsers: userData.filter(u => u.status === 'active').length,
      inactiveUsers: userData.filter(u => u.status === 'inactive').length,
      roleStats: [],
      districtStats: []
    };

    // Calculate role statistics
    const roleMap = {};
    userData.forEach(user => {
      const role = user.role || 'UNKNOWN';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });

    stats.roleStats = Object.entries(roleMap)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate district statistics
    const districtMap = {};
    userData.forEach(user => {
      if (user.district_id) {
        const district = districts.find(d => d.district_id === user.district_id);
        const districtName = district?.district_name || 'Unknown District';
        districtMap[districtName] = (districtMap[districtName] || 0) + 1;
      }
    });

    stats.districtStats = Object.entries(districtMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setDashboardStats(stats);
  };

  // Filter users
  const filterUsers = () => {
    let filtered = users;

    if (filter.role !== 'ALL') {
      filtered = filtered.filter(u => u.role === filter.role);
    }

    if (filter.district !== 'ALL') {
      filtered = filtered.filter(u => u.district_id?.toString() === filter.district);
    }

    if (filter.status !== 'ALL') {
      filtered = filtered.filter(u => u.status === filter.status);
    }

    if (filter.search) {
      filtered = filtered.filter(u =>
        u.username?.toLowerCase().includes(filter.search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        u.email?.toLowerCase().includes(filter.search.toLowerCase()) ||
        u.phone?.includes(filter.search)
      );
    }

    setFilteredUsers(filtered);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter users when filter changes
  useEffect(() => {
    filterUsers();
  }, [users, filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

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
      setSuccess('User created successfully!');
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        role: 'BENEFICIARY',
        district_id: '',
        status: 'active',
      });
      fetchData(); // Refresh data
      setActiveTab('list');
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
      phone: user.phone || '',
      role: user.role,
      district_id: user.district_id || '',
      status: user.status || 'active',
    });
    setActiveTab('create');
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdateLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${baseUrl}/api/users/${editingUser}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User updated successfully!');
      setEditingUser(null);
      setEditFormData({});
      fetchData(); // Refresh data
      setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setDeletingId(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('User deleted successfully!');
      fetchData();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({});
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'BENEFICIARY',
      district_id: '',
      status: 'active',
    });
    setError('');
    setSuccess('');
  };

  // Get district name by ID
  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.district_id === districtId);
    return district ? district.district_name : 'N/A';
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      CMO: 'bg-blue-100 text-blue-800',
      SDM: 'bg-green-100 text-green-800',
      DM: 'bg-purple-100 text-purple-800',
      SERVICE_PROVIDER: 'bg-orange-100 text-orange-800',
      BENEFICIARY: 'bg-gray-100 text-gray-800',
      HOSPITAL: 'bg-pink-100 text-pink-800',
      SUPPORT: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Get status color
  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  // Chart data
  const roleChartData = {
    labels: dashboardStats.roleStats.map(r => r.role),
    datasets: [
      {
        label: 'Users by Role',
        data: dashboardStats.roleStats.map(r => r.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red for ADMIN
          'rgba(59, 130, 246, 0.8)',  // Blue for CMO
          'rgba(16, 185, 129, 0.8)',  // Green for SDM
          'rgba(139, 92, 246, 0.8)',  // Purple for DM
          'rgba(245, 158, 11, 0.8)',  // Orange for SERVICE_PROVIDER
          'rgba(107, 114, 128, 0.8)', // Gray for BENEFICIARY
          'rgba(236, 72, 153, 0.8)',  // Pink for HOSPITAL
          'rgba(251, 191, 36, 0.8)',  // Yellow for SUPPORT
        ],
        borderColor: [
          '#DC2626', '#2563EB', '#059669', '#7C3AED',
          '#D97706', '#374151', '#DB2777', '#F59E0B',
        ],
        borderWidth: 1,
      },
    ],
  };

  const districtChartData = {
    labels: dashboardStats.districtStats.slice(0, 5).map(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name),
    datasets: [
      {
        data: dashboardStats.districtStats.slice(0, 5).map(d => d.count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
        ],
        borderColor: [
          '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse">
            <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>
              ))}
            </div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaUsers className="mr-3 text-blue-600" />
                User Management
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>
                Manage system users, roles, and permissions
              </p>
            </div>
           
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaList className="inline mr-2" />
              User List ({filteredUsers.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                if (editingUser) handleCancelEdit();
              }}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaPlus className="inline mr-2" />
              {editingUser ? 'Edit User' : 'Add User'}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : `${styles.secondaryText} hover:${styles.primaryText} hover:bg-gray-100`
                }`}
            >
              <FaChartBar className="inline mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>


  
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold">{dashboardStats.totalUsers}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaUsers className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold">{dashboardStats.activeUsers}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaUserCheck className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Inactive Users</p>
              <p className="text-3xl font-bold">{dashboardStats.inactiveUsers}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <FaTimes className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Role Distribution Chart */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
                <FaUserTie className="mr-2 text-blue-600" />
                Users by Role
              </h2>
            </div>
            <div className="h-64">
              <Bar
                data={roleChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* District Distribution Chart */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center`}>
                <FaMapMarkerAlt className="mr-2 text-green-600" />
                Users by District
              </h2>
            </div>
            <div className="h-64">
              <Doughnut
                data={districtChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
            <div className="flex items-center mb-4">
              <FaFilter className={`mr-2 ${styles.secondaryText}`} />
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>Filters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Role</label>
                <select
                  name="role"
                  value={filter.role}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All Roles</option>
                  {['ADMIN', 'CMO', 'SDM', 'DM', 'SERVICE_PROVIDER', 'BENEFICIARY', 'HOSPITAL', 'SUPPORT'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>District</label>
                <select
                  name="district"
                  value={filter.district}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All Districts</option>
                  {districts.map(district => (
                    <option key={district.district_id} value={district.district_id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Status</label>
                <select
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                >
                  <option value="ALL">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search</label>
                <input
                  type="text"
                  name="search"
                  value={filter.search}
                  onChange={handleFilterChange}
                  placeholder="Search users..."
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                />
              </div>
            </div>
          </div>

          {/* User List */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
            <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
                User List ({filteredUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {filteredUsers.length === 0 ? (
                <div className={`p-8 text-center ${styles.secondaryText}`}>
                  <FaUsers className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No users found matching the current filters.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        User Info
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Contact
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Role
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        District
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id} className={styles.tableRow}>
                        <td className={`px-6 py-4 whitespace-nowrap ${styles.primaryText}`}>
                          <div className="flex items-center">
                            <FaUserShield className="text-blue-500 mr-3" />
                            <div>
                              <div className="text-sm font-medium">
                                {user.full_name}
                              </div>
                              <div className={`text-sm ${styles.secondaryText}`}>
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          <div className="space-y-1">
                            {user.email && (
                              <div className="flex items-center">
                                <FaEnvelope className="text-gray-400 mr-2" />
                                {user.email}
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center">
                                <FaUsers className="text-gray-400 mr-2" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-gray-400 mr-2" />
                            {getDistrictName(user.district_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEdit className="inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.user_id)}
                              disabled={deletingId === user.user_id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              <FaTrash className="inline mr-1" />
                              {deletingId === user.user_id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'create' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={editingUser ? handleUpdateUser : handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editingUser ? editFormData.username : formData.username}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    required
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter username"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                      placeholder="Enter password"
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={editingUser ? editFormData.full_name : formData.full_name}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    required
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editingUser ? editFormData.email : formData.email}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={editingUser ? editFormData.phone : formData.phone}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Role *
                  </label>
                  <select
                    name="role"
                    value={editingUser ? editFormData.role : formData.role}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    required
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                  >
                    {['BENEFICIARY', 'CMO', 'SDM', 'DM', 'ADMIN', 'SERVICE_PROVIDER', 'HOSPITAL', 'SUPPORT'].map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    District
                  </label>
                  <select
                    name="district_id"
                    value={editingUser ? editFormData.district_id : formData.district_id}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.district_id} value={district.district_id}>
                        {district.district_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={editingUser ? editFormData.status : formData.status}
                    onChange={editingUser ? handleEditInputChange : handleInputChange}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {editingUser && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
                  >
                    <FaTimes className="inline mr-2" />
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || updateLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <FaSave className="inline mr-2" />
                  {loading || updateLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;