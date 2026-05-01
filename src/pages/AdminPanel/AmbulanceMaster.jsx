import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiXCircle,
  FiTool, FiAlertTriangle, FiRefreshCw, FiMapPin,
  FiSettings, FiActivity, FiSearch,
} from 'react-icons/fi';
import baseUrl from '../../baseUrl/baseUrl';

const STATUS_META = {
  AVAILABLE:      { color: 'bg-green-100 text-green-800 border-green-200',  dot: 'bg-green-500',  icon: <FiCheckCircle size={12} />, label: '✅ Available' },
  IN_USE:         { color: 'bg-blue-100 text-blue-800 border-blue-200',     dot: 'bg-blue-500',   icon: <FiActivity size={12} />,    label: '🚁 In Use' },
  MAINTENANCE:    { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500', icon: <FiTool size={12} />,       label: '🔧 Maintenance' },
  OUT_OF_SERVICE: { color: 'bg-red-100 text-red-800 border-red-200',        dot: 'bg-red-500',    icon: <FiXCircle size={12} />,     label: '❌ Out of Service' },
};

const AIRCRAFT_TYPES = [
  'Helicopter - Bell 429', 'Helicopter - Bell 407', 'Helicopter - Airbus H145',
  'Fixed Wing - Beechcraft King Air', 'Fixed Wing - Cessna Citation', 'Fixed Wing - Piper Cheyenne',
];

const EMPTY_FORM = { ambulance_id: '', aircraft_type: '', registration_number: '', contact_number: '', base_location: '', status: 'AVAILABLE' };

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', icon: null };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const AmbulanceMaster = () => {
  const [list, setList]         = useState([]);
  const [stats, setStats]       = useState({});
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [toDelete, setToDelete] = useState(null);

  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchList = async () => {
    setLoading(true);
    try {
      // fetch all — pass large limit to bypass default pagination of 10
      const res  = await fetch(`${baseUrl}/api/ambulances?limit=500`, { headers: h });
      const data = await res.json();
      const items = data.data || [];
      setList(items);
    } catch { setError('Failed to load ambulances'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${baseUrl}/api/ambulances/stats`, { headers: h });
      const data = await res.json();
      setStats(data.data || {});
    } catch {}
  };

  useEffect(() => { fetchList(); fetchStats(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(list.filter(a =>
      !q ||
      a.registration_number?.toLowerCase().includes(q) ||
      a.ambulance_id?.toLowerCase().includes(q) ||
      a.aircraft_type?.toLowerCase().includes(q) ||
      a.base_location?.toLowerCase().includes(q) ||
      a.contact_number?.includes(q)
    ));
  }, [search, list]);

  // Clear success after 3s
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); }
  }, [success]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setError(''); setShowModal(true); };
  const openEdit = (a) => {
    setForm({ ambulance_id: a.ambulance_id, aircraft_type: a.aircraft_type, registration_number: a.registration_number, contact_number: a.contact_number || '', base_location: a.base_location, status: a.status });
    setEditingId(a.ambulance_id);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const url    = editingId ? `${baseUrl}/api/ambulances/${editingId}` : `${baseUrl}/api/ambulances`;
      const method = editingId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: h, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setSuccess(editingId ? 'Ambulance updated' : 'Ambulance added');
      setShowModal(false);
      fetchList(); fetchStats();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(toDelete);
    try {
      const res  = await fetch(`${baseUrl}/api/ambulances/${toDelete}`, { method: 'DELETE', headers: h });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Ambulance deleted');
      setToDelete(null);
      fetchList(); fetchStats();
    } catch (err) { setError(err.message); setToDelete(null); }
    finally { setDeleting(null); }
  };

  const quickStatus = async (id, status) => {
    try {
      const res  = await fetch(`${baseUrl}/api/ambulances/${id}/status`, { method: 'PATCH', headers: h, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(`Status → ${status.replace(/_/g, ' ')}`);
      fetchList(); fetchStats();
    } catch (err) { setError(err.message); }
  };

  const sb = stats.statusBreakdown || {};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5">

      {/* Delete confirm modal */}
      {toDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
            <h3 className="font-black text-gray-900 mb-2">Delete Ambulance?</h3>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone. Active assignments will block deletion.</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200">Cancel</button>
              <button onClick={handleDelete} disabled={!!deleting} className="flex-1 py-2.5 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">🚁</div>
                <h3 className="text-white font-black text-base uppercase tracking-tight">
                  {editingId ? 'Edit Ambulance' : 'Add New Ambulance'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-all text-xl font-black">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
                  <FiAlertTriangle className="shrink-0" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Ambulance ID *" hint="Format: AA-001">
                  <input name="ambulance_id" value={form.ambulance_id} onChange={e => setForm(f => ({ ...f, ambulance_id: e.target.value }))}
                    required disabled={!!editingId} placeholder="AA-001"
                    className={`w-full p-3 border-2 rounded-xl text-sm font-mono font-bold focus:border-blue-500 focus:outline-none transition-all ${editingId ? 'bg-gray-100 opacity-60' : 'border-gray-100'}`} />
                </Field>

                <Field label="Aircraft Type *">
                  <select name="aircraft_type" value={form.aircraft_type} onChange={e => setForm(f => ({ ...f, aircraft_type: e.target.value }))}
                    required className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none bg-white transition-all">
                    <option value="">Select type...</option>
                    {AIRCRAFT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <Field label="Registration Number *">
                  <input name="registration_number" value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value.toUpperCase() }))}
                    required placeholder="VT-ABC001"
                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-mono font-bold uppercase focus:border-blue-500 focus:outline-none transition-all" />
                </Field>

                <Field label="Contact Number">
                  <input name="contact_number" value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))}
                    placeholder="10-digit number" maxLength={15}
                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none transition-all" />
                </Field>

                <Field label="Base Location *">
                  <input name="base_location" value={form.base_location} onChange={e => setForm(f => ({ ...f, base_location: e.target.value }))}
                    required placeholder="e.g. Bhopal Airport"
                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none transition-all" />
                </Field>

                <Field label="Status">
                  <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 focus:outline-none bg-white transition-all">
                    {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : (editingId ? '✓ Update' : '+ Add Ambulance')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Ambulance Master</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-0.5">Manage air ambulance fleet</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchList(); fetchStats(); }} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={13} /> Refresh
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
            <FiPlus size={13} /> Add Ambulance
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
          <FiAlertTriangle className="shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto font-black opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <FiCheckCircle className="shrink-0" /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Available',      value: sb.AVAILABLE || 0,      color: 'bg-green-600',  icon: '✅' },
          { label: 'In Use',         value: sb.IN_USE || 0,         color: 'bg-blue-600',   icon: '🚁' },
          { label: 'Maintenance',    value: sb.MAINTENANCE || 0,    color: 'bg-yellow-500', icon: '🔧' },
          { label: 'Out of Service', value: sb.OUT_OF_SERVICE || 0, color: 'bg-red-600',    icon: '❌' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-white shadow-sm`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">{s.icon} {s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <span className="font-black text-gray-900 text-sm uppercase tracking-tight">
            Fleet ({filtered.length})
          </span>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-blue-500 focus:outline-none w-52 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 text-sm font-medium">Loading fleet...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-bold uppercase text-sm tracking-widest">
              🚁 No ambulances found
            </div>
          ) : (
            <table className="w-full" style={{ minWidth: '800px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Aircraft Type', 'Reg. Number', 'Contact', 'Base Location', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.ambulance_id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-black font-mono text-gray-800">{a.ambulance_id}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-700">{a.aircraft_type}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-black font-mono text-blue-700 uppercase tracking-wider">{a.registration_number}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.contact_number
                        ? <span className="text-xs text-gray-600 font-mono">{a.contact_number}</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                        <FiMapPin size={11} className="text-gray-400" /> {a.base_location}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(a)} title="Edit"
                          className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                          <FiEdit size={12} />
                        </button>
                        {a.status === 'AVAILABLE' && (
                          <button onClick={() => quickStatus(a.ambulance_id, 'MAINTENANCE')} title="Set Maintenance"
                            className="w-7 h-7 flex items-center justify-center bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white transition-all">
                            <FiTool size={12} />
                          </button>
                        )}
                        {a.status === 'MAINTENANCE' && (
                          <button onClick={() => quickStatus(a.ambulance_id, 'AVAILABLE')} title="Set Available"
                            className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all">
                            <FiCheckCircle size={12} />
                          </button>
                        )}
                        <button onClick={() => setToDelete(a.ambulance_id)} title="Delete"
                          className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-[9px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

export default AmbulanceMaster;
