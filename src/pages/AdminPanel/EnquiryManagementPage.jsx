import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const EnquiryManagementPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Fetch all enquiries
  const fetchEnquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const enquiryData = response.data.data || response.data.enquiries || response.data || [];
      setEnquiries(Array.isArray(enquiryData) ? enquiryData : []);
      setFilteredEnquiries(Array.isArray(enquiryData) ? enquiryData : []);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
      setError('Failed to fetch enquiries: ' + (err.response?.data?.message || err.message));
      setEnquiries([]);
      setFilteredEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all districts
  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/districts`);
      const districtData = response.data.data || response.data || [];
      setDistricts(Array.isArray(districtData) ? districtData : []);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    }
  };

  // Filter enquiries based on search term, status, and district
  useEffect(() => {
    let filtered = enquiries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(enquiry =>
        enquiry.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.patient_phone?.includes(searchTerm) ||
        enquiry.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.enquiry_id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(enquiry => enquiry.status === statusFilter);
    }

    // District filter
    if (districtFilter !== 'ALL') {
      filtered = filtered.filter(enquiry => enquiry.district_id?.toString() === districtFilter);
    }

    setFilteredEnquiries(filtered);
  }, [enquiries, searchTerm, statusFilter, districtFilter]);

  // Delete enquiry
  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(enquiryId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/enquiries/${enquiryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from local state
      setEnquiries(prev => prev.filter(enquiry => enquiry.enquiry_id !== enquiryId));
      setError('');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      setError('Failed to delete enquiry: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleteLoading(null);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchEnquiries();
    fetchDistricts();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Enquiry Management</h1>
      
      {/* Search and Filter Bar */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Enquiries
            </label>
            <input
              type="text"
              placeholder="Search by name, phone, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by District
            </label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Districts</option>
              {districts.map((district) => (
                <option key={district.district_id} value={district.district_id.toString()}>
                  {district.district_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={() => {
              setError('');
              fetchEnquiries();
            }}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading enquiries...</span>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            Showing {filteredEnquiries.length} of {enquiries.length} enquiries
          </div>

          {/* Enquiry Cards Grid */}
          {filteredEnquiries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnquiries.map((enquiry) => (
                <EnquiryCard
                  key={enquiry.enquiry_id}
                  enquiry={enquiry}
                  districts={districts}
                  onDelete={handleDeleteEnquiry}
                  deleteLoading={deleteLoading === enquiry.enquiry_id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {enquiries.length === 0 ? 'No enquiries found in the system.' : 'No enquiries match your search criteria.'}
              </div>
              {enquiries.length === 0 && (
                <button
                  onClick={fetchEnquiries}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnquiryManagementPage;

const EnquiryCard = ({ enquiry, districts, onDelete, deleteLoading }) => {
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Get district name
  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.district_id === districtId);
    return district ? district.district_name : 'Unknown District';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header with Status and Delete Button */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
            {enquiry.status || 'PENDING'}
          </span>
          {enquiry.urgency_level && (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(enquiry.urgency_level)}`}>
              {enquiry.urgency_level}
            </span>
          )}
        </div>
        <button
          onClick={() => onDelete(enquiry.enquiry_id)}
          disabled={deleteLoading}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
            deleteLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500'
          }`}
        >
          {deleteLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Enquiry Details */}
      <div className="space-y-3">
        {/* Patient Information */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {enquiry.patient_name || 'Unknown Patient'}
          </h3>
          <p className="text-sm text-gray-600">ID: #{enquiry.enquiry_id}</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-1">
          {enquiry.patient_phone && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Phone:</span> {enquiry.patient_phone}
            </p>
          )}
          {enquiry.patient_email && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {enquiry.patient_email}
            </p>
          )}
        </div>

        {/* Location and District */}
        <div className="space-y-1">
          {enquiry.district_id && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">District:</span> {getDistrictName(enquiry.district_id)}
            </p>
          )}
          {enquiry.pickup_location && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Pickup:</span> {enquiry.pickup_location}
            </p>
          )}
          {enquiry.destination_hospital && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Destination:</span> {enquiry.destination_hospital}
            </p>
          )}
        </div>

        {/* Medical Information */}
        {enquiry.medical_condition && (
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Medical Condition:</span>
            </p>
            <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
              {enquiry.medical_condition}
            </p>
          </div>
        )}

        {/* Patient Details */}
        <div className="flex gap-4 text-sm text-gray-700">
          {enquiry.patient_age && (
            <span><span className="font-medium">Age:</span> {enquiry.patient_age}</span>
          )}
          {enquiry.patient_gender && (
            <span><span className="font-medium">Gender:</span> {enquiry.patient_gender}</span>
          )}
        </div>

        {/* Preferred Date/Time */}
        {(enquiry.preferred_date || enquiry.preferred_time) && (
          <div className="space-y-1">
            {enquiry.preferred_date && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Preferred Date:</span> {formatDate(enquiry.preferred_date)}
              </p>
            )}
            {enquiry.preferred_time && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Preferred Time:</span> {enquiry.preferred_time}
              </p>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="pt-3 border-t border-gray-200 space-y-1">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Created:</span> {formatDate(enquiry.created_at)}
          </p>
          {enquiry.updated_at && enquiry.updated_at !== enquiry.created_at && (
            <p className="text-xs text-gray-500">
              <span className="font-medium">Updated:</span> {formatDate(enquiry.updated_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};