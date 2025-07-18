import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';
import { FiMessageSquare, FiClock, FiUser, FiCheckCircle, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ResponseFromCMO = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all case queries with responses
  const fetchQueries = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/case-queries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const queryData = response.data.data || response.data || [];
      // Filter to show only queries that have responses from CMO
      const queriesWithResponses = queryData.filter(query => query.response_text);
      setQueries(Array.isArray(queriesWithResponses) ? queriesWithResponses : []);
    } catch (err) {
      console.error('Failed to fetch queries:', err);
      setError('Failed to fetch responses: ' + (err.response?.data?.message || err.message));
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date
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

  // Load queries on component mount
  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Responses from CMO</h1>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading responses...</span>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            Total Responses: {queries.length}
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
                          Query #{query.query_code || query.query_id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Enquiry: {query.enquiry?.enquiry_code || `#${query.enquiry_id}`}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="mr-1" />
                      Responded
                    </span>
                  </div>

                  {/* Enquiry Details */}
                  {query.enquiry && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Related Enquiry Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Patient:</span> {query.enquiry.patient_name}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            query.enquiry.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            query.enquiry.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            query.enquiry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {query.enquiry.status}
                          </span>
                        </div>
                        <div>
                          <Link
                            to={`/sdm-dashboard/enquiry-detail-page/${query.enquiry_id}`}
                            className="flex items-center text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="mr-1" />
                            View Enquiry
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Original Query */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Your Original Query:</h4>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <p className="text-gray-800">{query.query_text}</p>
                      <div className="flex items-center mt-3 text-sm text-gray-600">
                        <FiUser className="mr-1" />
                        <span>Asked by: You</span>
                        <FiClock className="ml-4 mr-1" />
                        <span>Asked: {formatDate(query.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CMO Response */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">CMO Response:</h4>
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                      <p className="text-gray-800">{query.response_text}</p>
                      <div className="flex items-center mt-3 text-sm text-gray-600">
                        <FiUser className="mr-1" />
                        <span>By: {query.respondedBy?.full_name || 'CMO'}</span>
                        <FiClock className="ml-4 mr-1" />
                        <span>Responded: {formatDate(query.responded_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <Link
                      to={`/sdm-dashboard/enquiry-detail-page/${query.enquiry_id}`}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FiEye className="mr-2" />
                      View Full Enquiry
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiMessageSquare className="mx-auto text-6xl text-gray-400 mb-4" />
              <div className="text-gray-500 text-lg mb-4">
                No responses from CMO found
              </div>
              <p className="text-gray-400">
                Responses will appear here once CMO replies to your queries
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResponseFromCMO;