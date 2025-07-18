import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiFileText,
  FiHome,
  FiPhone,
  FiMail,
  FiClipboard,
  FiCheckCircle,
  FiArrowRightCircle,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCalendar,
  FiMapPin,
  FiActivity,
  FiAlertCircle,
  FiClock
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';

// Define badge styles for different statuses
const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  FORWARDED: 'bg-purple-100 text-purple-800',
  ESCALATED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-teal-100 text-teal-800',
};

export const EnquiryListPage = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/enquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || 'Error fetching');
      setEnquiries(payload.data || []);
      setFilteredEnquiries(payload.data || []);
    } catch (err) {
      setError('Could not load enquiries: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    let filtered = enquiries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(enquiry =>
        enquiry.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.enquiry_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.medical_condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.contact_phone?.includes(searchTerm) ||
        enquiry.ayushman_card_number?.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(enquiry => enquiry.status === statusFilter);
    }

    setFilteredEnquiries(filtered);
  }, [enquiries, searchTerm, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEnquiries();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FiClock className="h-4 w-4" />;
      case 'APPROVED': return <FiCheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <FiAlertCircle className="h-4 w-4" />;
      case 'FORWARDED': return <FiArrowRightCircle className="h-4 w-4" />;
      case 'ESCALATED': return <FiAlertCircle className="h-4 w-4" />;
      default: return <FiActivity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (status) => {
    switch (status) {
      case 'ESCALATED': return 'border-l-red-500';
      case 'PENDING': return 'border-l-yellow-500';
      case 'APPROVED': return 'border-l-green-500';
      case 'REJECTED': return 'border-l-red-400';
      case 'FORWARDED': return 'border-l-purple-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enquiry Management</h1>
              <p className="text-gray-600 mt-1">Review and manage patient enquiries</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by patient name, enquiry code, condition, phone, or Ayushman card..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="FORWARDED">Forwarded</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Statistics Dashboard */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Enquiry Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(statusStyles).map(([status, style]) => {
                const count = enquiries.filter(e => e.status === status).length;
                if (count === 0) return null; // Only show statuses that have enquiries
                return (
                  <div key={status} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${style} mb-2`}>
                      {getStatusIcon(status)}
                      <span>{count}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium capitalize">{status.toLowerCase().replace('_', ' ')}</p>
                  </div>
                );
              })}
            </div>
            {enquiries.length > 0 && (
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-gray-700">{enquiries.length}</span> enquiries
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading enquiries...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEnquiries.length === 0 && !error && (
          <div className="text-center py-12">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No enquiries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No enquiries have been submitted yet.'}
            </p>
          </div>
        )}

        {/* Enquiries Grid */}
        {!loading && filteredEnquiries.length > 0 && (
          <div className="grid gap-6">
            {filteredEnquiries.map((enquiry) => (
              <div
                key={enquiry.enquiry_id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 ${getPriorityColor(enquiry.status)}`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <FiUser className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{enquiry.patient_name}</h3>
                        <p className="text-sm text-gray-500">Enquiry #{enquiry.enquiry_code || enquiry.enquiry_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusStyles[enquiry.status] || 'bg-gray-100 text-gray-800'}`}>
                        {getStatusIcon(enquiry.status)}
                        {enquiry.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <FiActivity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Medical Condition</p>
                        <p className="text-sm text-gray-600">{enquiry.medical_condition || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiHome className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Destination Hospital</p>
                        <p className="text-sm text-gray-600">{enquiry.hospital?.name || 'Not assigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">District</p>
                        <p className="text-sm text-gray-600">{enquiry.district?.district_name || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact</p>
                        <p className="text-sm text-gray-600">{enquiry.contact_phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiClipboard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Ayushman Card</p>
                        <p className="text-sm text-gray-600">{enquiry.ayushman_card_number || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Contact Person</p>
                        <p className="text-sm text-gray-600">{enquiry.contact_name || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/sdm-dashboard/enquiry-detail-page/${enquiry.enquiry_id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                      <FiArrowRightCircle className="h-4 w-4" />
                      View Details
                    </Link>
                    
                    {enquiry.status === 'PENDING' && (
                      <Link
                        to={`/sdm-dashboard/enquiry-detail-page/query-to-cmo/${enquiry.enquiry_id}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition shadow-md"
                      >
                        <FiClipboard className="h-4 w-4" />
                        Query CMO
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredEnquiries.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredEnquiries.length} of {enquiries.length} enquiries
            {(searchTerm || statusFilter !== 'ALL') && ' (filtered)'}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryListPage;