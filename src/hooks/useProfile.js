import { useState, useEffect } from 'react';
import baseUrl from '../baseUrl/baseUrl';

export const useProfile = () => {
  const [user, setUser] = useState({
    user_id: '',
    username: '',
    email: '',
    phone: '',
    full_name: '',
    role: '',
    district_id: '',
    district_name: '',
    address: '',
    created_at: '',
    updated_at: '',
    profile_picture: '',
    status: 'active'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }

        const response = await fetch(`${baseUrl}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        } else {
          throw new Error(data.message || 'Failed to load profile');
        }
        setError('');
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('userId');

      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          phone: user.phone,
          full_name: user.full_name,
          address: user.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
      setError('');
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      const userId = localStorage.getItem('userId');

      const response = await fetch(`${baseUrl}/api/users/${userId}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordChange(false);
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
      setError('');
    } catch (err) {
      console.error('Password change error:', err);
      setError('Failed to change password: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'cmo': 'bg-blue-100 text-blue-800',
      'dm': 'bg-green-100 text-green-800',
      'sdm': 'bg-purple-100 text-purple-800',
      'operator': 'bg-yellow-100 text-yellow-800',
      'user': 'bg-gray-100 text-gray-800'
    };
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordChange(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return {
    user,
    isEditing,
    loading,
    saving,
    error,
    success,
    showPasswordChange,
    passwordData,
    showPasswords,
    setShowPasswordChange,
    handleInputChange,
    handlePasswordChange,
    togglePasswordVisibility,
    handleSaveProfile,
    handleChangePassword,
    handleCancelPasswordChange,
    handleEdit,
    handleCancel,
    formatDate,
    getRoleBadgeColor
  };
};