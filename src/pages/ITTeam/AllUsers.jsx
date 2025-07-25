import React, { useState, useEffect } from 'react';
import {
    FaUsers,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye,
    FaPlus,
    FaDownload,
    FaUserShield,
    FaUserTimes,
    FaUserCheck,
    FaExclamationTriangle,
    FaSyncAlt,
    FaKey,
    FaLock,
    FaUnlock,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaEnvelope,
    FaPhone,
    FaIdCard
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const AllUsers = () => {
    const styles = useThemeStyles();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDistrict, setSelectedDistrict] = useState('ALL');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(20);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const roles = [
        'BENEFICIARY', 'CMO', 'SDM', 'DM', 'SERVICE_PROVIDER',
        'ADMIN', 'HOSPITAL', 'SUPPORT'
    ];

    const statuses = ['active', 'inactive', 'suspended'];

    // Fetch users data
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const [usersRes, districtsRes] = await Promise.all([
                fetch(`${baseUrl}/api/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${baseUrl}/api/districts`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (!usersRes.ok) throw new Error('Failed to fetch users');
            if (!districtsRes.ok) throw new Error('Failed to fetch districts');

            const [usersData, districtsData] = await Promise.all([
                usersRes.json(),
                districtsRes.json()
            ]);

            const usersList = usersData.data || [];
            const districtsList = districtsData.data || [];

            setUsers(usersList);
            setDistricts(districtsList);
            setError('');
        } catch (err) {
            console.error('Users fetch error:', err);
            setError('Failed to load users: ' + err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Filter and sort users
    useEffect(() => {
        let filtered = users.filter(user => {
            const matchesSearch =
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.includes(searchTerm);

            const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
            const matchesStatus = selectedStatus === 'ALL' || user.status === selectedStatus;
            const matchesDistrict = selectedDistrict === 'ALL' || user.district_id?.toString() === selectedDistrict;

            return matchesSearch && matchesRole && matchesStatus && matchesDistrict;
        });

        // Sort users
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'created_at' || sortBy === 'updated_at') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [users, searchTerm, selectedRole, selectedStatus, selectedDistrict, sortBy, sortOrder]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSelectAll = () => {
        const currentPageUsers = getCurrentPageUsers().map(user => user.user_id);
        if (selectedUsers.length === currentPageUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentPageUsers);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete user');

            await fetchUsers();
        } catch (err) {
            console.error('Delete user error:', err);
            setError('Failed to delete user: ' + err.message);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/api/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update user status');

            await fetchUsers();
        } catch (err) {
            console.error('Status change error:', err);
            setError('Failed to update user status: ' + err.message);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s password?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/api/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to reset password');

            const data = await response.json();
            alert(`Password reset successfully. New password: ${data.newPassword}`);
        } catch (err) {
            console.error('Password reset error:', err);
            setError('Failed to reset password: ' + err.message);
        }
    };

    const getCurrentPageUsers = () => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    };

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const getStatusColor = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getRoleColor = (role) => {
        const colors = {
            BENEFICIARY: 'bg-blue-100 text-blue-800',
            CMO: 'bg-green-100 text-green-800',
            SDM: 'bg-yellow-100 text-yellow-800',
            DM: 'bg-purple-100 text-purple-800',
            SERVICE_PROVIDER: 'bg-orange-100 text-orange-800',
            ADMIN: 'bg-red-100 text-red-800',
            HOSPITAL: 'bg-pink-100 text-pink-800',
            SUPPORT: 'bg-indigo-100 text-indigo-800',

        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDistrictName = (districtId) => {
        const district = districts.find(d => d.district_id === districtId);
        return district ? district.district_name : 'Unknown';
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
                    <div className="animate-pulse">
                        <div className={`h-8 ${styles.loadingShimmer} rounded mb-6`}></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`h-16 ${styles.loadingShimmer} rounded`}></div>
                            ))}
                        </div>
                    </div>
                    <p className={`text-center ${styles.secondaryText} mt-4`}>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`max-w-6xl mx-auto p-6 ${styles.pageBackground}`}>
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
                                Manage all system users with full administrative access
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                <FaPlus className="mr-2" />
                                Add User
                            </button>
                            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                                <FaDownload className="mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${styles.secondaryText} text-sm font-medium`}>Total Users</p>
                            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                        </div>
                        <div className="bg-blue-100 rounded-full p-3">
                            <FaUsers className="text-blue-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${styles.secondaryText} text-sm font-medium`}>Active Users</p>
                            <p className="text-2xl font-bold text-green-600">
                                {users.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                        <div className="bg-green-100 rounded-full p-3">
                            <FaUserCheck className="text-green-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${styles.secondaryText} text-sm font-medium`}>Suspended Users</p>
                            <p className="text-2xl font-bold text-red-600">
                                {users.filter(u => u.status === 'suspended').length}
                            </p>
                        </div>
                        <div className="bg-red-100 rounded-full p-3">
                            <FaUserTimes className="text-red-600 text-xl" />
                        </div>
                    </div>
                </div>

                <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${styles.secondaryText} text-sm font-medium`}>Admin Users</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {users.filter(u => ['ADMIN', 'SUPPORT'].includes(u.role)).length}
                            </p>
                        </div>
                        <div className="bg-purple-100 rounded-full p-3">
                            <FaUserShield className="text-purple-600 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search Users</label>
                        <div className="relative">
                            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${styles.secondaryText}`} />
                            <input
                                type="text"
                                placeholder="Search by name, username, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        >
                            <option value="ALL">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        >
                            <option value="ALL">All Status</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>District</label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
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
                        <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Sort By</label>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${styles.inputBackground}`}
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="full_name-asc">Name A-Z</option>
                            <option value="full_name-desc">Name Z-A</option>
                            <option value="role-asc">Role A-Z</option>
                            <option value="status-asc">Status</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-4 mb-6`}>
                    <div className="flex items-center justify-between">
                        <span className={`${styles.primaryText} font-medium`}>
                            {selectedUsers.length} user(s) selected
                        </span>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
                                Activate
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
                                Suspend
                            </button>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
                <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-xl font-semibold ${styles.primaryText}`}>
                            Users ({filteredUsers.length})
                        </h2>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={selectedUsers.length === getCurrentPageUsers().length && getCurrentPageUsers().length > 0}
                                onChange={handleSelectAll}
                                className="rounded"
                            />
                            <span className={`text-sm ${styles.secondaryText}`}>Select All</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {getCurrentPageUsers().length === 0 ? (
                        <div className={`p-8 text-center ${styles.secondaryText}`}>
                            <FaUsers className="mx-auto text-4xl mb-4 text-gray-300" />
                            <p>No users found matching the current filters.</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        Select
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        User Details
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        Role & Status
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        Contact Info
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        District
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        Created Date
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                                {getCurrentPageUsers().map((user) => (
                                    <tr key={user.user_id} className={styles.tableRow}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.user_id)}
                                                onChange={() => handleUserSelect(user.user_id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <FaIdCard className="text-gray-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className={`text-sm font-medium ${styles.primaryText}`}>
                                                        {user.full_name}
                                                    </div>
                                                    <div className={`text-sm ${styles.secondaryText}`}>
                                                        @{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                                <br />
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm ${styles.primaryText}`}>
                                                <div className="flex items-center mb-1">
                                                    <FaEnvelope className="mr-2 text-gray-400" />
                                                    {user.email || 'N/A'}
                                                </div>
                                                <div className="flex items-center">
                                                    <FaPhone className="mr-2 text-gray-400" />
                                                    {user.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                                <span className={`text-sm ${styles.primaryText}`}>
                                                    {user.district_id ? getDistrictName(user.district_id) : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="mr-2 text-gray-400" />
                                                <span className={`text-sm ${styles.secondaryText}`}>
                                                    {formatDate(user.created_at)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="text-blue-600 hover:text-blue-900 transition"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="text-green-600 hover:text-green-900 transition"
                                                    title="Edit User"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user.user_id)}
                                                    className="text-yellow-600 hover:text-yellow-900 transition"
                                                    title="Reset Password"
                                                >
                                                    <FaKey />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(
                                                        user.user_id,
                                                        user.status === 'active' ? 'suspended' : 'active'
                                                    )}
                                                    className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition`}
                                                    title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                                                >
                                                    {user.status === 'active' ? <FaLock /> : <FaUnlock />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                    className="text-red-600 hover:text-red-900 transition"
                                                    title="Delete User"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={`px-6 py-4 border-t ${styles.borderColor}`}>
                        <div className="flex items-center justify-between">
                            <div className={`text-sm ${styles.secondaryText}`}>
                                Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                >
                                    Previous
                                </button>
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 border rounded-md transition ${currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllUsers;