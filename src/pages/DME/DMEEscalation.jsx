import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaEye, FaCheckCircle, FaClock, FaFileAlt, FaSyncAlt, FaUser, FaCalendarAlt } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';

const DMEEscalation = () => {
  const [escalatedCases, setEscalatedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: 'ALL', search: '' });
  const [resolving, setResolving] = useState(null);

  const fetchEscalatedCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const enquiriesRes = await fetch(`${baseUrl}/api/enquiries`, { headers: { Authorization: `Bearer ${token}` } });
      if (!enquiriesRes.ok) throw new Error('Failed to fetch enquiries');
      const enquiriesData = await enquiriesRes.json();
      const escalated = (enquiriesData.data || []).filter(e => e.status === 'ESCALATED');

      const escalationsRes = await fetch(`${baseUrl}/api/case-escalations`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ ok: false }));
      let escalationsData = [];
      if (escalationsRes.ok) { const d = await escalationsRes.json(); escalationsData = d.data || []; }

      setEscalatedCases(escalated.map(enq => ({
        ...enq,
        escalation_details: escalationsData.find(esc => esc.enquiry_id === enq.enquiry_id) || null
      })));
      setError('');
    } catch (err) {
      setError('Failed to load escalated cases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEscalatedCases(); }, []);

  const handleResolve = async (escalationId) => {
    if (!window.confirm('Mark this escalation as resolved?')) return;
    try {
      setResolving(escalationId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/api/case-escalations/${escalationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'RESOLVED', resolved_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to resolve');
      await fetchEscalatedCases();
    } catch (err) {
      alert('Failed to resolve: ' + err.message);
    } finally {
      setResolving(null);
    }
  };

  const filtered = escalatedCases.filter(c => {
    const matchStatus = filter.status === 'ALL' || (filter.status === 'PENDING' && c.escalation_details?.status === 'PENDING') || (filter.status === 'RESOLVED' && c.escalation_details?.status === 'RESOLVED');
    const matchSearch = !filter.search || c.patient_name?.toLowerCase().includes(filter.search.toLowerCase()) || c.enquiry_code?.toLowerCase().includes(filter.search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const stats = { total: escalatedCases.length, pending: escalatedCases.filter(c => c.escalation_details?.status === 'PENDING').length, resolved: escalatedCases.filter(c => c.escalation_details?.status === 'RESOLVED').length };

  if (loading) return <div className="max-w-7xl mx-auto p-6 text-center text-gray-600">Loading escalated cases...</div>;
  if (error) return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button onClick={fetchEscalatedCases} className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center"><FaExclamationTriangle className="mr-3 text-red-600" />Escalated Cases</h1>
          <p className="mt-1 text-gray-600">Review and manage escalated enquiries</p>
        </div>
        <button onClick={fetchEscalatedCases} className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
          <FaSyncAlt className="mr-2" />Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Escalated', value: stats.total, from: 'from-blue-500', to: 'to-blue-600', icon: <FaFileAlt className="text-2xl" /> },
          { label: 'Pending Resolution', value: stats.pending, from: 'from-red-500', to: 'to-red-600', icon: <FaClock className="text-2xl" /> },
          { label: 'Resolved', value: stats.resolved, from: 'from-green-500', to: 'to-green-600', icon: <FaCheckCircle className="text-2xl" /> },
        ].map(({ label, value, from, to, icon }) => (
          <div key={label} className={`bg-gradient-to-r ${from} ${to} rounded-lg shadow-sm p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div><p className="text-white/80 text-sm font-medium">{label}</p><p className="text-3xl font-bold">{value}</p></div>
              <div className="bg-white/20 rounded-full p-3">{icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input type="text" placeholder="Search by patient name or enquiry code..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Escalated Cases ({filtered.length})</h2>
        </div>
        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No escalated cases found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map(c => (
                <div key={c.enquiry_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{c.patient_name}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">ESCALATED</span>
                        {c.escalation_details && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.escalation_details.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.escalation_details.status}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Enquiry Code: {c.enquiry_code || `ENQ${c.enquiry_id}`}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/dme-dashboard/case-file/${c.enquiry_id}`} className="flex items-center px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition">
                        <FaEye className="mr-1" />View Details
                      </Link>
                      {c.escalation_details?.status === 'PENDING' && (
                        <button onClick={() => handleResolve(c.escalation_details.escalation_id)} disabled={resolving === c.escalation_details.escalation_id}
                          className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50">
                          <FaCheckCircle className="mr-1" />{resolving === c.escalation_details.escalation_id ? 'Resolving...' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>
                  </div>
                  {c.escalation_details && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2"><FaUser className="text-gray-500" /><span className="text-sm"><span className="font-medium">Escalated To:</span> {c.escalation_details.escalated_to}</span></div>
                      <div className="flex items-center space-x-2"><FaCalendarAlt className="text-gray-500" /><span className="text-sm"><span className="font-medium">Escalated On:</span> {formatDate(c.escalation_details.created_at)}</span></div>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="font-medium text-gray-600">Medical Condition:</span><p className="text-gray-900">{c.medical_condition}</p></div>
                    <div><span className="font-medium text-gray-600">Hospital:</span><p className="text-gray-900">{c.hospital?.name || 'N/A'}</p></div>
                    <div><span className="font-medium text-gray-600">Contact:</span><p className="text-gray-900">{c.contact_phone}</p></div>
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

export default DMEEscalation;
