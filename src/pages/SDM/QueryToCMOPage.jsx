import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiSend, 
  FiMessageSquare, 
  FiArrowLeft, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiRefreshCw,
  FiFileText,
  FiCalendar,
  FiEdit3
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';
import { AuthContext } from '../../Context/AuthContext.jsx';

export default function QueryToCmoPage() {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const { enquiryId } = useParams();
  const navigate = useNavigate();
  const [newQuery, setNewQuery] = useState('');
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [enquiryDetails, setEnquiryDetails] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { replace: true });
    } else {
      fetchEnquiryDetails();
      fetchQueries();
    }
  }, [user, token, enquiryId, navigate]);

  const fetchEnquiryDetails = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/enquiries/${enquiryId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEnquiryDetails(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch enquiry details:', err);
    }
  };

  const fetchQueries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/case-queries?enquiry_id=${enquiryId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to load queries (Status: ${res.status})`);
      }
      setQueries(data.data || []);
    } catch (err) {
      console.error('Fetch queries error:', err.message);
      if (err.message.includes('Token') || err.message.includes('Unauthorized')) {
        navigate('/login', { replace: true });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQueries();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) {
      setError('Query text cannot be empty');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`${baseUrl}/api/case-queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          enquiry_id: parseInt(enquiryId), 
          query_text: newQuery.trim()
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to create query (Status: ${res.status})`);
      }
      
      setNewQuery('');
      await fetchQueries();
    } catch (err) {
      console.error('Submit query error:', err.message);
      if (err.message.includes('Token') || err.message.includes('Unauthorized')) {
        navigate('/login', { replace: true });
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getQueryStatus = (query) => {
    if (query.response_text) {
      return { status: 'responded', icon: FiCheckCircle, color: 'text-green-600 bg-green-100' };
    }
    return { status: 'pending', icon: FiClock, color: 'text-yellow-600 bg-yellow-100' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
            
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FiMessageSquare className="text-blue-600" />
                  Query to CMO
                </h1>
                <p className="text-gray-600 mt-1">
                  Enquiry #{enquiryId} - {enquiryDetails?.patient_name || 'Loading...'}
                </p>
              </div>
            </div>
          
          </div>
        </div>

        {/* Enquiry Summary Card */}
        {enquiryDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiFileText className="text-blue-600" />
              Enquiry Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FiUser className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Patient</p>
                  <p className="text-sm text-gray-600">{enquiryDetails.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiFileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Medical Condition</p>
                  <p className="text-sm text-gray-600">{enquiryDetails.medical_condition || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiCalendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    enquiryDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    enquiryDetails.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    enquiryDetails.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {enquiryDetails.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Query Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiEdit3 className="text-blue-600" />
              Send New Query
            </h3>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Details *
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Please provide detailed information about your query to the CMO. Include specific questions, concerns, or clarifications needed regarding this enquiry..."
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  required
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newQuery.length}/500 characters
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !newQuery.trim()}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition shadow-md ${
                    submitting || !newQuery.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FiSend className="h-5 w-5" />
                  )}
                  {submitting ? 'Sending...' : 'Send Query'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setNewQuery('')}
                  disabled={submitting}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Query Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiMessageSquare className="text-blue-600" />
              Query Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FiMessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Queries</p>
                    <p className="text-sm text-gray-600">All queries sent</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{queries.length}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <FiClock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pending Responses</p>
                    <p className="text-sm text-gray-600">Awaiting CMO response</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {queries.filter(q => !q.response_text).length}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FiCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Responded</p>
                    <p className="text-sm text-gray-600">Queries with responses</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {queries.filter(q => q.response_text).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Query History */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiMessageSquare className="text-blue-600" />
              Query History
            </h3>
            {queries.length > 0 && (
              <span className="text-sm text-gray-500">
                {queries.length} {queries.length === 1 ? 'query' : 'queries'} found
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading queries...</span>
            </div>
          ) : queries.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No queries yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Send your first query to the CMO using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => {
                const statusInfo = getQueryStatus(query);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={query.query_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Query #{query.query_code}</h4>
                          <p className="text-sm text-gray-500">
                            Sent on {formatDate(query.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.status === 'responded' ? 'Responded' : 'Pending'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Query:</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{query.query_text}</p>
                      </div>

                      {query.response_text && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">CMO Response:</p>
                          <p className="text-gray-600 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                            {query.response_text}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Responded on {formatDate(query.responded_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}