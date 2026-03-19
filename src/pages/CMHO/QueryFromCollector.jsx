import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';
import { FiMessageSquare, FiClock, FiUser, FiSend, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../../contexts/LanguageContext';

const QueryFromCollector = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const { t, language } = useLanguage();

  // Fetch all case queries
  const fetchQueries = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/case-queries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const queryData = response.data.data || response.data || [];
      // Filter only queries raised by COLLECTOR
      const collectorQueries = (Array.isArray(queryData) ? queryData : []).filter(
        q => q.raisedBy?.role === 'COLLECTOR'
      );
      setQueries(collectorQueries);
      
    } catch (err) {
      console.error('Failed to fetch queries:', err);
      setError(`${t.failedToFetchQueries}: ` + (err.response?.data?.message || err.message));
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  // Submit response to query
  const handleSubmitResponse = async (queryId) => {
    if (!responseText.trim()) {
      setError(t.pleaseEnterResponse);
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${baseUrl}/api/case-queries/${queryId}/respond`,
        { response_text: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(t.responseSubmitted);
      setRespondingTo(null);
      setResponseText('');
      fetchQueries(); // Refresh the list
    } catch (err) {
      console.error('Failed to submit response:', err);
      setError(`${t.failedToSubmitResponse}: ` + (err.response?.data?.message || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (query) => {
    if (query.response_text) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheckCircle className="mr-1" />
          {t.responded}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FiClock className="mr-1" />
        {t.pendingResponse}
      </span>
    );
  };

  // Load queries on component mount
  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.queryFromCollector}</h1>
          {localStorage.getItem('role') === 'CMHO' && (
            <p className="text-sm text-blue-600 mt-1">
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {t.showingYourEnquiriesOnly || 'Showing only queries related to your enquiries'}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            {t.dismiss}
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
          <button
            onClick={() => setSuccess('')}
            className="ml-4 text-green-800 underline hover:text-green-900"
          >
            {t.dismiss}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t.loadingQueries}</span>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            {t.totalQueries}: {queries.length}
          </div>

          {/* Query Cards */}
          {queries.length > 0 ? (
            <div className="space-y-6">
              {queries.map((query) => (
                <div key={query.query_id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Query Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <FiMessageSquare className="text-blue-600 text-xl" />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {t.query} #{query.query_code || query.query_id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t.enquiry}: {query.enquiry?.enquiry_code || `#${query.enquiry_id}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(query)}
                  </div>

                  {/* Enquiry Details */}
                  {query.enquiry && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{t.relatedEnquiryDetails}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{t.patient}:</span> {query.enquiry.patient_name}
                        </div>
                        <div>
                          <span className="font-medium">{t.status}:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${query.enquiry.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            query.enquiry.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              query.enquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {t[query.enquiry.status?.toLowerCase()] || query.enquiry.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Query Content */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t.queryFromCollector}:</h4>
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                      <p className="text-gray-800">{query.query_text}</p>
                      <div className="flex items-center mt-3 text-sm text-gray-600">
                        <FiUser className="mr-1" />
                        <span>{t.by}: {query.raisedBy?.full_name || t.collector}</span>
                        <FiClock className="ml-4 mr-1" />
                        <span>{t.asked}: {formatDate(query.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Response Section */}
                  {query.response_text ? (
                    // Show existing response
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{t.yourResponse}:</h4>
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                        <p className="text-gray-800">{query.response_text}</p>
                        <div className="flex items-center mt-3 text-sm text-gray-600">
                          <FiUser className="mr-1" />
                          <span>{t.by}: {query.respondedBy?.full_name || t.you}</span>
                          <FiClock className="ml-4 mr-1" />
                          <span>{t.responded}: {formatDate(query.responded_at)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show response form
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{t.yourResponse}:</h4>
                      {respondingTo === query.query_id ? (
                        <div className="space-y-4">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder={t.enterResponse}
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleSubmitResponse(query.query_id)}
                              disabled={submitLoading}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                              <FiSend className="mr-2" />
                              {submitLoading ? `${t.processing}...` : t.submitResponse}
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText('');
                              }}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(query.query_id)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <FiMessageSquare className="mr-2" />
                          {t.respondToQuery}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiMessageSquare className="mx-auto text-6xl text-gray-400 mb-4" />
              <div className="text-gray-500 text-lg mb-4">
                {t.noQueriesFound}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QueryFromCollector;
