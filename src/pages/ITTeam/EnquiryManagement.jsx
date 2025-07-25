import React, { useState, useEffect } from 'react';
import {
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiFilter,
  FiSearch,
  FiFileText,
  FiUser,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/enquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnquiries(Array.isArray(data) ? data : data.data || []);
      } else {
        console.error('Failed to fetch enquiries');
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FiClock size={14} />
      },
      'APPROVED': {
        color: 'bg-green-100 text-green-800',
        icon: <FiCheckCircle size={14} />
      },
      'REJECTED': {
        color: 'bg-red-100 text-red-800',
        icon: <FiXCircle size={14} />
      },
      'ESCALATED': {
        color: 'bg-red-100 text-red-800',
        icon: <FiAlertTriangle size={14} />
      },
      'IN_PROGRESS': {
        color: 'bg-blue-100 text-blue-800',
        icon: <FiClock size={14} />
      },
      'COMPLETED': {
        color: 'bg-green-100 text-green-800',
        icon: <FiCheckCircle size={14} />
      }
    };

    const config = statusConfig[status] || statusConfig['PENDING'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}>
        {config.icon}
        <span>{status.replace('_', ' ')}</span>
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'HIGH': { color: 'bg-red-100 text-red-800', label: 'High' },
      'MEDIUM': { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      'LOW': { color: 'bg-green-100 text-green-800', label: 'Low' },
      'CRITICAL': { color: 'bg-red-200 text-red-900', label: 'Critical' }
    };

    const config = priorityConfig[priority] || priorityConfig['MEDIUM'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = !searchTerm ||
      enquiry.enquiry_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.medical_condition?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || enquiry.status === statusFilter;

    const matchesDate = !dateFilter ||
      new Date(enquiry.created_at).toDateString() === new Date(dateFilter).toDateString();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportToExcel = () => {
    // TODO: Implement Excel export functionality
    alert('Excel export functionality will be implemented soon!');
  };

  const columns = [
    {
      key: 'enquiry_code',
      label: 'Enquiry Code',
      render: (value) => <span className="font-mono font-medium">{value}</span>
    },
    {
      key: 'patient_name',
      label: 'Patient Name',
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'medical_condition',
      label: 'Medical Condition',
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => getPriorityBadge(value)
    },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'sourceHospital',
      label: 'Source Hospital',
      render: (value) => value?.name || 'N/A'
    },
    {
      key: 'hospital',
      label: 'Destination Hospital',
      render: (value) => value?.name || 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <FiEye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center ">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiry Management</h1>
          <p className="text-gray-600">View and manage all enquiries in the system</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload className="mr-2" />
            Export Excel
          </button>
          <button
            onClick={fetchEnquiries}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search enquiries..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-900">{enquiries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiClock className="text-yellow-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {enquiries.filter(e => e.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {enquiries.filter(e => e.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiAlertTriangle className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Escalated</p>
              <p className="text-2xl font-bold text-gray-900">
                {enquiries.filter(e => e.status === 'ESCALATED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-purple-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {enquiries.filter(e => e.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredEnquiries.length} of {enquiries.length} enquiries
        </p>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={filteredEnquiries}
          columns={columns}
          loading={loading}
          emptyMessage="No enquiries found"
        />
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiFileText className="text-white" size={24} />
                  <h3 className="text-xl font-semibold text-white">
                    Enquiry Details - {selectedEnquiry.enquiry_code}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiXCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Patient Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiUser className="mr-2 text-blue-600" />
                      Patient Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-900">{selectedEnquiry.patient_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Age:</span>
                        <span className="text-gray-900">{selectedEnquiry.patient_age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Gender:</span>
                        <span className="text-gray-900">{selectedEnquiry.patient_gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Contact:</span>
                        <span className="text-gray-900">{selectedEnquiry.patient_contact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Medical Condition:</span>
                        <span className="text-gray-900">{selectedEnquiry.medical_condition}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiMapPin className="mr-2 text-green-600" />
                      Transfer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">From:</span>
                        <span className="text-gray-900">{selectedEnquiry.sourceHospital?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">To:</span>
                        <span className="text-gray-900">{selectedEnquiry.hospital?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Distance:</span>
                        <span className="text-gray-900">{selectedEnquiry.distance_km || 'N/A'} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Ambulance Reg:</span>
                        <span className="text-gray-900 font-mono">{selectedEnquiry.ambulance_registration_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Status & Timeline */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <FiClock className="mr-2 text-yellow-600" />
                      Status & Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span>
                        {getStatusBadge(selectedEnquiry.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Priority:</span>
                        {getPriorityBadge(selectedEnquiry.priority)}
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Created:</span>
                        <span className="text-gray-900">{new Date(selectedEnquiry.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Updated:</span>
                        <span className="text-gray-900">{new Date(selectedEnquiry.updated_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEnquiry.remarks && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">
                        Remarks
                      </h4>
                      <p className="text-sm text-gray-700">{selectedEnquiry.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryManagement;