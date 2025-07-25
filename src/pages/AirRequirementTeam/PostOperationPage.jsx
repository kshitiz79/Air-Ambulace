import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiEye, FiCheckCircle, FiXCircle, FiFileText, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import ThemeTable from './../../components/Common/ThemeTable';
import ThemeButton from './../../components/Common/ThemeButton';
import baseUrl from '../../baseUrl/baseUrl';

const PostOperationPage = () => {
  const [reports, setReports] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    enquiry_code: '',
    flight_log: '',
    patient_transfer_status: 'SUCCESSFUL',
    remarks: '',
    submitted_by_user_id: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch reports and enquiries in parallel
      const [reportsRes, enquiriesRes] = await Promise.all([
        fetch(`${baseUrl}/api/post-operation-reports`, { headers }).catch(err => ({ ok: false, error: err })),
        fetch(`${baseUrl}/api/enquiries`, { headers }).catch(err => ({ ok: false, error: err }))
      ]);

      // Handle enquiries first (more critical)
      const enquiriesData = enquiriesRes.ok ? await enquiriesRes.json() : { data: [] };
      const enquiriesList = Array.isArray(enquiriesData) ? enquiriesData : enquiriesData.data || [];
      setEnquiries(enquiriesList);

      // Handle reports (may not exist yet)
      let reportsList = [];
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        reportsList = Array.isArray(reportsData) ? reportsData : reportsData.data || [];
      } else {
        console.warn('Post-operation reports API not available, using empty list');
      }

      // Create enquiry lookup map
      const enquiryMap = {};
      enquiriesList.forEach(enquiry => {
        enquiryMap[enquiry.enquiry_id] = enquiry;
      });

      // Enhance reports with enquiry information
      const enhancedReports = reportsList.map(report => ({
        ...report,
        enquiry: enquiryMap[report.enquiry_id] || null,
        enquiry_code: enquiryMap[report.enquiry_id]?.enquiry_code || `ENQ${report.enquiry_id}`
      }));

      setReports(enhancedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchReports();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get current user ID from localStorage
      const currentUserId = localStorage.getItem('user_id');
      const reportData = {
        ...formData,
        submitted_by_user_id: currentUserId
      };

      console.log('Submitting report:', reportData);
      setShowModal(false);
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    setFormData({
      enquiry_code: report.enquiry_code,
      flight_log: report.flight_log,
      patient_transfer_status: report.patient_transfer_status,
      remarks: report.remarks,
      submitted_by_user_id: report.submitted_by_user_id
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SUCCESSFUL': {
        color: 'bg-green-100 text-green-800',
        icon: <FiCheckCircle size={14} />
      },
      'FAILED': {
        color: 'bg-red-100 text-red-800',
        icon: <FiXCircle size={14} />
      }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}>
        {config.icon}
        <span>{status}</span>
      </span>
    );
  };

  const columns = [
    { key: 'report_id', label: 'Report ID' },
    {
      key: 'enquiry_code',
      label: 'Enquiry Code',
      render: (value, row) => (
        <div>
          <p className="font-mono text-sm">{value}</p>
          {row.enquiry && (
            <p className="text-xs text-gray-500">{row.enquiry.patient_name}</p>
          )}
        </div>
      )
    },
    {
      key: 'patient_transfer_status',
      label: 'Transfer Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'submittedBy',
      label: 'Submitted By',
      render: (value) => value?.full_name || 'Unknown'
    },
    {
      key: 'created_at',
      label: 'Submitted At',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FiEdit size={16} />
          </button>
          <button className="text-green-600 hover:text-green-800">
            <FiEye size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post-Operation Reports</h1>
          <p className="text-gray-600">Manage flight completion and patient transfer reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <ThemeButton
            onClick={() => {
              setSelectedReport(null);
              setFormData({
                enquiry_code: '',
                flight_log: '',
                patient_transfer_status: 'SUCCESSFUL',
                remarks: '',
                submitted_by_user_id: ''
              });
              setShowModal(true);
            }}
            className="flex items-center space-x-2"
          >
            <FiPlus size={16} />
            <span>New Report</span>
          </ThemeButton>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <h4 className="font-medium text-red-800">Error Loading Reports</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiFileText className="text-blue-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiCheckCircle className="text-green-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Successful Transfers</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.patient_transfer_status === 'SUCCESSFUL').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FiXCircle className="text-red-600 mr-3" size={24} />
            <div>
              <p className="text-sm text-gray-600">Failed Transfers</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.patient_transfer_status === 'FAILED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ThemeTable
          data={reports}
          columns={columns}
          loading={loading}
          emptyMessage="No reports found"
        />
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiFileText className="text-white" size={24} />
                  <h3 className="text-xl font-semibold text-white">
                    {selectedReport ? 'Edit Post-Operation Report' : 'New Post-Operation Report'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiXCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Enquiry Selection Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiCheckCircle className="mr-2 text-blue-600" />
                    Flight Assignment Details
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Enquiry Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Enquiry Code *
                        </label>
                        <select
                          value={formData.enquiry_code}
                          onChange={(e) => {
                            const selectedEnquiry = enquiries.find(enq => enq.enquiry_code === e.target.value);
                            setFormData({
                              ...formData,
                              enquiry_code: e.target.value
                            });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Select an enquiry code</option>
                          {enquiries.map((enquiry) => (
                            <option key={enquiry.enquiry_id} value={enquiry.enquiry_code}>
                              {enquiry.enquiry_code} - {enquiry.patient_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patient Transfer Status *
                        </label>
                        <select
                          value={formData.patient_transfer_status}
                          onChange={(e) => setFormData({ ...formData, patient_transfer_status: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="SUCCESSFUL">✅ Successful Transfer</option>
                          <option value="FAILED">❌ Failed Transfer</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column - Enquiry Details */}
                    <div className="space-y-4">
                      {formData.enquiry_code && (
                        <div className="bg-white border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FiEye className="mr-2 text-blue-600" />
                            Enquiry Details
                          </h5>
                          {(() => {
                            const selected = enquiries.find(e => e.enquiry_code === formData.enquiry_code);
                            return selected ? (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">Patient:</span>
                                  <span className="text-gray-900">{selected.patient_name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">Condition:</span>
                                  <span className="text-gray-900">{selected.medical_condition}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">From:</span>
                                  <span className="text-gray-900">{selected.sourceHospital?.name || 'Source Hospital'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">To:</span>
                                  <span className="text-gray-900">{selected.hospital?.name || 'Destination Hospital'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selected.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    selected.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                    {selected.status}
                                  </span>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Flight Details Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiFileText className="mr-2 text-green-600" />
                    Flight & Operation Details
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Flight Log */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flight Log
                      </label>
                      <textarea
                        value={formData.flight_log}
                        onChange={(e) => setFormData({ ...formData, flight_log: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="6"
                        placeholder="Enter detailed flight log including:
• Departure time and location
• Flight duration and route
• Weather conditions
• Any incidents during flight
• Arrival time and location
• Crew members involved"
                      />
                    </div>

                    {/* Right Column - Remarks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Remarks
                      </label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        rows="6"
                        placeholder="Enter additional remarks such as:
• Patient condition during transfer
• Medical interventions performed
• Equipment used
• Complications encountered
• Recommendations for future
• Team performance notes"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <ThemeButton
                    type="submit"
                    className="px-8 py-3 flex items-center space-x-2"
                  >
                    <FiCheckCircle size={18} />
                    <span>{selectedReport ? 'Update Report' : 'Submit Report'}</span>
                  </ThemeButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostOperationPage;