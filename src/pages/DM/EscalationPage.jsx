import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaExclamationTriangle,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaSyncAlt,
  FaFileAlt
} from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const EscalationPage = () => {
  const [escalatedCases, setEscalatedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: 'ALL', search: '' });
  const [resolving, setResolving] = useState(null);

  // Fetch escalated cases
  const fetchEscalatedCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all enquiries with ESCALATED status
      const enquiriesRes = await fetch(`${baseUrl}/api/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');

      const enquiriesData = await enquiriesRes.json();
      const allEnquiries = enquiriesData.data || [];

      // Filter only ESCALATED enquiries
      const escalatedEnquiries = allEnquiries.filter(e => e.status === 'ESCALATED');

      // Fetch escalation details for each escalated enquiry
      const escalationsRes = await fetch(`${baseUrl}/api/case-escalations`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ ok: false }));

      let escalationsData = [];
      if (escalationsRes.ok) {
        const data = await escalationsRes.json();
        escalationsData = data.data || [];
      }

      // Merge enquiry data with escalation data
      const mergedData = escalatedEnquiries.map(enquiry => {
        const escalation = escalationsData.find(esc => esc.enquiry_id === enquiry.enquiry_id);
        return {
          ...enquiry,
          escalation_details: escalation || null
        };
      });

      setEscalatedCases(mergedData);
      setError('');
    } catch (err) {
      console.error('Error fetching escalated cases:', err);
      setError('Failed to load escalated cases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalatedCases();
  }, []);

  const handleRefresh = () => {
    fetchEscalatedCases();
  };

  const handleResolveEscalation = async (escalationId, enquiryId) => {
    if (!window.confirm('Are you sure you want to mark this escalation as resolved?')) return;

    try {
      setResolving(escalationId);
      const token = localStorage.getItem('token');

      const response = await fetch(`${baseUrl}/api/case-escalations/${escalationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to resolve escalation');

      // Refresh the list
      await fetchEscalatedCases();
      alert('Escalation resolved successfully!');
    } catch (err) {
      console.error('Error resolving escalation:', err);
      alert('Failed to resolve escalation: ' + err.message);
    } finally {
      setResolving(null);
    }
  };

  // Filter cases based on search and status
  const filteredCases = escalatedCases.filter(c => {
    const matchesStatus = filter.status === 'ALL' || 
      (filter.status === 'PENDING' && c.escalation_details?.status === 'PENDING') ||
      (filter.status === 'RESOLVED' && c.escalation_details?.status === 'RESOLVED');
    
    const matchesSearch = !filter.search || 
      c.patient_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      c.enquiry_code?.toLowerCase().includes(filter.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    return status === 'RESOLVED'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-600 mt-4">Loading escalated cases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: escalatedCases.length,
    pending: escalatedCases.filter(c => c.escalation_details?.status === 'PENDING').length,
    resolved: escalatedCases.filter(c => c.escalation_details?.status === 'RESOLVED').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaExclamationTriangle className="mr-3 text-red-600" />
              Escalated Cases
            </h1>
            <p className="mt-1 text-gray-600">Review and manage escalated enquiries</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaSyncAlt className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Escalated</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <FaFileAlt className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Pending Resolution</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <FaClock className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold">{stats.resolved}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <FaCheckCircle className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by patient name or enquiry code..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Escalated Cases List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Escalated Cases ({filteredCases.length})
          </h2>
        </div>
        <div className="p-6">
          {filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Escalated Cases</h3>
              <p className="text-gray-600">No cases have been escalated yet or match your filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCases.map((caseItem) => (
                <div
                  key={caseItem.enquiry_id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {caseItem.patient_name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          ESCALATED
                        </span>
                        {caseItem.escalation_details && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caseItem.escalation_details.status)}`}>
                            {caseItem.escalation_details.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Enquiry Code: {caseItem.enquiry_code || `ENQ${caseItem.enquiry_id}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/dm-dashboard/case-file/${caseItem.enquiry_id}`}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <FaEye className="mr-1" />
                        View Details
                      </Link>
                      {caseItem.escalation_details?.status === 'PENDING' && (
                        <button
                          onClick={() => handleResolveEscalation(caseItem.escalation_details.escalation_id, caseItem.enquiry_id)}
                          disabled={resolving === caseItem.escalation_details.escalation_id}
                          className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <FaCheckCircle className="mr-1" />
                          {resolving === caseItem.escalation_details.escalation_id ? 'Resolving...' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </div>

                  {caseItem.escalation_details && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <FaUser className="text-gray-500" />
                          <span className="text-sm">
                            <span className="font-medium">Escalated To:</span> {caseItem.escalation_details.escalated_to}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-gray-500" />
                          <span className="text-sm">
                            <span className="font-medium">Escalated On:</span> {formatDate(caseItem.escalation_details.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Escalation Reason:</h4>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                          {caseItem.escalation_details.escalation_reason || 'No reason provided'}
                        </p>
                      </div>

                      {caseItem.escalation_details.resolved_at && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <FaCalendarAlt />
                          <span>
                            <span className="font-medium">Resolved On:</span> {formatDate(caseItem.escalation_details.resolved_at)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Additional Enquiry Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Medical Condition:</span>
                        <p className="text-gray-900">{caseItem.medical_condition}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Hospital:</span>
                        <p className="text-gray-900">{caseItem.hospital?.name || caseItem.hospital?.hospital_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Contact:</span>
                        <p className="text-gray-900">{caseItem.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscalationPage;