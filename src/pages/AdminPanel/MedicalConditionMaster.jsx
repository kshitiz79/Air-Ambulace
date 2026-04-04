import React, { useState, useEffect } from 'react';
import {
  FaHeartbeat, FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaSyncAlt, FaExclamationTriangle, FaSearch, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

const CATEGORIES = ['Cardiac', 'Neurological', 'Trauma', 'Respiratory', 'Obstetric', 'Pediatric', 'Oncology', 'Renal', 'Other'];
const empty = { name: '', name_hi: '', category: '', is_active: true };

const MedicalConditionMaster = () => {
  const styles = useThemeStyles();
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('list');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/medical-conditions`, { headers });
      const data = await res.json();
      setList(data.data || []);
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(list.filter(c =>
      (catFilter === 'ALL' || c.category === catFilter) &&
      (c.name?.toLowerCase().includes(q) || c.name_hi?.includes(q))
    ));
  }, [search, catFilter, list]);

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      const url = editing ? `${baseUrl}/api/medical-conditions/${editing}` : `${baseUrl}/api/medical-conditions`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setSuccess(editing ? 'Updated successfully' : 'Added successfully');
      setForm(empty); setEditing(null); setTab('list');
      fetchList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, name_hi: c.name_hi || '', category: c.category || '', is_active: c.is_active });
    setEditing(c.id);
    setTab('form');
    setError(''); setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this condition?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/medical-conditions/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Deleted');
      fetchList();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (c) => {
    try {
      await fetch(`${baseUrl}/api/medical-conditions/${c.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ ...c, is_active: !c.is_active }),
      });
      fetchList();
    } catch {}
  };

  const handleCancel = () => { setForm(empty); setEditing(null); setTab('list'); setError(''); setSuccess(''); };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${styles.pageBackground}`}>
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6 px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${styles.primaryText} flex items-center`}>
              <FaHeartbeat className="mr-3 text-red-600" /> Medical Condition Master
            </h1>
            <p className={`${styles.secondaryText} text-sm mt-1`}>Manage medical conditions shown in the enquiry form dropdown</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setTab('list'); fetchList(); }} className="flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition">
              <FaSyncAlt className="mr-1" /> Refresh
            </button>
            <button onClick={() => { setForm(empty); setEditing(null); setTab('form'); setError(''); setSuccess(''); }} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">
              <FaPlus className="mr-2" /> Add Condition
            </button>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center text-sm"><FaExclamationTriangle className="mr-2" />{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>}

      {tab === 'form' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6 mb-6`}>
          <h2 className={`text-lg font-semibold ${styles.primaryText} mb-4`}>{editing ? 'Edit Condition' : 'Add Medical Condition'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Name (English) *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="e.g. Acute Myocardial Infarction" className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Name (Hindi)</label>
              <input name="name_hi" value={form.name_hi} onChange={handleChange}
                placeholder="e.g. तीव्र हृदयाघात" lang="hi" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${styles.secondaryText} mb-1 uppercase`}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={`w-full p-2.5 border rounded-lg text-sm ${styles.inputBackground}`}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 mr-2 text-blue-600" />
                <span className={`text-sm font-medium ${styles.primaryText}`}>Active (visible in dropdown)</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50">
                <FaSave className="mr-2" />{saving ? 'Saving...' : (editing ? 'Update' : 'Save')}
              </button>
              <button type="button" onClick={handleCancel} className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition">
                <FaTimes className="mr-2" /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor} flex flex-wrap items-center gap-3 justify-between`}>
          <h2 className={`font-semibold ${styles.primaryText}`}>Conditions ({filtered.length})</h2>
          <div className="flex gap-3">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className={`p-2 border rounded-lg text-sm ${styles.inputBackground}`}>
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className={`pl-8 pr-3 py-2 border rounded-lg text-sm ${styles.inputBackground} w-48`} />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center"><div className="animate-spin w-7 h-7 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div></div>
          ) : filtered.length === 0 ? (
            <div className={`p-8 text-center ${styles.secondaryText}`}><FaHeartbeat className="mx-auto text-4xl mb-3 text-gray-300" /><p>No conditions found.</p></div>
          ) : (
            <table className="min-w-full">
              <thead className={styles.tableHeader}>
                <tr>
                  {['Name (EN)', 'Name (HI)', 'Category', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                {filtered.map(c => (
                  <tr key={c.id} className={styles.tableRow}>
                    <td className={`px-4 py-3 text-sm font-medium ${styles.primaryText}`}>{c.name}</td>
                    <td className={`px-4 py-3 text-sm ${styles.primaryText}`} style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{c.name_hi || '—'}</td>
                    <td className="px-4 py-3">
                      {c.category ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{c.category}</span> : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(c)} className="flex items-center gap-1 text-sm">
                        {c.is_active
                          ? <><FaToggleOn className="text-green-500 text-xl" /><span className="text-green-700 text-xs">Active</span></>
                          : <><FaToggleOff className="text-gray-400 text-xl" /><span className="text-gray-500 text-xs">Inactive</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 transition"><FaEdit /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 transition"><FaTrash /></button>
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

export default MedicalConditionMaster;
