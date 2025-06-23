
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotificationStore } from './../../stores/notificationStore';

const QueryToCMOPage = () => {
  const { enquiryId } = useParams();
  const [queryText, setQueryText] = useState('');
  const navigate = useNavigate();
  const addQuery = useNotificationStore((state) => state.addQuery);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate query
    addQuery(enquiryId, queryText);
    addNotification(`Query raised for Enquiry ${enquiryId}`);
    alert(`Query raised for Enquiry ${enquiryId}`);
    navigate('/sdm');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Query to CMO - {enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Query Details</label>
          <textarea
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Enter your query or document request"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="5"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Raise Query
        </button>
      </form>
    </div>
  );
};

export default QueryToCMOPage;