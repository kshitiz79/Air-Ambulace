// src/hooks/useSearch.jsx
import React, { useState } from 'react';
import axios from 'axios';
import baseUrl from '../baseUrl/baseUrl';

export const useSearch = (userRole = 'SDM') => {
  const [searchCriteria, setSearchCriteria] = useState({
    patient_name: '',
    father_spouse_name: '',
    ayushman_card_number: '',
    aadhar_card_number: '',
    pan_card_number: '',
    contact_email: '',
    contact_phone: '',
    enquiry_code: '',
    status: 'ALL',
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (e) => {
    setSearchCriteria({
      ...searchCriteria,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          queryParams.append(key, value);
        }
      });

      const token = localStorage.getItem('token');
      const endpoint =
        userRole === 'DM'
          ? `${baseUrl}/api/cases/search?${queryParams.toString()}`
          : `${baseUrl}/api/enquiries/search?${queryParams.toString()}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data.data || []);
    } catch (err) {
      console.error('Search error:', err);
      const itemType = userRole === 'DM' ? 'cases' : 'enquiries';
      setError(
        `Failed to search ${itemType}: ${err.response?.data?.message || err.message}`
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchCriteria({
      patient_name: '',
      father_spouse_name: '',
      ayushman_card_number: '',
      aadhar_card_number: '',
      pan_card_number: '',
      contact_email: '',
      contact_phone: '',
      enquiry_code: '',
      status: 'ALL',
    });
    setSearchResults([]);
    setHasSearched(false);
    setError('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      FORWARDED: 'bg-purple-100 text-purple-800',
      ESCALATED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-teal-100 text-teal-800',
      FINANCIAL_APPROVED: 'bg-emerald-100 text-emerald-800',
      ORDER_RELEASED: 'bg-cyan-100 text-cyan-800',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return {
    searchCriteria,
    searchResults,
    loading,
    error,
    hasSearched,
    handleInputChange,
    handleSearch,
    clearSearch,
    formatDate,
    getStatusBadge,
  };
};
