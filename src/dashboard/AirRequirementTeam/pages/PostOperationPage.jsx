import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiEye, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import ThemeTable from '../../../components/Common/ThemeTable';
import ThemeButton from '../../../components/Common/ThemeButton';
import ThemeInput from '../../../components/Common/ThemeInput';

const PostOperationPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    enquiry_id: '',
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
      // Simulate API call
      const mockData = [
        {
          report_id: 1,
          enquiry_id: 12345,
          flight_log: 'Flight departed at 10:30 AM, smooth journey, landed safely at 12:45 PM',
          patient_transfer_status: 'SUCCESSFUL',
          remarks: 'Patient stable throughout the journey. No complications.',
          submitted_by_user_id: 101,
          submittedBy: { full_name: 'Dr. John Smith' },
          created_at: '2024-01-15 13:00:00'
        },
        {
          report_id: 2,
          enquiry_id: 12346,
          flight_log: 'Flight delayed due to weather conditions, departed at 15:00',
          patient_transfer_status: 'SUCCESSFUL',
          remarks: 'Minor turbulence encountered, patient remained stable.',
          submitted_by_user_id: 102,
          submittedBy: { full_name: 'Dr. Sarah Wilson' },
          created_at: '2024-01-15 16:30:00'
        }
      ];
      setReports(mockData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
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
      enquiry_id: report.enquiry_id,
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
    { key: 'enquiry_id', label: 'Enquiry ID' },
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
        <ThemeButton
          onClick={() => {
            setSelectedReport(null);
            setFormData({
              enquiry_id: '',
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {selectedReport ? 'Edit Report' : 'New Post-Operation Report'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ThemeInput
                label="Enquiry ID"
                type="number"
                value={formData.enquiry_id}
                onChange={(e) => setFormData({...formData, enquiry_id: e.target.value})}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flight Log
                </label>
                <textarea
                  value={formData.flight_log}
                  onChange={(e) => setFormData({...formData, flight_log: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Detailed flight log including departure, journey, and arrival details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Transfer Status
                </label>
                <select
                  value={formData.patient_transfer_status}
                  onChange={(e) => setFormData({...formData, patient_transfer_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="SUCCESSFUL">Successful</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional remarks, complications, or observations..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <ThemeButton type="submit" className="flex-1">
                  {selectedReport ? 'Update Report' : 'Submit Report'}
                </ThemeButton>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostOperationPage;