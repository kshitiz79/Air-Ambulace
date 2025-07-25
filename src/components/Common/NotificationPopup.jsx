import React, { useState, useEffect, useRef } from 'react';
import {
  FiBell,
  FiX,
  FiEye,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiFileText
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';

const NotificationPopup = ({ isOpen, onClose, onViewAll }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const popupRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/notifications?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);

        // Count unread notifications
        const unread = (data.data || []).filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notificationId
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
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
        // Update local state
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 z-50 mt-2">
      <div
        ref={popupRef}
        className="bg-white rounded-xl shadow-2xl border border-gray-100 w-96 max-h-[85vh] overflow-hidden transform transition-all duration-200 ease-out"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiBell className="text-white" size={16} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-slate-300 text-xs">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-600"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`text-sm flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all ${unreadCount > 0
                ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                : 'text-slate-400 cursor-not-allowed'
                }`}
            >
              <FiCheckCircle size={14} />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onViewAll}
              className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all"
            >
              View all →
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="text-slate-500 mt-3 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="text-slate-400" size={24} />
              </div>
              <h4 className="text-slate-600 font-medium mb-1">No notifications yet</h4>
              <p className="text-slate-400 text-sm">You'll see new notifications here</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={notification.notification_id}
                  className={`relative px-5 py-4 transition-all duration-200 ${!notification.is_read
                    ? 'bg-blue-50 border-l-4 border-l-blue-500 hover:bg-blue-100'
                    : 'hover:bg-slate-50'
                    } ${index !== notifications.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${!notification.is_read ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className={`text-sm leading-relaxed ${!notification.is_read ? 'font-medium text-slate-900' : 'text-slate-700'
                          }`}>
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 ml-2"></div>
                        )}
                      </div>

                      {/* Enquiry Badge */}
                      {notification.enquiry && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          <FiFileText size={10} className="mr-1" />
                          {notification.enquiry.enquiry_code} - {notification.enquiry.patient_name}
                        </div>
                      )}

                      {/* Time and Actions */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <FiClock size={11} />
                          <span>{formatTimeAgo(notification.created_at)}</span>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.notification_id)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-all"
                          >
                            <FiCheck size={11} />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={onViewAll}
              className="w-full text-center text-sm text-slate-700 hover:text-slate-900 font-medium py-2 px-4 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
            >
              <span>View All Notifications</span>
              <FiEye size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;