import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaReply, FaUser, FaCalendar,
  FaQuestionCircle, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaClipboardList, FaUserMd, FaHospital, FaMapMarkerAlt,
  FaDownload, FaFileExport, FaSortAmountDown, FaSortAmountUp
} from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const AllQueryPage = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Response modal
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    filterAndSortQueries();
  }, [queries, searchTerm, statusFilter, roleFilter, dateFilter, sortBy, sortOrder]);

  const fetchQueries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/api/case-queries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queries');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch queries');
      }

      setQueries(data.data || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortQueries = () => {
    let filtered = [...queries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(query =>
        query.query_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.query_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.enquiry?.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.enquiry?.enquiry_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.raisedBy?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'RESPONDED') {
        filtered = filtered.filter(query => query.response_text && query.responded_at);
      } else if (statusFilter === 'PENDING') {
        filtered = filtered.filter(query => !query.response_text || !query.responded_at);
      }
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(query => query.raisedBy?.role === roleFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(query => new Date(query.created_at) >= filterDate);
          break;
        case 'WEEK':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(query => new Date(query.created_at) >= filterDate);
          break;
        case 'MONTH':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(query => new Date(query.created_at) >= filterDate);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'responded_at':
          aValue = a.responded_at ? new Date(a.responded_at) : new Date(0);
          bValue = b.responded_at ? new Date(b.responded_at) : new Date(0);
          break;
        case 'patient_name':
          aValue = a.enquiry?.patient_name || '';
          bValue = b.enquiry?.patient_name || '';
          break;
        case 'raised_by':
          aValue = a.raisedBy?.full_name || '';
          bValue = b.raisedBy?.full_name || '';
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredQueries(filtered);
    setCurrentPage(1);
  };

  const handleRespond = async (queryId) => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setIsResponding(true);
      const response = await fetch(`${baseUrl}/api/case-queries/${queryId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ response_text: responseText }),
      });

      if (!response.ok) {
        throw new Error('Failed to respond to query');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to respond to query');
      }

      // Update the query in the list
      setQueries(prev =>
        prev.map(query =>
          query.query_id === queryId
            ? { ...query, response_text: responseText, responded_at: new Date().toISOString() }
            : query
        )
      );

      setSelectedQuery(null);
      setResponseText('');
      alert('Response sent successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsResponding(false);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredQueries.map(query => ({
      'Query Code': query.query_code,
      'Enquiry Code': query.enquiry?.enquiry_code || '',
      'Patient Name': query.enquiry?.patient_name || '',
      'Query Text': query.query_text,
      'Response Text': query.response_text || 'No response',
      'Raised By': query.raisedBy?.full_name || '',
      'Raised By Role': query.raisedBy?.role || '',
      'Responded By': query.respondedBy?.full_name || 'Not responded',
      'Created At': new Date(query.created_at).toLocaleString(),
      'Responded At': query.responded_at ? new Date(query.responded_at).toLocaleString() : 'Not responded',
      'Status': query.response_text ? 'Responded' : 'Pending'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queries_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentQueries = filteredQueries.slice(startIndex, endIndex);

  const getStatusIcon = (query) => {
    if (query.response_text && query.responded_at) {
      return <FaCheckCircle className="text-green-600" />;
    }
    return <FaClock className="text-yellow-600" />;
  };

  const getStatusColor = (query) => {
    if (query.response_text && query.responded_at) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getRoleColor = (role) => {
    const colors = {
      'CMO': 'bg-blue-100 text-blue-800',
      'SDM': 'bg-purple-100 text-purple-800',
      'DM': 'bg-indigo-100 text-indigo-800',
      'ADMIN': 'bg-red-100 text-red-800',
      'SERVICE_PROVIDER': 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-64"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaQuestionCircle className="mr-3 text-blue-600" />
                All Queries Management
              </h1>
              <p className="text-gray-600 mt-1">Monitor and respond to all system queries</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToCSV}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <FaFileExport className="mr-2" />
                Export CSV
              </button>
             
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <FaFilter className="mr-2 text-gray-600" />
              Filters & Search
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search queries, patients, codes..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="RESPONDED">Responded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CMO">CMO</option>
                  <option value="SDM">SDM</option>
                  <option value="DM">DM</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SERVICE_PROVIDER">Service Provider</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last Week</option>
                  <option value="MONTH">Last Month</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="created_at">Created Date</option>
                    <option value="responded_at">Response Date</option>
                    <option value="patient_name">Patient Name</option>
                    <option value="raised_by">Raised By</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                    className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'ASC' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    <span className="ml-2">{sortOrder}</span>
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredQueries.length)} of {filteredQueries.length} queries
              </div>
            </div>
          </div>
        </div>

        {/* Queries List */}
        {filteredQueries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FaQuestionCircle className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Queries Found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' || roleFilter !== 'ALL' || dateFilter !== 'ALL'
                ? 'Try adjusting your filters to see more results.'
                : 'No queries have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enquiry Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raised By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentQueries.map((query) => (
                    <tr key={query.query_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(query)}
                            <span className="font-medium text-gray-900">{query.query_code}</span>
                          </div>
                          <p className="text-sm text-gray-600 max-w-xs truncate" title={query.query_text}>
                            {query.query_text}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FaCalendar className="mr-1" />
                            {new Date(query.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {query.enquiry?.patient_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            {query.enquiry?.enquiry_code || 'N/A'}
                          </div>
                          <div className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            query.enquiry?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            query.enquiry?.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {query.enquiry?.status || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {query.raisedBy?.full_name || 'N/A'}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleColor(query.raisedBy?.role)}`}>
                            {query.raisedBy?.role || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex px-3 py-1 text-sm rounded-full border ${getStatusColor(query)}`}>
                            {query.response_text ? 'Responded' : 'Pending'}
                          </span>
                          {query.responded_at && (
                            <div className="text-xs text-gray-500">
                              Responded: {new Date(query.responded_at).toLocaleDateString()}
                            </div>
                          )}
                          {query.respondedBy && (
                            <div className="text-xs text-gray-600">
                              By: {query.respondedBy.full_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedQuery(query)}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <FaEye className="mr-1" />
                            View
                          </button>
                          {!query.response_text && (
                            <button
                              onClick={() => {
                                setSelectedQuery(query);
                                setResponseText('');
                              }}
                              className="flex items-center text-green-600 hover:text-green-800 text-sm"
                            >
                              <FaReply className="mr-1" />
                              Respond
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredQueries.length)} of {filteredQueries.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Query Detail/Response Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Query Details - {selectedQuery.query_code}
                </h3>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Query Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Query Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Code:</span> {selectedQuery.query_code}</div>
                    <div><span className="font-medium">Created:</span> {new Date(selectedQuery.created_at).toLocaleString()}</div>
                    <div><span className="font-medium">Raised By:</span> {selectedQuery.raisedBy?.full_name} ({selectedQuery.raisedBy?.role})</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Enquiry Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Patient:</span> {selectedQuery.enquiry?.patient_name}</div>
                    <div><span className="font-medium">Enquiry Code:</span> {selectedQuery.enquiry?.enquiry_code}</div>
                    <div><span className="font-medium">Status:</span> {selectedQuery.enquiry?.status}</div>
                  </div>
                </div>
              </div>

              {/* Query Text */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Query</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedQuery.query_text}</p>
                </div>
              </div>

              {/* Response Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Response</h4>
                {selectedQuery.response_text ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-700">{selectedQuery.response_text}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      Responded by {selectedQuery.respondedBy?.full_name} on {new Date(selectedQuery.responded_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Enter your response..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedQuery(null)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRespond(selectedQuery.query_id)}
                        disabled={isResponding || !responseText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResponding ? 'Sending...' : 'Send Response'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllQueryPage;