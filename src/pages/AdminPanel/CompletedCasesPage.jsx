import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const COLS = [
  { label: 'Enquiry Code',     w: '140px' },
  { label: 'Patient',          w: '160px' },
  { label: 'Medical Condition',w: '180px' },
  { label: 'Source Hospital',  w: '180px' },
  { label: 'Destination',      w: '180px' },
  { label: 'District',         w: '110px' },
  { label: 'Transport',        w: '90px'  },
  { label: 'Contact',          w: '140px' },
  { label: 'Completed On',     w: '120px' },
  { label: 'Action',           w: '90px'  },
];

const CompletedCasesPage = () => {
  const navigate = useNavigate();
  const [cases, setCases]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCases((res.data.data || []).filter(e => e.status === 'COMPLETED'));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = cases.filter(e => {
    const q = search.toLowerCase();
    return !q ||
      e.patient_name?.toLowerCase().includes(q) ||
      e.enquiry_code?.toLowerCase().includes(q) ||
      e.contact_phone?.includes(q) ||
      e.district?.district_name?.toLowerCase().includes(q) ||
      e.medical_condition?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-green-100">🏁</span>
            Completed Cases
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">
            {filtered.length} case{filtered.length !== 1 ? 's' : ''} · All flights successfully concluded
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-green-600 text-white rounded-2xl shadow-md shadow-green-100">
            <p className="text-2xl font-black leading-none">{cases.length}</p>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-0.5">Total Completed</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3">
        <input
          type="text"
          placeholder="Search by patient, code, phone, district, condition..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-green-400 focus:outline-none transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="px-4 py-2 bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-500 text-sm font-medium">Loading completed cases...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏁</div>
            <p className="text-gray-400 font-bold uppercase text-sm tracking-widest">
              {search ? 'No cases match your search' : 'No completed cases yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1200px' }}>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-green-50 border-b border-gray-100">
                  {COLS.map(c => (
                    <th key={c.label} style={{ minWidth: c.w }}
                      className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e, idx) => (
                  <tr key={e.enquiry_id}
                    className={`hover:bg-green-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>

                    {/* Enquiry Code */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <div>
                          <p className="text-sm font-black font-mono text-blue-700">{e.enquiry_code}</p>
                          <p className="text-[9px] text-gray-400 font-mono">#{e.enquiry_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-900">{e.patient_name}</p>
                      {e.father_spouse_name && (
                        <p className="text-[9px] text-gray-400">S/o {e.father_spouse_name}</p>
                      )}
                    </td>

                    {/* Medical Condition */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs text-gray-700 font-medium">{e.medical_condition || '—'}</p>
                      {e.vitals && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
                          e.vitals === 'Stable' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>❤️ {e.vitals}</span>
                      )}
                    </td>

                    {/* Source Hospital */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs text-gray-600 font-medium">{e.sourceHospital?.name || '—'}</p>
                    </td>

                    {/* Destination */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-bold text-gray-800">{e.hospital?.name || '—'}</p>
                    </td>

                    {/* District */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-semibold text-gray-700">{e.district?.district_name || '—'}</p>
                    </td>

                    {/* Transport */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                        e.air_transport_type === 'Paid'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>{e.air_transport_type || '—'}</span>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-bold text-gray-700">{e.contact_name || '—'}</p>
                      <p className="text-[9px] text-gray-400 font-mono">{e.contact_phone || ''}</p>
                    </td>

                    {/* Completed On */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-semibold text-gray-700">{fmtDate(e.updated_at)}</p>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/enquiry-detail/${e.enquiry_id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-900 transition-all shadow-sm whitespace-nowrap">
                        Details →
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Showing {filtered.length} of {cases.length} completed cases
            </p>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> All Completed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedCasesPage;
