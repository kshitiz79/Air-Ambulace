import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';
import { 
  FiSearch, 
  FiUser, 
  FiCreditCard, 
  FiMail, 
  FiPhone, 
  FiFileText,
  FiEye,
  FiCalendar,
  FiMapPin,
  FiActivity
} from 'react-icons/fi';

const SearchPage = () => {
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

  const handleChange = (e) => {
    setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      Object.keys(searchCriteria).forEach(key => {
        if (searchCriteria[key] && searchCriteria[key] !== 'ALL') {
          queryParams.append(key, searchCriteria[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/enquiries/search?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const results = response.data.data || [];
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search enquiries: ' + (err.response?.data?.message || err.message));
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
      day: 'numeric'
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
    };
    
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiSearch className="text-2xl text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
          </div>
          <p className="text-gray-600 mt-2">Search enquiries by multiple criteria</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Patient Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiUser className="mr-2" />
                Patient Name
              </label>
              <input
                type="text"
                name="patient_name"
                value={searchCriteria.patient_name}
                onChange={handleChange}
                placeholder="Enter patient name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Father/Spouse Name */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiUser className="mr-2" />
                Father/Spouse Name
              </label>
              <input
                type="text"
                name="father_spouse_name"
                value={searchCriteria.father_spouse_name}
                onChange={handleChange}
                placeholder="Enter father/spouse name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ayushman Card Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiCreditCard className="mr-2" />
                Ayushman Card Number
              </label>
              <input
                type="text"
                name="ayushman_card_number"
                value={searchCriteria.ayushman_card_number}
                onChange={handleChange}
                placeholder="Enter Ayushman card number"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Aadhar Card Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiCreditCard className="mr-2" />
                Aadhar Card Number
              </label>
              <input
                type="text"
                name="aadhar_card_number"
                value={searchCriteria.aadhar_card_number}
                onChange={handleChange}
                placeholder="Enter Aadhar card number"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* PAN Card Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiCreditCard className="mr-2" />
                PAN Card Number
              </label>
              <input
                type="text"
                name="pan_card_number"
                value={searchCriteria.pan_card_number}
                onChange={handleChange}
                placeholder="Enter PAN card number"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiMail className="mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="contact_email"
                value={searchCriteria.contact_email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="mr-2" />
                Phone Number
              </label>
              <input
                type="text"
                name="contact_phone"
                value={searchCriteria.contact_phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Enquiry Code */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiFileText className="mr-2" />
                Enquiry Code
              </label>
              <input
                type="text"
                name="enquiry_code"
                value={searchCriteria.enquiry_code}
                onChange={handleChange}
                placeholder="Enter enquiry code"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FiActivity className="mr-2" />
                Status
              </label>
              <select
                name="status"
                value={searchCriteria.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="FORWARDED">Forwarded</option>
                <option value="ESCALATED">Escalated</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSearch className="mr-2" />
              {loading ? 'Searching...' : 'Search Enquiries'}
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear All
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
                <span className="text-sm text-gray-600">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {searchResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enquiry Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((enquiry) => (
                        <tr key={enquiry.enquiry_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {enquiry.enquiry_code || `#${enquiry.enquiry_id}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enquiry.district?.district_name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {enquiry.patient_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enquiry.father_spouse_name && `Father/Spouse: ${enquiry.father_spouse_name}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Age: {enquiry.age || 'N/A'}, Gender: {enquiry.gender || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <FiPhone className="inline mr-1" />
                              {enquiry.contact_phone}
                            </div>
                            <div className="text-sm text-gray-500">
                              <FiMail className="inline mr-1" />
                              {enquiry.contact_email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(enquiry.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <FiCalendar className="mr-1" />
                              {formatDate(enquiry.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/sdm-dashboard/enquiry-detail-page/${enquiry.enquiry_id}`}
                              className="flex items-center text-blue-600 hover:text-blue-900"
                            >
                              <FiEye className="mr-1" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiSearch className="mx-auto text-6xl text-gray-400 mb-4" />
                  <div className="text-gray-500 text-lg">
                    No enquiries found matching your search criteria
                  </div>
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search parameters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;