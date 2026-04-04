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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="space-y-4">
          {/* Professional Header - Compact */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <FiBell className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">Notifications</h1>
                  {unreadCount > 0 && (
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">
                        {unreadCount} unread
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${unreadCount > 0
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                >
                  <FiCheckCircle size={14} />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <FiBell size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-500">Total</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{pagination.total}</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                  <FiClock size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-500">Unread</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{unreadCount}</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <FiCheckCircle size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-500">Read</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{notifications.length - unreadCount}</p>
            </div>
          </div>

          {/* Compact Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
             <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Search codes, names..."
                  />
                </div>

                <div className="w-full md:w-48">
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors flex items-center space-x-1.5 whitespace-nowrap"
                >
                  <FiRefreshCw size={14} />
                  <span>Reset</span>
                </button>
                
                <div className="hidden md:block h-6 w-px bg-slate-200 mx-1"></div>
                
                <p className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                  Showing {filteredNotifications.length} of {pagination.total}
                </p>
             </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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