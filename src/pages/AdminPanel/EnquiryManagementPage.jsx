import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../../baseUrl/baseUrl';

const STATUS_META = {
  PENDING:            { color: 'bg-yellow-100 text-yellow-800 border-yellow-200',   dot: 'bg-yellow-400',  bar: 'bg-yellow-400' },
  FORWARDED:          { color: 'bg-blue-100 text-blue-800 border-blue-200',          dot: 'bg-blue-400',    bar: 'bg-blue-400' },
  APPROVED:           { color: 'bg-green-100 text-green-800 border-green-200',       dot: 'bg-green-500',   bar: 'bg-green-500' },
  REJECTED:           { color: 'bg-red-100 text-red-800 border-red-200',             dot: 'bg-red-500',     bar: 'bg-red-500' },
  ESCALATED:          { color: 'bg-orange-100 text-orange-800 border-orange-200',    dot: 'bg-orange-500',  bar: 'bg-orange-500' },
  IN_PROGRESS:        { color: 'bg-purple-100 text-purple-800 border-purple-200',    dot: 'bg-purple-500',  bar: 'bg-purple-500' },
  COMPLETED:          { color: 'bg-gray-100 text-gray-700 border-gray-200',          dot: 'bg-gray-400',    bar: 'bg-gray-400' },
  COLLECTOR_APPROVED: { color: 'bg-teal-100 text-teal-800 border-teal-200',          dot: 'bg-teal-500',    bar: 'bg-teal-500' },
  DME_APPROVED:       { color: 'bg-indigo-100 text-indigo-800 border-indigo-200',    dot: 'bg-indigo-500',  bar: 'bg-indigo-500' },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const EnquiryManagementPage = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries]         = useState([]);
  const [districts, setDistricts]         = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [typeFilter, setTypeFilter]       = useState('ALL');
  const [toDelete, setToDelete]           = useState(null);
  const [deleting, setDeleting]           = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseUrl}/api/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.enquiries || res.data || [];
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/districts`);
      setDistricts(res.data.data || res.data || []);
    } catch {}
  };

  useEffect(() => { fetchEnquiries(); fetchDistricts(); }, []);

  useEffect(() => {
    let f = enquiries;
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(e =>
        e.patient_name?.toLowerCase().includes(q) ||
        e.enquiry_code?.toLowerCase().includes(q) ||
        e.contact_phone?.includes(search) ||
        String(e.enquiry_id).includes(search)
      );
    }
    if (statusFilter !== 'ALL')   f = f.filter(e => e.status === statusFilter);
    if (districtFilter !== 'ALL') f = f.filter(e => String(e.district_id) === districtFilter);
    if (typeFilter !== 'ALL')     f = f.filter(e => e.air_transport_type === typeFilter);
    setFiltered(f);
  }, [enquiries, search, statusFilter, districtFilter, typeFilter]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/enquiries/${toDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnquiries(prev => prev.filter(e => e.enquiry_id !== toDelete));
      setToDelete(null);
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally { setDeleting(false); }
  };

  // Stats
  const stats = {
    total: enquiries.length,
    pending: enquiries.filter(e => e.status === 'PENDING').length,
    approved: enquiries.filter(e => ['APPROVED','DME_APPROVED','COLLECTOR_APPROVED'].includes(e.status)).length,
    escalated: enquiries.filter(e => e.status === 'ESCALATED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Delete modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
            <h3 className="text-center font-black text-gray-900 mb-2">Delete Enquiry #{toDelete}?</h3>
            <p className="text-center text-gray-500 text-sm mb-6">This will permanently remove the enquiry and all related records.</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-black rounded-xl hover:bg-gray-200 transition-all text-sm uppercase tracking-widest">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all text-sm uppercase tracking-widest disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Enquiry Management</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">{filtered.length} of {enquiries.length} records</p>
        </div>
        <button onClick={fetchEnquiries} className="px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
          ↻ Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-600', text: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-400', text: 'text-yellow-900' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-500', text: 'text-white' },
          { label: 'Escalated', value: stats.escalated, color: 'bg-orange-500', text: 'text-white' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 shadow-sm`}>
            <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.text} opacity-80`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Search name, code, phone, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="md:col-span-2 p-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none transition-all"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="p-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none bg-white">
          <option value="ALL">All Statuses</option>
          {Object.keys(STATUS_META).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
          className="p-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none bg-white">
          <option value="ALL">All Districts</option>
          {districts.map(d => <option key={d.district_id} value={String(d.district_id)}>{d.district_name}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); fetchEnquiries(); }} className="text-red-800 underline text-xs font-bold ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium text-sm">Loading enquiries...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold uppercase text-sm tracking-widest">No enquiries match your filters</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(enq => (
            <EnquiryCard
              key={enq.enquiry_id}
              enquiry={enq}
              onDelete={() => setToDelete(enq.enquiry_id)}
              onDetail={() => navigate(`/admin/enquiry-detail/${enq.enquiry_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const EnquiryCard = ({ enquiry: e, onDelete, onDetail }) => {
  const meta = STATUS_META[e.status] || { bar: 'bg-gray-300', color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  const docCount = e.documents?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Status bar top */}
      <div className={`h-1 w-full ${meta.bar}`} />

      <div className="p-5">
        {/* Row 1: ID + Patient + Status + Type + Actions */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-100">
              {e.patient_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-gray-900 text-base leading-tight">{e.patient_name || 'Unknown'}</h3>
                <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{e.enquiry_code}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">ID #{e.enquiry_id} · {fmt(e.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={e.status} />
            {e.air_transport_type && (
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                e.air_transport_type === 'Paid'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                {e.air_transport_type}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <InfoCell icon="🏥" label="Source Hospital" value={e.sourceHospital?.name} />
          <InfoCell icon="🎯" label="Destination" value={e.hospital?.name} />
          <InfoCell icon="📍" label="District" value={e.district?.district_name} />
          <InfoCell icon="🩺" label="Medical Condition" value={e.medical_condition} />
          <InfoCell icon="👤" label="Contact" value={e.contact_name} />
          <InfoCell icon="📞" label="Phone" value={e.contact_phone} />
          <InfoCell icon="✉️" label="Email" value={e.contact_email} />
          <InfoCell icon="🚁" label="Transport Category" value={e.transportation_category} />
        </div>

        {/* Row 3: Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {docCount > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                📎 {docCount} document{docCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">No documents</span>
            )}
            {e.vitals && (
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                e.vitals === 'Stable'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                ❤️ {e.vitals}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
            >
              Delete
            </button>
            <button
              onClick={onDetail}
              className="px-4 py-1.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-1"
            >
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCell = ({ icon, label, value }) => (
  <div className="min-w-0">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{icon} {label}</p>
    <p className="text-xs font-semibold text-gray-700 truncate">{value || '—'}</p>
  </div>
);

export default EnquiryManagementPage;
