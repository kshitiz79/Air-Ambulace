import React, { useState, useEffect } from 'react';
import { FaPlus, FaList, FaEdit, FaTrash, FaSave, FaTimes, FaExclamationTriangle, FaCalendarAlt, FaUser, FaSearch, FaSpinner } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const EscalateCase = () => {
  const [escalatedCases, setEscalatedCases] = useState([]);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Selected enquiry details
  const [selectedEnquiryObj, setSelectedEnquiryObj] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState('');
  
  const [escalationReason, setEscalationReason] = useState('');
  const [escalatedTo, setEscalatedTo] = useState('Collector');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingEscalation, setEditingEscalation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Initial load of some recent enquiries for the dropdown when empty
  useEffect(() => {
    if (activeTab === 'create' && searchTerm === '') {
      fetchEnquiries();
    }
  }, [activeTab, searchTerm]);

  const fetchEnquiries = async (query = '') => {
    setIsSearching(true);
    try {
      // Use search API if query exists, otherwise get standard list
      let url = `${baseUrl}/api/enquiries`;
      if (query) {
        // We will pass query to patient_name as a fallback, 
        // ideally backend supports generic 'query' but we'll try multiple or just use the list API and filter locally if it's alphanumeric.
        // Actually, let's fetch all and filter client side for better UX if backend doesn't have a generic full-text search.
        // Since the backend handles cmho specific limits, we fetch all permitted.
        url = `${baseUrl}/api/enquiries`; 
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch enquiries');

      let escalatable = (data.data || []).filter(
        enquiry => !['ESCALATED', 'COMPLETED'].includes(enquiry.status)
      );

      if (query) {
        const q = query.toLowerCase();
        escalatable = escalatable.filter(e => 
          (e.patient_name && e.patient_name.toLowerCase().includes(q)) ||
          (e.enquiry_code && e.enquiry_code.toLowerCase().includes(q)) ||
          (e.contact_phone && e.contact_phone.includes(q)) ||
          (e.district?.district_name && e.district.district_name.toLowerCase().includes(q)) ||
          (e.hospital?.name && e.hospital.name.toLowerCase().includes(q))
        );
      }

      setSearchResults(escalatable);
    } catch (err) {
      console.error('Failed to search enquiries:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEnquiries(searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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

  const handleSelectEnquiry = (enquiry) => {
    setSelectedEnquiryObj(enquiry);
    setSelectedEnquiry(enquiry.enquiry_id);
    setSearchTerm('');
    setShowDropdown(false);
  };

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
          escalated_by_user_id: localStorage.getItem('userId') || localStorage.getItem('user_id'),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to escalate case');

      setSuccess(`Case escalated successfully! Escalation ID: ${data.data.escalation_id}`);
      setSelectedEnquiryObj(null);
      setSelectedEnquiry('');
      setEscalationReason('');
      setEscalatedTo('Collector'); // Reset to default Collector
      
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
    'Collector'
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

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const EditEscalationForm = ({ escalation, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      escalation_reason: escalation.escalation_reason || '',
      escalated_to: escalation.escalated_to || 'Collector',
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
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaExclamationTriangle className="mr-3 text-red-600" />
            Case Escalation Management
          </h1>
          <p className="text-gray-600 mt-1">Manage case escalations, track their status, and find cases accurately.</p>
          {localStorage.getItem('role') === 'CMHO' && (
            <p className="text-sm text-blue-600 mt-2">
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Showing your enquiries
              </span>
            </p>
          )}
        </div>

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

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center">
          <FaSave className="mr-2" />
          {success}
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg shadow-sm">
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
              <div className="grid grid-cols-1 gap-6">
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
                              <h3 className="text-lg font-bold text-gray-900">
                                {escalation.enquiry?.patient_name || escalation.patient_name || 'Patient Unknown'}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(escalation.status)}`}>
                                {escalation.status || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Enquiry Code: <span className="font-semibold text-gray-800">{escalation.enquiry?.enquiry_code || escalation.enquiry_code || 'N/A'}</span>
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingEscalation(escalation.escalation_id || escalation.enquiry_id)}
                              className="flex items-center px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 font-medium rounded hover:bg-indigo-100 transition border border-indigo-200"
                            >
                              <FaEdit className="mr-1.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEscalation(escalation.escalation_id || escalation.enquiry_id)}
                              disabled={deletingId === (escalation.escalation_id || escalation.enquiry_id)}
                              className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 font-medium rounded hover:bg-red-100 transition border border-red-200 disabled:opacity-50"
                            >
                              <FaTrash className="mr-1.5" />
                              {deletingId === (escalation.escalation_id || escalation.enquiry_id) ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="flex items-center space-x-2">
                            <FaUser className="text-indigo-500" />
                            <span className="text-sm">
                              <span className="font-semibold text-gray-700">Escalated To:</span> {escalation.escalated_to || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="text-indigo-500" />
                            <span className="text-sm">
                              <span className="font-semibold text-gray-700">Created:</span> {formatDate(escalation.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <h4 className="font-semibold text-gray-900 mb-2">Escalation Reason:</h4>
                          <p className="text-gray-800 text-sm bg-white border border-gray-200 p-4 rounded-lg shadow-inner">
                            {escalation.escalation_reason || 'No reason provided'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-sm overflow-visible">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Create New Escalation</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleEscalate} className="space-y-8">
              
              {/* Searchable Enquiry Selector */}
              <div className="search-container relative">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Search & Select Case to Escalate *
                </label>
                {!selectedEnquiryObj ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isSearching ? <FaSpinner className="h-4 w-4 text-blue-500 animate-spin" /> : <FaSearch className="h-4 w-4 text-gray-400" />}
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-indigo-50/30"
                      placeholder="Search by Enquiry ID, Patient Name, Phone Number, District..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                    
                    {/* Dropdown Results */}
                    {showDropdown && (
                      <div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-60 rounded-lg border border-gray-200 overflow-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500 text-sm">Searching records...</div>
                        ) : searchResults.length > 0 ? (
                          <ul className="divide-y divide-gray-100">
                            {searchResults.map(enq => (
                              <li
                                key={enq.enquiry_id}
                                className="p-3 hover:bg-indigo-50 cursor-pointer transition-colors"
                                onClick={() => handleSelectEnquiry(enq)}
                              >
                                <div className="font-semibold text-gray-900">{enq.enquiry_code} - {enq.patient_name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                  <span>📞 {enq.contact_phone}</span>
                                  <span>📍 {enq.district?.district_name || 'N/A'}</span>
                                  <span className={`font-medium ${enq.status === 'PENDING' ? 'text-amber-600' : 'text-blue-600'}`}>
                                    Status: {enq.status}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">No cases found matching your search.</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Selected Enquiry Details Card
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 relative">
                    <button 
                      type="button" 
                      onClick={() => setSelectedEnquiryObj(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear Selection"
                    >
                      <FaTimes size={18} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-indigo-100 pb-2">Selected Case Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Enquiry ID</p>
                        <p className="font-semibold text-gray-900">{selectedEnquiryObj.enquiry_code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Patient Name</p>
                        <p className="font-semibold text-gray-900">{selectedEnquiryObj.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">District</p>
                        <p className="font-semibold text-gray-900">{selectedEnquiryObj.district?.district_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Hospital</p>
                        <p className="font-semibold text-gray-900 truncate" title={selectedEnquiryObj.hospital?.name}>{selectedEnquiryObj.hospital?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Current Status</p>
                        <p className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                          {selectedEnquiryObj.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Created By</p>
                        <p className="font-semibold text-gray-900">{selectedEnquiryObj.submittedBy?.full_name || 'CMHO / Staff'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Escalation Reason *
                  </label>
                  <textarea
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Clearly describe the reason for escalating this case to the Collector..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Escalate To *
                  </label>
                  <select
                    value={escalatedTo}
                    onChange={(e) => setEscalatedTo(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    required
                  >
                    {escalationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                     Escalations are directly routed to the District Collector.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEnquiryObj(null);
                    setSelectedEnquiry('');
                    setEscalationReason('');
                    setEscalatedTo('Collector');
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedEnquiryObj}
                  className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaExclamationTriangle />}
                  {loading ? 'Processing...' : 'Submit Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalateCase;