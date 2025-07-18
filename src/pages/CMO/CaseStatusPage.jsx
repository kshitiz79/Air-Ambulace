import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaFilter, FaEye, FaEdit, FaDownload, FaFileAlt,
  FaUser, FaHospital, FaMapMarkerAlt, FaCalendar, FaClipboardList,
  FaCheckCircle, FaTimesCircle, FaArrowRight, FaExclamationTriangle
} from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const EnquiryStatusPage = () => {
  const navigate = useNavigate();
  const [enquiryId, setEnquiryId] = useState('');
  const [enquiryCode, setEnquiryCode] = useState(''); // Added for filtering by enquiry_code
  const [status, setStatus] = useState(null);
  const [allEnquiries, setAllEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all enquiries on component mount
  useEffect(() => {
    const fetchAllEnquiries = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/api/enquiries`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch enquiries');
        }
        setAllEnquiries(data.data || []);
        setFilteredEnquiries(data.data || []);
        setError('');
        
        // Show info if data is filtered for CMO users
        if (data.filtered && localStorage.getItem('role') === 'CMO') {
          console.log(`Case Status: Showing ${data.data?.length || 0} enquiries created by current CMO user`);
        }
      } catch (err) {
        setError('Failed to load enquiries: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEnquiries();
  }, []);

  // Handle status and enquiry_code filter change
  useEffect(() => {
    let filtered = allEnquiries;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((enquiry) => enquiry.status === statusFilter);
    }
    if (enquiryCode) {
      filtered = filtered.filter((enquiry) =>
        enquiry.enquiry_code.toLowerCase().includes(enquiryCode.toLowerCase())
      );
    }
    setFilteredEnquiries(filtered);
  }, [statusFilter, enquiryCode, allEnquiries]);

  // Download document
  const handleDownload = (filePath, fileName) => {
    const link = document.createElement('a');
    link.href = `${baseUrl}${filePath}`;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Approve or reject enquiry
  const handleApproveOrReject = async (id, action) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/enquiries/${id}/approve-reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update enquiry');
      }
      setAllEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry.enquiry_id === id ? { ...enquiry, status: data.data.status } : enquiry
        )
      );
      setError('');
    } catch (err) {
      setError(`Failed to ${action.toLowerCase()} enquiry: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forward enquiry to DM
  const handleForward = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/enquiries/${id}/forward`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to forward enquiry');
      }
      setAllEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry.enquiry_id === id ? { ...enquiry, status: data.data.status } : enquiry
        )
      );
      setError('');
    } catch (err) {
      setError('Failed to forward enquiry: ' + err.message);
    } finally {
      setLoading(false);
    }
  };



  // Status options for filter
  const statusOptions = [
    'ALL',
    'PENDING',
    'FORWARDED',
    'APPROVED',
    'REJECTED',
    'ESCALATED',
    'IN_PROGRESS',
    'COMPLETED',
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <FaCheckCircle className="text-green-600" />;
      case 'REJECTED': return <FaTimesCircle className="text-red-600" />;
      case 'FORWARDED': return <FaArrowRight className="text-blue-600" />;
      case 'ESCALATED': return <FaExclamationTriangle className="text-purple-600" />;
      default: return <FaClipboardList className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'FORWARDED': 'bg-blue-100 text-blue-800 border-blue-200',
      'ESCALATED': 'bg-purple-100 text-purple-800 border-purple-200',
      'IN_PROGRESS': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaClipboardList className="mr-3 text-blue-600" />
                Case Status Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Monitor and track all your enquiry cases</p>
              {localStorage.getItem('role') === 'CMO' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <FaUser className="mr-1" />
                    Showing only your enquiries
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{filteredEnquiries.length}</div>
              <div className="text-sm text-gray-600">Total Cases</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error and Loading States */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Loading enquiries...
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="enquiryCodeFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Enquiry Code
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="enquiryCodeFilter"
                    type="text"
                    value={enquiryCode}
                    onChange={(e) => setEnquiryCode(e.target.value)}
                    placeholder="Enter Enquiry Code..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Results: {filteredEnquiries.length}</div>
                  <div>Total: {allEnquiries.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        {!loading && filteredEnquiries.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Cases Found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'ALL' || enquiryCode 
                ? 'Try adjusting your filters to see more results.'
                : 'No enquiries have been created yet.'}
            </p>
          </div>
        )}

        {!loading && filteredEnquiries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEnquiries.map((enquiry) => (
              <div key={enquiry.enquiry_id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(enquiry.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status?.replace('_', ' ') || 'PENDING'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      #{enquiry.enquiry_id}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {enquiry.patient_name}
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    {enquiry.enquiry_code}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaHospital className="mr-2 text-gray-400" />
                    <span className="truncate">
                      {enquiry.hospital?.name || enquiry.hospital?.hospital_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span>{enquiry.district?.district_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendar className="mr-2 text-gray-400" />
                    <span>{new Date(enquiry.created_at).toLocaleDateString()}</span>
                  </div>
                  {enquiry.documents && enquiry.documents.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      <span>{enquiry.documents.length} document(s)</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/beneficiary-detail/${enquiry.enquiry_id}`)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FaEye className="mr-1" />
                      View Details
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/beneficiary-edit/${enquiry.enquiry_id}`)}
                        className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      {enquiry.documents && enquiry.documents.length > 0 && (
                        <div className="relative group">
                          <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
                            <FaDownload className="mr-1" />
                            Docs
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-2">
                              {enquiry.documents.map((doc) => (
                                <button
                                  key={doc.document_id}
                                  onClick={() => handleDownload(doc.file_path, doc.document_type)}
                                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                >
                                  {doc.document_type}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryStatusPage;