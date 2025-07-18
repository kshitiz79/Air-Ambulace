import React, { useState, useEffect } from 'react';
import { FaPlus, FaList, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaExclamationTriangle, FaCalendarAlt, FaUser } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const EscalateCase = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [escalatedCases, setEscalatedCases] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [escalatedTo, setEscalatedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingEscalation, setEditingEscalation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch enquiries that can be escalated
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch enquiries');

        // Filter enquiries that can be escalated (not already escalated or completed)
        const escalatableEnquiries = (data.data || []).filter(
          enquiry => !['ESCALATED', 'COMPLETED'].includes(enquiry.status)
        );
        setEnquiries(escalatableEnquiries);
      } catch (err) {
        setError('Failed to load enquiries: ' + err.message);
      }
    };

    fetchEnquiries();
  }, []);

  // Fetch escalated cases
  useEffect(() => {
    const fetchEscalatedCases = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/case-escalations`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch escalated cases');

        setEscalatedCases(data.data || []);
      } catch (err) {
        console.error('Failed to load escalated cases:', err.message);
        // Fallback to enquiries with ESCALATED status
        try {
          const fallbackResponse = await fetch(`${baseUrl}/api/enquiries?status=ESCALATED`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const fallbackData = await fallbackResponse.json();
          if (fallbackResponse.ok) {
            setEscalatedCases(fallbackData.data || []);
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr.message);
        }
      }
    };

    fetchEscalatedCases();
  }, [success, activeTab]);

  const handleEscalate = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry || !escalationReason.trim() || !escalatedTo.trim()) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${baseUrl}/api/enquiries/${selectedEnquiry}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          escalation_reason: escalationReason,
          escalated_to: escalatedTo,
          escalated_by_user_id: localStorage.getItem('user_id') || '1',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to escalate case');

      setSuccess(`Case escalated successfully! Escalation ID: ${data.data.escalation_id}`);
      setSelectedEnquiry('');
      setEscalationReason('');
      setEscalatedTo('');

      // Refresh enquiries list
      const updatedEnquiries = enquiries.filter(enq => enq.enquiry_id !== parseInt(selectedEnquiry));
      setEnquiries(updatedEnquiries);

      // Switch to list tab to show the new escalation
      setActiveTab('list');
    } catch (err) {
      setError('Failed to escalate case: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEscalation = async (escalationId, updatedData) => {
    try {
      const response = await fetch(`${baseUrl}/api/case-escalations/${escalationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update escalation');
      }

      const updatedEscalation = await response.json();
      setEscalatedCases(prev =>
        prev.map(escalation =>
          escalation.escalation_id === escalationId ? updatedEscalation.data : escalation
        )
      );
      setEditingEscalation(null);
      setSuccess('Escalation updated successfully!');
    } catch (err) {
      setError('Failed to update escalation: ' + err.message);
    }
  };

  const handleDeleteEscalation = async (escalationId) => {
    if (!window.confirm('Are you sure you want to delete this escalation?')) return;

    setDeletingId(escalationId);
    try {
      const response = await fetch(`${baseUrl}/api/case-escalations/${escalationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete escalation');
      }

      setEscalatedCases(prev => prev.filter(escalation => escalation.escalation_id !== escalationId));
      setSuccess('Escalation deleted successfully!');
    } catch (err) {
      setError('Failed to delete escalation: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const escalationOptions = [
    'District Magistrate',
    'Chief Medical Officer',
    'State Health Department',
    'Emergency Response Team',
    'Senior Medical Authority',
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    return status === 'RESOLVED'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const EditEscalationForm = ({ escalation, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      escalation_reason: escalation.escalation_reason || '',
      escalated_to: escalation.escalated_to || '',
      status: escalation.status || 'PENDING'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(escalation.escalation_id, formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escalation Reason
          </label>
          <textarea
            value={formData.escalation_reason}
            onChange={(e) => setFormData(prev => ({ ...prev, escalation_reason: e.target.value }))}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escalated To
          </label>
          <select
            value={formData.escalated_to}
            onChange={(e) => setFormData(prev => ({ ...prev, escalated_to: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select authority...</option>
            {escalationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="PENDING">PENDING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <FaSave className="mr-2" />
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaExclamationTriangle className="mr-3 text-red-600" />
            Case Escalation Management
          </h1>
          <p className="text-gray-600 mt-1">Manage case escalations and track their status</p>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
            >
              <FaList className="inline mr-2" />
              Escalated Cases ({escalatedCases.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
            >
              <FaPlus className="inline mr-2" />
              Create Escalation
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {success}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Escalated Cases</h2>
          </div>
          <div className="p-6">
            {escalatedCases.length === 0 ? (
              <div className="text-center py-12">
                <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Escalated Cases</h3>
                <p className="text-gray-600">No cases have been escalated yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {escalatedCases.map((escalation) => (
                  <div key={escalation.escalation_id || escalation.enquiry_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    {editingEscalation === (escalation.escalation_id || escalation.enquiry_id) ? (
                      <EditEscalationForm
                        escalation={escalation}
                        onSave={handleEditEscalation}
                        onCancel={() => setEditingEscalation(null)}
                      />
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {escalation.patient_name || 'N/A'}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(escalation.status)}`}>
                                {escalation.status || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Enquiry Code: {escalation.enquiry_code || 'N/A'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingEscalation(escalation.escalation_id || escalation.enquiry_id)}
                              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEscalation(escalation.escalation_id || escalation.enquiry_id)}
                              disabled={deletingId === (escalation.escalation_id || escalation.enquiry_id)}
                              className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                              <FaTrash className="mr-1" />
                              {deletingId === (escalation.escalation_id || escalation.enquiry_id) ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <FaUser className="text-gray-500" />
                            <span className="text-sm">
                              <span className="font-medium">Escalated To:</span> {escalation.escalated_to || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-gray-500" />
                            <span className="text-sm">
                              <span className="font-medium">Created:</span> {formatDate(escalation.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Escalation Reason:</h4>
                          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                            {escalation.escalation_reason || 'No reason provided'}
                          </p>
                        </div>

                        {escalation.resolved_at && (
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <FaCalendarAlt />
                            <span>
                              <span className="font-medium">Resolved:</span> {formatDate(escalation.resolved_at)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Create New Escalation</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleEscalate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Enquiry to Escalate *
                </label>
                <select
                  value={selectedEnquiry}
                  onChange={(e) => setSelectedEnquiry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select an enquiry...</option>
                  {enquiries.map((enquiry) => (
                    <option key={enquiry.enquiry_id} value={enquiry.enquiry_id}>
                      {enquiry.enquiry_code} - {enquiry.patient_name} ({enquiry.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Reason *
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the reason for escalation..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalate To *
                </label>
                <select
                  value={escalatedTo}
                  onChange={(e) => setEscalatedTo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select authority...</option>
                  {escalationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEnquiry('');
                    setEscalationReason('');
                    setEscalatedTo('');
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Escalating...' : 'Escalate Case'}
                </button>
              </div>
            </form>

            {enquiries.length === 0 && !error && (
              <div className="mt-6 p-4 bg-blue-100 text-blue-700 rounded-lg">
                No enquiries available for escalation. All cases are either already escalated or completed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalateCase;