import React, { useState, useEffect } from 'react';
import {
  FaAmbulance, FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaSyncAlt, FaExclamationTriangle, FaSearch, FaPhone,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const STATUSES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'];
const STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  IN_USE: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
};

const empty = { ambulance_id: '', aircraft_type: '', registration_number: '', contact_number: '', base_location: '', status: 'AVAILABLE' };

const AmbulanceMaster = () => {
  const styles = useThemeStyles();
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('list');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/ambulances`, { headers });
      const data = await res.json();
      const items = data.data || [];
      setList(items);
      setFiltered(items);
    } catch (err) {
      setError('Failed to load ambulances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(list.filter(a =>
      a.registration_number?.toLowerCase().includes(q) ||
      a.ambulance_id?.toLowerCase().includes(q) ||
      a.aircraft_type?.toLowerCase().includes(q) ||
      a.base_location?.toLowerCase().includes(q) ||
      a.contact_number?.includes(q)
    ));
  }, [search, list]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      const url = editing ? `${baseUrl}/api/ambulances/${editing}` : `${baseUrl}/api/ambulances`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setSuccess(editing ? 'Ambulance updated successfully' : 'Ambulance added successfully');
      setForm(empty); setEditing(null); setTab('list');
      fetchList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (a) => {
    setForm({
      ambulance_id: a.ambulance_id,
      aircraft_type: a.aircraft_type,
      registration_number: a.registration_number,
      contact_number: a.contact_number || '',
      base_location: a.base_location,
      status: a.status,
    });
    setEditing(a.ambulance_id);
    setTab('form');
    setError(''); setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ambulance?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${baseUrl}/api/ambulances/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Deleted successfully');
      fetchList();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => { setForm(empty); setEditing(null); setTab('list'); setError(''); setSuccess(''); };

  const userRole = localStorage.getItem('role');
  const isReadOnly = userRole === 'CMHO' || userRole === 'SERVICE_PROVIDER';

  return (
    <div className={`max-w-6xl mx-auto p-6 ${styles.pageBackground}`}>
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6 px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${styles.primaryText} flex items-center`}>
          {isReadOnly ? 'Air Ambulance Fleet/ Avalibllity Status' : 'AirAmbulance Master'}
            </h1>
            <p className={`${styles.secondaryText} text-sm mt-1`}>
              {isReadOnly ? 'View ambulance fleet status and registration details' : 'Manage ambulance fleet — registration numbers and contact details'}
            </p>
          </div>
          <div className="flex gap-3">
           
            {!isReadOnly && (
              <button onClick={() => { setForm(empty); setEditing(null); setTab('form'); setError(''); setSuccess(''); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                <FaPlus className="mr-2" /> Add Ambulance
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center text-sm"><FaExclamationTriangle className="mr-2" />{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

      {tab === 'form' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
          <h2 className={`text-lg font-semibold ${styles.primaryText} mb-4`}>{editing ? 'Edit Ambulance' : 'Add New Ambulance'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Ambulance ID *</label>
              <input name="ambulance_id" value={form.ambulance_id} onChange={handleChange} required disabled={!!editing}
                placeholder="AA-001" className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground} ${editing ? 'opacity-60' : ''}`} />
              <p className="text-xs text-gray-400 mt-0.5">Format: AA-001, AA-002...</p>
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Aircraft Type *</label>
              <input name="aircraft_type" value={form.aircraft_type} onChange={handleChange} required
                placeholder="e.g. Beechcraft King Air 200" className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Registration Number *</label>
              <input name="registration_number" value={form.registration_number} onChange={handleChange} required
                placeholder="e.g. VT-ABC" className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground} uppercase`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Contact Number</label>
              <input name="contact_number" value={form.contact_number} onChange={handleChange}
                placeholder="10-digit mobile number" maxLength={15} className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Base Location *</label>
              <input name="base_location" value={form.base_location} onChange={handleChange} required
                placeholder="e.g. Raipur" className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
                <FaSave className="mr-2" />{saving ? 'Saving...' : (editing ? 'Update' : 'Save')}
              </button>
              <button type="button" onClick={handleCancel} className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition">
                <FaTimes className="mr-2" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
          <h2 className={`font-semibold ${styles.primaryText}`}>Ambulance Fleet ({filtered.length})</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className={`pl-8 pr-3 py-2 border rounded-lg text-sm ${styles.inputBackground} w-56`} />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center"><div className="animate-spin w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div></div>
          ) : filtered.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}><FaAmbulance className="mx-auto text-4xl mb-3 text-gray-300" /><p>No ambulances found.</p></div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  {['ID', 'Aircraft Type', 'Reg. Number', 'Contact', 'Base Location', 'Status', !isReadOnly && 'Actions'].filter(Boolean).map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {filtered.map(a => (
                  <tr key={a.ambulance_id} className={styles.tableRow}>
                    <td className={`px-4 py-3 text-sm font-mono font-bold ${styles.primaryText}`}>{a.ambulance_id}</td>
                    <td className={`px-4 py-3 text-sm ${styles.primaryText}`}>{a.aircraft_type}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-blue-700 uppercase tracking-wider`}>{a.registration_number}</td>
                    <td className={`px-4 py-3 text-sm ${styles.primaryText}`}>
                      {a.contact_number ? <span className="flex items-center"><FaPhone className="mr-1 text-gray-400 text-xs" />{a.contact_number}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-sm ${styles.primaryText}`}>{a.base_location}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-700'}`}>
                        {a.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(a)} className="text-blue-600 hover:text-blue-800 transition"><FaEdit /></button>
                          <button onClick={() => handleDelete(a.ambulance_id)} disabled={deletingId === a.ambulance_id} className="text-red-500 hover:text-red-700 transition disabled:opacity-40"><FaTrash /></button>
                        </div>
                      </td>
                    )}
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

export default AmbulanceMaster;
