import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import baseUrl from '../../baseUrl/baseUrl';

const DMEQueryToCMHO = () => {
  const { enquiryId } = useParams();
  const [queryText, setQueryText] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enquiry_id: enquiryId, query_text: queryText, from_role: 'DME', to_role: 'CMHO' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send query');
      setStatus('Query sent successfully.');
      setTimeout(() => navigate('/dme-dashboard/case-files'), 1500);
    } catch (err) {
      setStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Query to CMHO - Enquiry #{enquiryId}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Query</label>
          <textarea value={queryText} onChange={e => setQueryText(e.target.value)}
            placeholder="Enter your query for CMHO..."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
            rows="5" required />
        </div>
        {status && <p className={`text-sm ${status.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{status}</p>}
        <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700 disabled:opacity-60">
          {loading ? 'Sending...' : 'Send Query'}
        </button>
      </form>
    </div>
  );
};

export default DMEQueryToCMHO;
