import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaHospital, FaPlus, FaList, FaEdit, FaTrash,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaFilter,
  FaSyncAlt, FaExclamationTriangle, FaChartBar,
  FaCheckCircle, FaTimesCircle, FaSearch, FaBed,
  FaGlobe, FaUsers,
} from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import baseUrl from '../../baseUrl/baseUrl';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const TYPE_COLORS = {
  GOVERNMENT: 'bg-blue-100 text-blue-800',
  PRIVATE: 'bg-green-100 text-green-800',
  TRUST: 'bg-purple-100 text-purple-800',
  CORPORATE: 'bg-orange-100 text-orange-800',
};

const EMPTY_FORM = {
  hospital_name: '', address: '', district_id: '', contact_number: '',
  email: '', hospital_type: 'GOVERNMENT', specialties: '',
  bed_capacity: '', emergency_services: true,
};

const HospitalManagement = () => {
  const styles = useThemeStyles();

  const [hospitals, setHospitals] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState({ type: 'ALL', district: 'ALL', search: '' });

  const [stats, setStats] = useState({
    total: 0, government: 0, private: 0, emergency: 0,
    byDistrict: [], byType: [],
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { applyFilter(); }, [hospitals, filter]);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [hRes, dRes, eRes] = await Promise.all([
        axios.get(`${baseUrl}/api/hospitals`, { headers: headers() }),
        axios.get(`${baseUrl}/api/districts`, { headers: headers() }),
        axios.get(`${baseUrl}/api/enquiries`, { headers: headers() }),
      ]);
      const h = hRes.data.data || hRes.data || [];
      const d = dRes.data.data || dRes.data || [];
      const e = eRes.data.data || [];
      setHospitals(h); setDistricts(d); setEnquiries(e);
      calcStats(h, d, e);
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  const calcStats = (h, d, e) => {
    const byDistrict = d.map(dist => ({
      name: dist.district_name,
      hospitals: h.filter(x => x.district_id === dist.district_id).length,
      enquiries: e.filter(x => x.district_id === dist.district_id).length,
    })).filter(x => x.hospitals > 0).sort((a, b) => b.hospitals - a.hospitals).slice(0, 8);

    const typeMap = {};
    h.forEach(x => { typeMap[x.hospital_type] = (typeMap[x.hospital_type] || 0) + 1; });
    const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    setStats({
      total: h.length,
      government: h.filter(x => x.hospital_type === 'GOVERNMENT').length,
      private: h.filter(x => x.hospital_type === 'PRIVATE').length,
      emergency: h.filter(x => x.emergency_services).length,
      byDistrict, byType,
    });
  };

  const applyFilter = () => {
    let f = hospitals;
    if (filter.type !== 'ALL') f = f.filter(h => h.hospital_type === filter.type);
    if (filter.district !== 'ALL') f = f.filter(h => String(h.district_id) === filter.district);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      f = f.filter(h =>
        h.hospital_name?.toLowerCase().includes(q) ||
        h.name?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q) ||
        h.contact_number?.includes(q)
      );
    }
    setFiltered(f);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM); setEditing(null); setError(''); setSuccess('');
  };

  const handleEdit = (h) => {
    setEditing(h.hospital_id);
    setForm({
      hospital_name: h.hospital_name || h.name || '',
      address: h.address || '',
      district_id: String(h.district_id || ''),
      contact_number: h.contact_number || '',
      email: h.email || '',
      hospital_type: h.hospital_type || 'GOVERNMENT',
      specialties: h.specialties || '',
      bed_capacity: String(h.bed_capacity || ''),
      emergency_services: h.emergency_services !== false,
    });
    setActiveTab('create');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = {
        ...form,
        bed_capacity: form.bed_capacity ? Number(form.bed_capacity) : null,
        district_id: Number(form.district_id),
      };
      if (editing) {
        await axios.put(`${baseUrl}/api/hospitals/${editing}`, payload, { headers: headers() });
        setSuccess('Hospital updated successfully!');
      } else {
        await axios.post(`${baseUrl}/api/hospitals`, payload, { headers: headers() });
        setSuccess('Hospital created successfully!');
      }
      resetForm(); fetchData(); setActiveTab('list');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save hospital');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${baseUrl}/api/hospitals/${id}`, { headers: headers() });
      setSuccess('Hospital deleted successfully!'); fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setDeletingId(null);
    }
  };

  const getDistrictName = (id) => districts.find(d => d.district_id === id)?.district_name || '—';

  const barData = {
    labels: stats.byDistrict.map(d => d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name),
    datasets: [
      { label: 'Hospitals', data: stats.byDistrict.map(d => d.hospitals), backgroundColor: 'rgba(59,130,246,0.8)', borderColor: '#3B82F6', borderWidth: 1 },
      { label: 'Enquiries', data: stats.byDistrict.map(d => d.enquiries), backgroundColor: 'rgba(16,185,129,0.8)', borderColor: '#10B981', borderWidth: 1 },
    ],
  };

  const doughnutData = {
    labels: stats.byType.map(t => t.type),
    datasets: [{
      data: stats.byType.map(t => t.count),
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
      borderColor: ['#2563EB', '#059669', '#7C3AED', '#D97706'],
      borderWidth: 2,
    }],
  };

  if (loading && hospitals.length === 0) {
    return (
      <div className={`w-full p-6 ${styles.pageBackground}`}>
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-8`}>
          <div className="animate-pulse space-y-4">
            <div className={`h-8 ${styles.loadingShimmer} rounded`}></div>
            <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className={`h-24 ${styles.loadingShimmer} rounded`}></div>)}</div>
            <div className={`h-64 ${styles.loadingShimmer} rounded`}></div>
          </div>
          <p className={`text-center ${styles.secondaryText} mt-4`}>Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 ${styles.pageBackground}`}>
      {/* Header */}
      <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} mb-6`}>
        <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${styles.primaryText} flex items-center`}>
                <FaHospital className="mr-3 text-blue-600" /> Hospital Management
              </h1>
              <p className={`${styles.secondaryText} mt-1`}>Manage hospitals and healthcare facilities</p>
            </div>
            <button onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              <FaSyncAlt className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            {[
              { key: 'list', icon: <FaList className="inline mr-2" />, label: `Hospital List (${filtered.length})` },
              { key: 'create', icon: <FaPlus className="inline mr-2" />, label: editing ? 'Edit Hospital' : 'Add Hospital' },
              { key: 'analytics', icon: <FaChartBar className="inline mr-2" />, label: 'Analytics' },
            ].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key !== 'create') resetForm(); }}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${activeTab === tab.key ? 'bg-blue-600 text-white' : `${styles.secondaryText} hover:bg-gray-100`}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200 flex items-center"><FaExclamationTriangle className="mr-2" />{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">{success}</div>}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Hospitals', value: stats.total, color: 'from-blue-500 to-blue-600', icon: <FaHospital className="text-2xl" />, bg: 'bg-blue-400' },
          { label: 'Government', value: stats.government, color: 'from-green-500 to-green-600', icon: <FaMapMarkerAlt className="text-2xl" />, bg: 'bg-green-400' },
          { label: 'Private', value: stats.private, color: 'from-purple-500 to-purple-600', icon: <FaUsers className="text-2xl" />, bg: 'bg-purple-400' },
          { label: 'Emergency Services', value: stats.emergency, color: 'from-red-500 to-red-600', icon: <FaCheckCircle className="text-2xl" />, bg: 'bg-red-400' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-r ${s.color} rounded-lg shadow-sm p-5 text-white`}>
            <div className="flex items-center justify-between">
              <div><p className="text-white/80 text-xs font-medium">{s.label}</p><p className="text-3xl font-bold">{s.value}</p></div>
              <div className={`${s.bg} bg-opacity-30 rounded-full p-3`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center mb-4`}>
              <FaChartBar className="mr-2 text-blue-600" /> Hospitals by District
            </h2>
            <div className="h-64">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-6`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText} flex items-center mb-4`}>
              <FaGlobe className="mr-2 text-green-600" /> Hospitals by Type
            </h2>
            <div className="h-64">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <>
          {/* Filters */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow} p-4 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Type</label>
                <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}>
                  <option value="ALL">All Types</option>
                  {['GOVERNMENT','PRIVATE','TRUST','CORPORATE'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>District</label>
                <select value={filter.district} onChange={e => setFilter({ ...filter, district: e.target.value })}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}>
                  <option value="ALL">All Districts</option>
                  {districts.map(d => <option key={d.district_id} value={String(d.district_id)}>{d.district_name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.secondaryText} mb-1`}>Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })}
                    placeholder="Search hospitals..." className={`w-full pl-8 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
            <div className={`px-6 py-4 border-b ${styles.borderColor} flex items-center justify-between`}>
              <h2 className={`text-xl font-semibold ${styles.primaryText}`}>Hospital List ({filtered.length})</h2>
              <button onClick={() => { resetForm(); setActiveTab('create'); }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                <FaPlus className="mr-2" /> Add Hospital
              </button>
            </div>
            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className={`p-8 text-center ${styles.secondaryText}`}>
                  <FaHospital className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No hospitals found matching the current filters.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className={styles.tableHeader}>
                    <tr>
                      {['Hospital Name','Type','District','Contact','Beds','Emergency','Actions'].map(h => (
                        <th key={h} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.secondaryText}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`${styles.tableBody} divide-y ${styles.borderColor}`}>
                    {filtered.map(h => (
                      <tr key={h.hospital_id} className={styles.tableRow}>
                        <td className={`px-6 py-4 ${styles.primaryText}`}>
                          <div className="flex items-center">
                            <FaHospital className="text-blue-500 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{h.hospital_name || h.name}</p>
                              {h.address && <p className={`text-xs ${styles.secondaryText} truncate max-w-[200px]`}>{h.address}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[h.hospital_type] || 'bg-gray-100 text-gray-700'}`}>
                            {h.hospital_type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          <div className="flex items-center"><FaMapMarkerAlt className="text-gray-400 mr-2" />{getDistrictName(h.district_id)}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          {h.contact_number
                            ? <div className="flex items-center"><FaPhone className="text-gray-400 mr-2" />{h.contact_number}</div>
                            : <span className="text-gray-400 text-xs italic">—</span>}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${styles.primaryText}`}>
                          {h.bed_capacity
                            ? <div className="flex items-center"><FaBed className="text-gray-400 mr-2" />{h.bed_capacity}</div>
                            : <span className="text-gray-400 text-xs italic">—</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {h.emergency_services
                            ? <span className="flex items-center text-green-600 text-xs font-semibold"><FaCheckCircle className="mr-1" />Yes</span>
                            : <span className="flex items-center text-red-500 text-xs font-semibold"><FaTimesCircle className="mr-1" />No</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button onClick={() => handleEdit(h)} className="text-blue-600 hover:text-blue-900 flex items-center">
                              <FaEdit className="mr-1" /> Edit
                            </button>
                            <button onClick={() => handleDelete(h.hospital_id)} disabled={deletingId === h.hospital_id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center">
                              <FaTrash className="mr-1" />{deletingId === h.hospital_id ? 'Deleting…' : 'Delete'}
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
        </>
      )}

      {/* Create / Edit Tab */}
      {activeTab === 'create' && (
        <div className={`${styles.cardBackground} rounded-lg ${styles.cardShadow}`}>
          <div className={`px-6 py-4 border-b ${styles.borderColor}`}>
            <h2 className={`text-xl font-semibold ${styles.primaryText}`}>{editing ? 'Edit Hospital' : 'Add New Hospital'}</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Hospital Name *</label>
                  <input type="text" value={form.hospital_name} required
                    onChange={e => setForm({ ...form, hospital_name: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter hospital name" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Hospital Type *</label>
                  <select value={form.hospital_type} required
                    onChange={e => setForm({ ...form, hospital_type: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}>
                    {['GOVERNMENT','PRIVATE','TRUST','CORPORATE'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>District *</label>
                  <select value={form.district_id} required
                    onChange={e => setForm({ ...form, district_id: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}>
                    <option value="">-- Select District --</option>
                    {districts.map(d => <option key={d.district_id} value={String(d.district_id)}>{d.district_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Contact Number</label>
                  <input type="tel" value={form.contact_number}
                    onChange={e => setForm({ ...form, contact_number: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter contact number" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter email address" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Bed Capacity</label>
                  <input type="number" min="0" value={form.bed_capacity}
                    onChange={e => setForm({ ...form, bed_capacity: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground}`}
                    placeholder="Enter bed capacity" />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Address *</label>
                  <textarea rows={2} value={form.address} required
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground} resize-none`}
                    placeholder="Enter hospital address" />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${styles.secondaryText} mb-2`}>Specialties</label>
                  <textarea rows={2} value={form.specialties}
                    onChange={e => setForm({ ...form, specialties: e.target.value })}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${styles.inputBackground} resize-none`}
                    placeholder="e.g. Cardiology, Neurology..." />
                </div>
                <div className="flex items-center pt-6">
                  <input type="checkbox" id="emergency_services" checked={form.emergency_services}
                    onChange={e => setForm({ ...form, emergency_services: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="emergency_services" className={`ml-2 text-sm font-medium ${styles.primaryText}`}>
                    Emergency Services Available
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => { resetForm(); setActiveTab('list'); }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center">
                  {saving
                    ? <><span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>Saving…</>
                    : (editing ? 'Update Hospital' : 'Add Hospital')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManagement;
