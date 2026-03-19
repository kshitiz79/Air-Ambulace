// DME Approval/Rejection — reuses DM logic, different base route
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaEye, FaSyncAlt } from 'react-icons/fa';
import baseUrl from '../../baseUrl/baseUrl';
import { useLanguage } from '../../contexts/LanguageContext';

const DMEApprovalRejection = () => {
  const { t, localize } = useLanguage();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/enquiries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEnquiries((data.data || []).filter(e => ['PENDING', 'FORWARDED'].includes(e.status)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const res = await fetch(`${baseUrl}/api/enquiries/${id}/approve-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEnquiries(prev => prev.filter(e => e.enquiry_id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">{t.loadingQueries || 'Loading...'}</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 uppercase">{t.approvalRejection || 'Approval / Rejection'}</h1>
        <button onClick={fetchEnquiries} className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
          <FaSyncAlt className="mr-2" />{t.refresh || 'Refresh'}
        </button>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">No pending cases for review.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Enquiry Code', 'Patient', 'Status', 'Hospital', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {enquiries.map(enq => {
                const e = localize(enq);
                return (
                  <tr key={enq.enquiry_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{enq.enquiry_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.patient_name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{enq.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900">{enq.hospital?.name || 'N/A'}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Link to={`/dme-dashboard/case-file/${enq.enquiry_id}`} className="text-teal-600 hover:text-teal-800 text-sm"><FaEye className="inline mr-1" />View</Link>
                      <button onClick={() => handleAction(enq.enquiry_id, 'APPROVE')} disabled={!!actionLoading} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1">
                        <FaCheck />{t.approve || 'Approve'}
                      </button>
                      <button onClick={() => handleAction(enq.enquiry_id, 'REJECT')} disabled={!!actionLoading} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1">
                        <FaTimes />{t.reject || 'Reject'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DMEApprovalRejection;
