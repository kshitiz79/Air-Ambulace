import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import baseUrl from '../../baseUrl/baseUrl';

const STATUS_META = {
  PENDING:           { color: 'bg-yellow-100 text-yellow-800 border-yellow-200',  dot: 'bg-yellow-400' },
  FORWARDED:         { color: 'bg-blue-100 text-blue-800 border-blue-200',         dot: 'bg-blue-400' },
  APPROVED:          { color: 'bg-green-100 text-green-800 border-green-200',      dot: 'bg-green-500' },
  REJECTED:          { color: 'bg-red-100 text-red-800 border-red-200',            dot: 'bg-red-500' },
  ESCALATED:         { color: 'bg-orange-100 text-orange-800 border-orange-200',   dot: 'bg-orange-500' },
  IN_PROGRESS:       { color: 'bg-purple-100 text-purple-800 border-purple-200',   dot: 'bg-purple-500' },
  COMPLETED:         { color: 'bg-gray-100 text-gray-700 border-gray-200',         dot: 'bg-gray-400' },
  COLLECTOR_APPROVED:{ color: 'bg-teal-100 text-teal-800 border-teal-200',         dot: 'bg-teal-500' },
  DME_APPROVED:      { color: 'bg-indigo-100 text-indigo-800 border-indigo-200',   dot: 'bg-indigo-500' },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// Document viewer modal
const DocModal = ({ docs, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Documents ({docs.length})</h3>
        <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all text-gray-500 font-bold">✕</button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {docs.map((doc, i) => (
          <a
            key={doc.document_id || i}
            href={doc.file_path?.startsWith('http') ? doc.file_path : `${baseUrl}/${doc.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all group"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm shrink-0">
              {doc.document_type === 'MEDICAL_REPORT' ? '🩺' : doc.document_type === 'AYUSHMAN_CARD' ? '💳' : '📄'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{doc.document_type?.replace(/_/g, ' ')}</p>
              <p className="text-xs text-blue-600 group-hover:underline truncate">{doc.file_path?.split('/').pop()}</p>
            </div>
            <span className="text-gray-400 group-hover:text-blue-600 text-xs">↗</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const AlertsPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [docModal, setDocModal] = useState(null); // docs array
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/api/enquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnquiries(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch enquiries');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = enquiries.filter(e => {
    const matchSearch = !search ||
      e.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.enquiry_code?.toLowerCase().includes(search.toLowerCase()) ||
      e.contact_phone?.includes(search) ||
      String(e.enquiry_id).includes(search);
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {docModal && <DocModal docs={docModal} onClose={() => setDocModal(null)} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Enquiry Alerts</h1>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Live feed · {filtered.length} records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, code, phone, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none transition-all"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none bg-white min-w-[160px]"
        >
          <option value="ALL">All Statuses</option>
          {Object.keys(STATUS_META).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium text-sm">Loading...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold uppercase text-sm tracking-widest">No enquiries found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: '1100px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    { label: 'ID / Code',           w: '110px' },
                    { label: 'Patient',              w: '160px' },
                    { label: 'Medical Condition',    w: '180px' },
                    { label: 'Status',               w: '150px' },
                    { label: 'Source Hospital',      w: '180px' },
                    { label: 'Destination Hospital', w: '180px' },
                    { label: 'District',             w: '120px' },
                    { label: 'Contact Name',         w: '140px' },
                    { label: 'Phone',                w: '120px' },
                    { label: 'Docs',                 w: '70px'  },
                  ].map(h => (
                    <th
                      key={h.label}
                      style={{ minWidth: h.w }}
                      className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(enq => {
                  const isExpanded = expandedRow === enq.enquiry_id;
                  const docCount = enq.documents?.length || 0;
                  return (
                    <React.Fragment key={enq.enquiry_id}>
                      <tr
                        className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/40' : ''}`}
                        onClick={() => setExpandedRow(isExpanded ? null : enq.enquiry_id)}
                      >
                        {/* ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-black text-gray-800">#{enq.enquiry_id}</span>
                          <br />
                          <span className="text-[9px] text-gray-400 font-mono">{enq.enquiry_code}</span>
                        </td>

                        {/* Patient */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">{enq.patient_name || '—'}</span>
                        </td>

                        {/* Medical Condition */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-600">{enq.medical_condition || '—'}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={enq.status} />
                        </td>

                        {/* Source Hospital */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-600">{enq.sourceHospital?.name || '—'}</span>
                        </td>

                        {/* Destination Hospital */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-800">{enq.hospital?.name || '—'}</span>
                        </td>

                        {/* District */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-700 font-medium">{enq.district?.district_name || '—'}</span>
                        </td>

                        {/* Contact Name */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-bold text-gray-700">{enq.contact_name || '—'}</span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-gray-600 font-mono">{enq.contact_phone || '—'}</span>
                        </td>

                        {/* Docs */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {docCount > 0 ? (
                            <button
                              onClick={ev => { ev.stopPropagation(); setDocModal(enq.documents); }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                            >
                              📎 {docCount}
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs font-bold">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="bg-blue-50/30 border-t border-blue-100 px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Detail label="Air Transport"          value={enq.air_transport_type} />
                              <Detail label="Transport Category"     value={enq.transportation_category} />
                              <Detail label="Vitals"                 value={enq.vitals} />
                              <Detail label="Contact Email"          value={enq.contact_email} />
                              <Detail label="Referring Physician"    value={enq.referring_physician_name} />
                              <Detail label="Recommending Authority" value={enq.recommending_authority_name} />
                              <Detail label="Ambulance Reg."         value={enq.ambulance_registration_number} />
                              <Detail label="Created"                value={enq.created_at ? new Date(enq.created_at).toLocaleString('en-IN') : null} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-xs font-semibold text-gray-700 mt-0.5">{value || '—'}</p>
  </div>
);

export default AlertsPage;
