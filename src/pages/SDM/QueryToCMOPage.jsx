import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiClipboard } from 'react-icons/fi';
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

  useEffect(() => {
    console.log('QueryToCmoPage - Auth state:', { user, token, enquiryId });
    if (!user || !token) {
      console.log('Redirecting to /: Missing user or token');
      navigate('/', { replace: true });
    } else {
      fetchQueries();
    }
  }, [user, token, enquiryId, navigate]);

  const fetchQueries = async () => {
    setError(null);
    try {
      console.log('Fetching queries for:', { enquiryId, token });
      const res = await fetch(`${baseUrl}/api/case-queries?enquiry_id=${enquiryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetch response:', { status: res.status, statusText: res.statusText });
      const data = await res.json();
      console.log('Fetch data:', data);
      if (!res.ok) {
        throw new Error(data.message || `Failed to load queries (Status: ${res.status})`);
      }
      setQueries(data.data || []);
    } catch (err) {
      console.error('Fetch queries error:', err.message);
      if (err.message.includes('Token') || err.message.includes('Unauthorized')) {
        console.log('Redirecting to /login: Invalid token');
        navigate('/login', { replace: true });
      } else {
        setError(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) {
      setError('Query text cannot be empty');
      return;
    }
    setError(null);
    try {
      console.log('Submitting query:', { enquiry_id: parseInt(enquiryId), query_text: newQuery, token });
      const res = await fetch(`${baseUrl}/api/case-queries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enquiry_id: parseInt(enquiryId), query_text: newQuery }),
      });
      console.log('Submit response:', { status: res.status, statusText: res.statusText });
      const data = await res.json();
      console.log('Submit data:', data);
      if (!res.ok) {
        throw new Error(data.message || `Failed to create query (Status: ${res.status})`);
      }
      setNewQuery('');
      fetchQueries();
    } catch (err) {
      console.error('Submit query error:', err.message);
      if (err.message.includes('Token') || err.message.includes('Unauthorized')) {
        console.log('Redirecting to /login: Invalid token');
        navigate('/login', { replace: true });
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Queries to CMO - Enquiry #{enquiryId}</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full p-3 border rounded-lg mb-2"
          rows={4}
          placeholder="Write your query here..."
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          required
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiSend className="h-5 w-5" /> Send Query
        </button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Past Queries</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Code</th>
              <th className="border px-3 py-2 text-left">Query</th>
              <th className="border px-3 py-2 text-left">Response</th>
              <th className="border px-3 py-2 text-left">Raised At</th>
              <th className="border px-3 py-2 text-left">Responded At</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((q) => (
              <tr key={q.query_id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{q.query_code}</td>
                <td className="border px-3 py-2">{q.query_text}</td>
                <td className="border px-3 py-2">{q.response_text || '—'}</td>
                <td className="border px-3 py-2">{new Date(q.created_at).toLocaleString()}</td>
                <td className="border px-3 py-2">{q.responded_at ? new Date(q.responded_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}