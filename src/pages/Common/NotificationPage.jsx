import React, { useState, useEffect } from 'react';
import {
  FiBell,
  FiRefreshCw,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiClock,
  FiUser,
  FiFileText,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import baseUrl from '../../baseUrl/baseUrl';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (filter === 'unread') {
        params.append('unread_only', 'true');
      }

      const response = await fetch(`${baseUrl}/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0
        }));
      } else {
        console.error('Failed to fetch notifications');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchNotifications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchNotifications(); // Refresh the list
        alert('All notifications marked as read!');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchNotifications(); // Refresh the list
        alert('Notification deleted successfully!');
      } else {
        alert('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ENQUIRY':
        return <FiFileText className="text-blue-600" size={16} />;
      case 'USER':
        return <FiUser className="text-green-600" size={16} />;
      default:
        return <FiBell className="text-gray-600" size={16} />;
    }
  };

  const getStatusBadge = (isRead) => {
    return isRead ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center space-x-1">
        <FiCheckCircle size={12} />
        <span>Read</span>
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
        <FiClock size={12} />
        <span>Unread</span>
      </span>
    );
  };

  const filteredNotifications = notifications.filter(notification =>
    !searchTerm ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.enquiry?.enquiry_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.enquiry?.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <div className="flex items-center justify-center">
          {getNotificationIcon(value)}
        </div>
      )
    },
    {
      key: 'message',
      label: 'Message',
      render: (value, row) => (
        <div>
          <p className={`text-sm ${!row.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {value}
          </p>
          {row.enquiry && (
            <div className="mt-1 text-xs text-gray-600 bg-gray-100 rounded px-2 py-1 inline-block">
              Enquiry: {row.enquiry.enquiry_code} - {row.enquiry.patient_name}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'is_read',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
          <br />
          <span className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          {!row.is_read && (
            <button
              onClick={() => markAsRead(row.notification_id)}
              className="text-blue-600 hover:text-blue-800"
              title="Mark as read"
            >
              <FiCheck size={16} />
            </button>
          )}
          <button
            onClick={() => deleteNotification(row.notification_id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Professional Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiBell className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                  <p className="text-slate-600 mt-1">Stay updated with system alerts and messages</p>
                  {unreadCount > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600 font-medium">
                        {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${unreadCount > 0
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                >
                  <FiCheckCircle size={16} />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Professional Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FiFilter className="text-slate-600" size={16} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Filter & Search</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Notifications
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search messages, enquiry codes..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="all">📋 All Notifications</option>
                  <option value="unread">🔴 Unread Only</option>
                  <option value="read">✅ Read Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <FiRefreshCw size={16} />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Professional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Total Notifications</p>
                  <p className="text-3xl font-bold text-blue-900">{pagination.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FiBell className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">Unread</p>
                  <p className="text-3xl font-bold text-amber-900">{unreadCount}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FiClock className="text-white" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">Read</p>
                  <p className="text-3xl font-bold text-emerald-900">{notifications.length - unreadCount}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="text-white" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredNotifications.length}</span> of <span className="font-semibold text-slate-900">{pagination.total}</span> notifications
              </p>
              {searchTerm && (
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>Search results for:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">"{searchTerm}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Notifications Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Notification History</h3>
            </div>
            <ThemeTable
              data={filteredNotifications}
              columns={columns}
              loading={loading}
              emptyMessage={
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBell className="text-slate-400" size={24} />
                  </div>
                  <h4 className="text-slate-600 font-medium mb-2">No notifications found</h4>
                  <p className="text-slate-400 text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'New notifications will appear here'}
                  </p>
                </div>
              }
            />
          </div>

          {/* Professional Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;